import 'dart:convert';
import 'dart:io';

import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:airqo/src/app/auth/repository/social_auth_repository.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
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
  });
}
