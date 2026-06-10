import 'dart:convert';

import 'package:airqo/src/app/auth/services/auth_token_storage.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
  });

  group('AuthTokenStorage.sanitizeToken', () {
    // My current hypothesis is that auth persistence can look flaky if the app
    // stores transport-style token prefixes like "Bearer" or "JWT" instead of
    // the raw JWT itself. This test isolates the cleanup step first, so we can
    // prove the storage helper normalizes those prefixed values before we move
    // on to saving tokens and extracting user IDs.
    //
    // If this test passes, we have confirmed that prefixed token strings are
    // reduced to the raw token value in a stable way.
    test('removes auth scheme prefixes and surrounding whitespace', () {
      final sanitized = AuthTokenStorage.sanitizeToken(
        '  Bearer JWT fresh-token-value  ',
      );

      expect(sanitized, 'fresh-token-value');
    });
  });

  group('AuthTokenStorage.saveAuthToken', () {
    // The next thing we need to know is whether normalized token strings are
    // actually what land in secure storage. If this step writes the cleaned
    // token value, later auth checks are at least reading a sane stored token
    // rather than a transport-formatted one.
    test('saves the sanitized token value to secure storage', () async {
      await AuthTokenStorage.saveAuthToken('  JWT stored-token-value  ');

      final storedToken = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);

      expect(storedToken, 'stored-token-value');
    });

    // A stored auth token is only part of the session picture. This helper is
    // also responsible for pulling the user identity out of the JWT so later
    // parts of the app can treat the restored session as a real logged-in
    // user, not just an opaque token string.
    test('extracts and stores the user ID when saving a valid auth token',
        () async {
      final token = _jwtToken(
        userId: 'user-1',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
      );

      await AuthTokenStorage.saveAuthToken(token);

      final storedToken = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);
      final storedUserId = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.userId);

      expect(storedToken, token);
      expect(storedUserId, 'user-1');
    });
  });

  group('AuthTokenStorage.saveTokenFromHeaders', () {
    // This is the bridge between repository success responses and persisted
    // session state. If a refreshed token arrives in response headers, this
    // helper should store it in the same cleaned, usable form as a directly
    // saved auth token.
    test('stores the refreshed token and user ID from the x-access-token header',
        () async {
      final token = _jwtToken(
        userId: 'user-1',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
      );

      await AuthTokenStorage.saveTokenFromHeaders({
        'x-access-token': '  Bearer $token  ',
      });

      final storedToken = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);
      final storedUserId = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.userId);

      expect(storedToken, token);
      expect(storedUserId, 'user-1');
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
