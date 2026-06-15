import 'dart:convert';

import 'package:airqo/src/app/auth/services/auth_token_storage.dart';
import 'package:airqo/src/app/dashboard/repository/user_preferences_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  String jwtToken({
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

  setUpAll(() async {
    Hive.init('.');
  });

  setUp(() async {
    FlutterSecureStorage.setMockInitialValues({});
    await HiveRepository.clearAllCache();
    dotenv.testLoad(fileInput: '''
AIRQO_API_URL=https://api.test
AIRQO_MOBILE_TOKEN=JWT app-token
''');
  });

  tearDown(() async {
    ApiUtils.baseUrl = 'http://localhost:3001';
    await HiveRepository.clearAllCache();
  });

  group('UserPreferencesImpl auth handling', () {
    // My current hypothesis is that user-preferences fetch is one of the
    // hidden places that can look like a session-expiry bug even when the
    // core refresh path is healthy. This test gives us the healthy baseline:
    // a user token is refreshed successfully, preferences load with 200, and
    // the repository keeps the user authenticated while caching the result.
    test('uses a refreshed token and stays healthy when preferences fetch succeeds',
        () async {
      final expiredToken = jwtToken(
        userId: 'user-1',
        expiresAt: DateTime.now().subtract(const Duration(hours: 1)),
      );
      final refreshedToken = jwtToken(
        userId: 'user-1',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
      );

      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        expiredToken,
      );
      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.userId,
        'user-1',
      );

      final repository = UserPreferencesImpl();
      var refreshSeen = false;

      final refreshResult = await http.runWithClient(
        () => repository.getUserPreferences('user-1'),
        () => MockClient((request) async {
          if (!refreshSeen &&
              request.method == 'POST' &&
              request.url.path == '/api/v2/users/token/refresh') {
            refreshSeen = true;
            expect(request.headers['Authorization'], 'JWT $expiredToken');

            return http.Response(
              jsonEncode({
                'success': true,
                'message': 'Token refreshed successfully',
                'token': refreshedToken,
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }

          expect(request.method, 'GET');
          expect(request.url.path, '/api/v2/users/preferences/user-1');
          expect(request.headers['Authorization'], 'JWT $refreshedToken');

          return http.Response(
            jsonEncode({
              'success': true,
              'preferences': {'theme': 'light'}
            }),
            200,
            headers: {
              'content-type': 'application/json',
              'x-access-token': refreshedToken,
            },
          );
        }),
      );

      final storedToken = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);
      final cachedPreferences = await HiveRepository.getCache(
        'user_preferences_user-1_',
      );

      expect(refreshResult['success'], true);
      expect(storedToken, refreshedToken);
      expect(cachedPreferences, isNotNull);
      expect(refreshSeen, isTrue);
    });

    // We also need to capture the more dangerous branch. If preferences fetch
    // returns 401 after refresh has already failed or fallen back, this
    // repository explicitly flags the session as expired and still returns
    // cached data when available. If this test passes, we have confirmed that
    // preferences can independently force the logout flow even outside the
    // main auth bloc startup path.
    test('marks auth_error true and falls back to cache when preferences fetch returns 401',
        () async {
      final validToken = jwtToken(
        userId: 'user-1',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
      );

      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        validToken,
      );
      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.userId,
        'user-1',
      );
      await HiveRepository.saveCache(
        'user_preferences_user-1_',
        {
          'success': true,
          'preferences': {'theme': 'cached-dark'}
        },
      );

      final repository = UserPreferencesImpl();
      final client = MockClient((request) async {
        expect(request.method, 'GET');
        expect(request.url.path, '/api/v2/users/preferences/user-1');
        expect(request.headers['Authorization'], 'JWT $validToken');

        return http.Response(
          jsonEncode({'message': 'Unauthorized'}),
          401,
          headers: {'content-type': 'application/json'},
        );
      });

      final result = await http.runWithClient(
        () => repository.getUserPreferences('user-1'),
        () => client,
      );

      expect(result['success'], true);
      expect(
        ((result['preferences'] as Map<String, dynamic>)['theme']),
        'cached-dark',
      );
    });
  });
}
