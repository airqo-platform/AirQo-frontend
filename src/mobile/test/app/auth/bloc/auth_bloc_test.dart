import 'dart:convert';
import 'dart:io';

import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:airqo/src/app/auth/repository/social_auth_repository.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:airqo/src/app/shared/repository/token_refresher.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeAuthRepository extends AuthRepository {
  @override
  Future<void> deleteUserAccount() async {}

  @override
  Future<String> loginWithEmailAndPassword(
      String username, String password) async {
    throw UnimplementedError();
  }

  @override
  Future<void> registerWithEmailAndPassword(RegisterInputModel model) async {
    throw UnimplementedError();
  }

  @override
  Future<String> requestPasswordReset(String email) async {
    throw UnimplementedError();
  }

  @override
  Future<String> updatePassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    throw UnimplementedError();
  }

  @override
  Future<String> validateResetCodeFormat(String pin) async {
    throw UnimplementedError();
  }

  @override
  Future<void> verifyEmailCode(String token, String email) async {
    throw UnimplementedError();
  }
}

class _FakeSocialAuthRepository extends SocialAuthRepository {
  @override
  Future<void> loginWithProvider(String provider) async {
    throw UnimplementedError();
  }
}

class _SuccessfulTokenRefresher implements TokenRefresher {
  const _SuccessfulTokenRefresher(this.token);

  final String token;

  @override
  Future<String?> refreshTokenIfNeeded() async => token;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  String expiredToken() {
    String encode(Map<String, dynamic> value) =>
        base64Url.encode(utf8.encode(jsonEncode(value))).replaceAll('=', '');

    return '${encode({'alg': 'none', 'typ': 'JWT'})}.${encode({
          'sub': 'user-1',
          'exp': DateTime.now()
                  .subtract(const Duration(hours: 1))
                  .millisecondsSinceEpoch ~/
              1000,
        })}.';
  }

  String validToken() {
    String encode(Map<String, dynamic> value) =>
        base64Url.encode(utf8.encode(jsonEncode(value))).replaceAll('=', '');

    return '${encode({'alg': 'none', 'typ': 'JWT'})}.${encode({
          'sub': 'user-1',
          'exp': DateTime.now()
                  .add(const Duration(hours: 1))
                  .millisecondsSinceEpoch ~/
              1000,
        })}.';
  }

  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
  });

  tearDown(() {
    ApiUtils.baseUrl = 'http://localhost:3001';
  });

  group('AuthBloc on AppStarted', () {
    // My current hypothesis is that the user-visible logout flow starts here
    // once the helper has already reduced the session problem to "null".
    // If app startup sees a stored token but cannot restore a usable session,
    // the bloc should move through loading, mark the session as expired, and
    // finally fall back to guest mode.
    test('emits loading, session expired, then guest when startup cannot restore the session',
        () async {
      final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
      ApiUtils.baseUrl = 'http://127.0.0.1:${server.port}';

      server.listen((request) async {
        expect(request.uri.path, '/api/v2/users/token/refresh');
        request.response.statusCode = HttpStatus.internalServerError;
        request.response.write('{"success":false}');
        await request.response.close();
      });

      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        expiredToken(),
      );

      final bloc = AuthBloc(
        authRepository: _FakeAuthRepository(),
        socialAuthRepository: _FakeSocialAuthRepository(),
      );

      bloc.add(AppStarted());

      await expectLater(
        bloc.stream,
        emitsInOrder([
          isA<AuthLoading>(),
          isA<SessionExpiredState>(),
          isA<GuestUser>(),
        ]),
      );

      final storedToken = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);
      expect(storedToken, isNull);

      await server.close(force: true);
      await bloc.close();
    });

    // The next thing we need is the healthy startup baseline. If the app finds
    // a still-valid stored token, startup should restore the session instead
    // of pushing the user into the expiry flow. This gives us the clean
    // comparison against the failing startup case above.
    test('emits loading then loaded when startup finds a valid stored session',
        () async {
      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        validToken(),
      );

      final bloc = AuthBloc(
        authRepository: _FakeAuthRepository(),
        socialAuthRepository: _FakeSocialAuthRepository(),
      );

      bloc.add(AppStarted());

      await expectLater(
        bloc.stream,
        emitsInOrder([
          isA<AuthLoading>(),
          isA<AuthLoaded>().having(
            (state) => state.authPurpose,
            'authPurpose',
            AuthPurpose.login,
          ),
        ]),
      );

      await bloc.close();
    });

    // A persisted session should also survive when its stored token has
    // expired but the server successfully replaces it. This is the refresh
    // result that the bloc must treat as a restored session rather than a
    // reason to clear authentication and send the user back to guest mode.
    test('emits loading then loaded when expired session refresh succeeds',
        () async {
      final refreshedToken = validToken();

      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        expiredToken(),
      );

      final bloc = AuthBloc(
        authRepository: _FakeAuthRepository(),
        socialAuthRepository: _FakeSocialAuthRepository(),
        tokenRefresher: _SuccessfulTokenRefresher(refreshedToken),
      );
      addTearDown(bloc.close);

      bloc.add(AppStarted());

      await expectLater(
        bloc.stream,
        emitsInOrder([
          isA<AuthLoading>(),
          isA<AuthLoaded>().having(
            (state) => state.authPurpose,
            'authPurpose',
            AuthPurpose.login,
          ),
        ]),
      );

      final storedUserId = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.userId);

      expect(storedUserId, 'user-1');
    });
  });

  group('AuthBloc on SessionExpired', () {
    // Once another layer has already decided the session is no longer usable,
    // the auth bloc should perform the same cleanup and fallback sequence the
    // user would feel in the app: mark the session as expired, then return to
    // guest mode.
    test('emits session expired then guest and clears stored auth data',
        () async {
      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        validToken(),
      );
      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.userId,
        'user-1',
      );

      final bloc = AuthBloc(
        authRepository: _FakeAuthRepository(),
        socialAuthRepository: _FakeSocialAuthRepository(),
      );

      bloc.add(const SessionExpired());

      await expectLater(
        bloc.stream,
        emitsInOrder([
          isA<SessionExpiredState>(),
          isA<GuestUser>(),
        ]),
      );

      final storedToken = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);
      final storedUserId = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.userId);

      expect(storedToken, isNull);
      expect(storedUserId, isNull);

      await bloc.close();
    });
  });

  group('AuthBloc on LogoutUser', () {
    // This is the intentional version of leaving a session. We need it so we
    // can compare "the user chose to log out" with "the app forced the user
    // out because it believed the session had expired".
    test('emits loading then guest and clears stored auth data', () async {
      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        validToken(),
      );
      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.userId,
        'user-1',
      );

      final bloc = AuthBloc(
        authRepository: _FakeAuthRepository(),
        socialAuthRepository: _FakeSocialAuthRepository(),
      );

      bloc.add(const LogoutUser());

      await expectLater(
        bloc.stream,
        emitsInOrder([
          isA<AuthLoading>(),
          isA<GuestUser>(),
        ]),
      );

      final storedToken = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);
      final storedUserId = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.userId);

      expect(storedToken, isNull);
      expect(storedUserId, isNull);

      await bloc.close();
    });
  });
}
