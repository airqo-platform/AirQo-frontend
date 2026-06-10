import 'dart:convert';

import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:airqo/src/app/shared/exceptions/session_expired_exception.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/session_expiry_notifier.dart';
import 'package:airqo/src/app/shared/repository/token_refresher.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

class _FakeTokenRefresher implements TokenRefresher {
  const _FakeTokenRefresher(this.token);

  final String? token;

  @override
  Future<String?> refreshTokenIfNeeded() async => token;
}

class _RecordingSessionExpiryNotifier implements SessionExpiryNotifier {
  int notifications = 0;

  @override
  void notifySessionExpired() {
    notifications += 1;
  }
}

void main() {
  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
  });

  tearDown(() {
    ApiUtils.baseUrl = 'http://localhost:3001';
  });

  group('BaseRepository authenticated response handling', () {
    // My current hypothesis is that repository-level 401 handling is the other
    // major path that can force the user out. For GET requests, the repository
    // is trying to distinguish "the user's JWT is bad" from unrelated 401s.
    // If the body clearly looks like a token/session problem, it should notify
    // session expiry and throw the dedicated exception.
    //
    // If this test passes, we have confirmed that a session-like 401 body is
    // intentionally treated as a forced logout signal at the repository layer.
    test('notifies session expiry and throws when a GET request returns a session-like 401 body',
        () async {
      const token = 'valid-token';
      final notifier = _RecordingSessionExpiryNotifier();
      final repository = BaseRepository(
        tokenRefresher: const _FakeTokenRefresher(token),
        sessionExpiryNotifier: notifier,
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

      await expectLater(
        () => http.runWithClient(
          () => repository.createGetRequest('/test', const {}),
          () => client,
        ),
        throwsA(isA<SessionExpiredException>()),
      );

      expect(notifier.notifications, 1);
    });

    // The repository is also trying to avoid false logouts. Some GET requests
    // can return 401 for reasons that are not really about the user's session,
    // so a body that does not look JWT- or session-related should stay a
    // normal request failure instead of escalating into a session-expired flow.
    test('does not notify session expiry when a GET request returns an unrelated 401 body',
        () async {
      const token = 'valid-token';
      final notifier = _RecordingSessionExpiryNotifier();
      final repository = BaseRepository(
        tokenRefresher: const _FakeTokenRefresher(token),
        sessionExpiryNotifier: notifier,
      );
      final client = MockClient((request) async {
        expect(request.method, 'GET');
        expect(request.url.path, '/test');
        expect(request.headers['Authorization'], 'JWT $token');

        return http.Response(
          jsonEncode({'message': 'API key missing'}),
          401,
          headers: {'content-type': 'application/json'},
        );
      });

      ApiUtils.baseUrl = 'https://api.test';

      await expectLater(
        () => http.runWithClient(
          () => repository.createGetRequest('/test', const {}),
          () => client,
        ),
        throwsA(
          predicate(
            (error) =>
                error is Exception &&
                error.toString().contains('API key missing') &&
                error is! SessionExpiredException,
          ),
        ),
      );

      expect(notifier.notifications, 0);
    });

    // Successful authenticated responses can quietly deliver a replacement
    // token in the response headers. The repository should persist that token
    // so later requests keep using the refreshed session instead of falling
    // back to stale credentials.
    test('stores the refreshed token from a successful response header',
        () async {
      const oldToken = 'old-token';
      final refreshedToken = _jwtToken(
        userId: 'user-1',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
      );
      final notifier = _RecordingSessionExpiryNotifier();
      final repository = BaseRepository(
        tokenRefresher: const _FakeTokenRefresher(oldToken),
        sessionExpiryNotifier: notifier,
      );
      final client = MockClient((request) async {
        expect(request.method, 'GET');
        expect(request.url.path, '/test');
        expect(request.headers['Authorization'], 'JWT $oldToken');

        return http.Response(
          jsonEncode({'success': true}),
          200,
          headers: {
            'content-type': 'application/json',
            'x-access-token': refreshedToken,
          },
        );
      });

      ApiUtils.baseUrl = 'https://api.test';

      final response = await http.runWithClient(
        () => repository.createAuthenticatedGetRequest('/test', const {}),
        () => client,
      );

      final storedToken = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);
      final storedUserId = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.userId);

      expect(response.statusCode, 200);
      expect(storedToken, refreshedToken);
      expect(storedUserId, 'user-1');
      expect(notifier.notifications, 0);
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
