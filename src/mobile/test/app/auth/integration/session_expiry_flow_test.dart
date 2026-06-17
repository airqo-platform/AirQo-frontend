import 'dart:convert';

import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:airqo/src/app/auth/repository/social_auth_repository.dart';
import 'package:airqo/src/app/shared/exceptions/session_expired_exception.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/global_auth_manager.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:airqo/src/app/shared/repository/token_refresher.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

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

class _FakeTokenRefresher implements TokenRefresher {
  const _FakeTokenRefresher(this.token);

  final String token;

  @override
  Future<String?> refreshTokenIfNeeded() async => token;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
    GlobalAuthManager.instance.resetSessionExpiredGuard();
  });

  tearDown(() {
    ApiUtils.baseUrl = 'http://localhost:3001';
  });

  group('session expiry integration flow', () {
    // My current hypothesis is that one of the real forced-logout paths is:
    // repository GET receives a session-like 401, the global auth manager
    // raises SessionExpired, and the auth bloc clears stored auth data before
    // returning the app to guest mode. This test wires those layers together
    // so we can verify that the same chain happens as one end-to-end flow.
    test('session-like 401 from repository triggers bloc expiry cleanup and guest fallback',
        () async {
      final token = _jwtToken(
        userId: 'user-1',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
      );

      await SecureStorageRepository.instance
          .saveSecureData(SecureStorageKeys.authToken, token);
      await SecureStorageRepository.instance
          .saveSecureData(SecureStorageKeys.userId, 'user-1');

      final bloc = AuthBloc(
        authRepository: _FakeAuthRepository(),
        socialAuthRepository: _FakeSocialAuthRepository(),
      );
      addTearDown(bloc.close);
      GlobalAuthManager.instance.setAuthBloc(bloc);

      final repository = BaseRepository(
        tokenRefresher: _FakeTokenRefresher(token),
      );
      final client = MockClient((request) async {
        expect(request.method, 'GET');
        expect(request.url.path, '/test');
        expect(request.headers['Authorization'], 'JWT $token');

        return http.Response(
          jsonEncode({'message': 'Token expired'}),
          401,
          headers: {'content-type': 'application/json'},
        );
      });

      ApiUtils.baseUrl = 'https://api.test';

      final futureStates = expectLater(
        bloc.stream,
        emitsInOrder([
          isA<SessionExpiredState>(),
          isA<GuestUser>(),
        ]),
      );

      await expectLater(
        () => http.runWithClient(
          () => repository.createGetRequest('/test', const {}),
          () => client,
        ),
        throwsA(isA<SessionExpiredException>()),
      );

      await futureStates;

      final storedToken = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);
      final storedUserId = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.userId);

      expect(storedToken, isNull);
      expect(storedUserId, isNull);
    });
  });
}

String _jwtToken({
  required String userId,
  required DateTime expiresAt,
}) {
  String encode(Map<String, dynamic> value) =>
      base64Url.encode(utf8.encode(jsonEncode(value))).replaceAll('=', '');

  return '${encode({'alg': 'none', 'typ': 'JWT'})}.${encode({
        'sub': userId,
        'exp': expiresAt.millisecondsSinceEpoch ~/ 1000,
      })}.';
}
