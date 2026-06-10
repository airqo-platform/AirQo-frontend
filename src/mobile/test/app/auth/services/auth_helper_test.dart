import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

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

  group('AuthHelper.refreshTokenIfNeeded', () {
    // My current hypothesis is that unexpected logout begins here:
    // when the app resumes with an expired stored token, it tries to refresh
    // that token before restoring the session. If the refresh call fails,
    // the helper returns null, and higher layers may interpret that as
    // "the session has expired" and send the user back to the welcome screen.
    // This test isolates that first signal so we can prove the behavior before
    // checking how the bloc and lifecycle code react to it.
    // Confirmed by this passing test: a hard refresh failure returns null.
    test('returns null when expired token refresh fails', () async {
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

      final token = await AuthHelper.refreshTokenIfNeeded();

      expect(token, isNull);

      await server.close(force: true);
    });

    // My next hypothesis is that a temporary network stall can produce the
    // same first signal as a hard refresh failure: the token is expired, the
    // app asks the server for a replacement, the request takes too long, and
    // the helper returns null. If that happens, higher layers may not be able
    // to distinguish "the session is truly dead" from "refresh timed out on
    // resume", which is exactly the kind of confusion we are investigating.
    // Confirmed by this passing test: a refresh timeout also returns null.
    test('returns null when expired token refresh times out', () async {
      final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
      ApiUtils.baseUrl = 'http://127.0.0.1:${server.port}';

      server.listen((request) async {
        expect(request.uri.path, '/api/v2/users/token/refresh');
        await Future<void>.delayed(const Duration(seconds: 11));
        request.response.statusCode = HttpStatus.ok;
        request.response.write('{"success":true,"token":"fresh-token"}');
        await request.response.close();
      });

      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        expiredToken(),
      );

      final token = await AuthHelper.refreshTokenIfNeeded();

      expect(token, isNull);

      await server.close(force: true);
    });

    // Before we move up to bloc and lifecycle behavior, we need to confirm the
    // normal path is calm: if the stored token is still valid, the helper
    // should simply give that token back instead of trying to refresh it.
    // This matters because it tells us whether the bug only begins once the
    // token is already expired, or whether even a healthy stored session is at
    // risk. Confirmed by this passing test: a valid token is returned as-is.
    test('returns the existing token when it is still valid', () async {
      final token = validToken();

      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        token,
      );

      final result = await AuthHelper.refreshTokenIfNeeded();

      expect(result, token);
    });

    // Another part of my investigation is whether ordinary mobile network
    // problems collapse into the exact same helper output as a real refresh
    // failure. If an expired token cannot be refreshed because the network is
    // unavailable, higher layers may still just see null and treat that as a
    // dead session. Confirmed by this passing test: a network-level refresh
    // failure also returns null.
    test('returns null when expired token refresh hits a network error',
        () async {
      ApiUtils.baseUrl = 'http://127.0.0.1:1';

      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        expiredToken(),
      );

      final token = await AuthHelper.refreshTokenIfNeeded();

      expect(token, isNull);
    });

    // We also need to know whether broken token data follows the same path as
    // true expiry problems. If secure storage contains something that is not a
    // valid JWT, the helper should fail in a stable way instead of crashing or
    // producing ambiguous state. Confirmed by this passing test: a malformed
    // stored token is handled by returning null.
    test('returns null when the stored token is malformed', () async {
      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        'not-a-jwt',
      );

      final token = await AuthHelper.refreshTokenIfNeeded();

      expect(token, isNull);
    });
  });
}
