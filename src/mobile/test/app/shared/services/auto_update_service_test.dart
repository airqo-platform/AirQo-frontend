import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:airqo/src/app/shared/services/auto_update_service.dart';

@GenerateMocks([
  http.Client,
  PackageInfo,
  SharedPreferences,
])
import 'auto_update_service_test.mocks.dart';

void main() {
  group('AutoUpdateService', () {
    late AutoUpdateService service;
    late MockClient mockHttpClient;
    late MockPackageInfo mockPackageInfo;
    late MockSharedPreferences mockPrefs;
    late GlobalKey<NavigatorState> navigatorKey;
    late Map<String, dynamic> prefsStorage;

    const String playStoreHtmlWithJsonVersion = '''
      <!DOCTYPE html>
      <html>
        <head><title>Test App - Apps on Google Play</title></head>
        <body>
          <script>
            window.APP_DATA = {"versionName": "2.1.0", "appId": "com.test.app"};
          </script>
          <div>Other content</div>
        </body>
      </html>
    ''';

    const String playStoreHtmlWithCurrentVersion = '''
      <!DOCTYPE html>
      <html>
        <head><title>Test App - Apps on Google Play</title></head>
        <body>
          <div class="version-info">
            <span>Current Version</span>
            <span class="version-number">2.1.0</span>
          </div>
        </body>
      </html>
    ''';

    const String playStoreHtmlWithScriptVersion = '''
      <!DOCTYPE html>
      <html>
        <head><title>Test App - Apps on Google Play</title></head>
        <body>
          <script type="application/json">
            {
              "version": "2.1.0",
              "appDetails": {"name": "Test App"}
            }
          </script>
        </body>
      </html>
    ''';

    const String playStoreHtmlWithGeneralPattern = '''
      <!DOCTYPE html>
      <html>
        <head><title>Test App - Apps on Google Play</title></head>
        <body>
          <div>App version 2.1.0 is now available for download</div>
          <p>Latest version: 2.1.0</p>
        </body>
      </html>
    ''';

    const String playStoreHtmlNoVersion = '''
      <!DOCTYPE html>
      <html>
        <head><title>Test App - Apps on Google Play</title></head>
        <body>
          <div>Some content without version information</div>
          <p>Download the latest app from Google Play</p>
        </body>
      </html>
    ''';

    setUp(() {
      mockHttpClient = MockClient();
      mockPackageInfo = MockPackageInfo();
      mockPrefs = MockSharedPreferences();
      navigatorKey = GlobalKey<NavigatorState>();
      prefsStorage = <String, dynamic>{};

      when(mockPackageInfo.version).thenReturn('1.0.0');
      when(mockPackageInfo.packageName).thenReturn('com.test.app');

      // Set up SharedPreferences mocks with persistent storage
      when(mockPrefs.getInt(any)).thenAnswer((invocation) {
        final key = invocation.positionalArguments[0] as String;
        return prefsStorage[key] as int?;
      });

      when(mockPrefs.getString(any)).thenAnswer((invocation) {
        final key = invocation.positionalArguments[0] as String;
        return prefsStorage[key] as String?;
      });

      when(mockPrefs.setInt(any, any)).thenAnswer((invocation) async {
        final key = invocation.positionalArguments[0] as String;
        final value = invocation.positionalArguments[1] as int;
        prefsStorage[key] = value;
        return true;
      });

      when(mockPrefs.setString(any, any)).thenAnswer((invocation) async {
        final key = invocation.positionalArguments[0] as String;
        final value = invocation.positionalArguments[1] as String;
        prefsStorage[key] = value;
        return true;
      });

      when(mockPrefs.remove(any)).thenAnswer((invocation) async {
        final key = invocation.positionalArguments[0] as String;
        prefsStorage.remove(key);
        return true;
      });

      service = AutoUpdateService.test(
        httpClient: mockHttpClient,
        packageInfo: mockPackageInfo,
        sharedPreferences: mockPrefs,
      );

      service.setNavigatorKey(navigatorKey);
    });

    tearDown(() {
      reset(mockHttpClient);
      reset(mockPackageInfo);
      reset(mockPrefs);
      prefsStorage.clear();
    });

    group('HTML Version Extraction', () {
      test('should extract version from JSON data pattern', () async {
        // Set up old last check time to ensure update check runs
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithJsonVersion, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isTrue);
        expect(prefsStorage['last_known_version'], equals('2.1.0'));
      });

      test('should extract version from Current Version pattern', () async {
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithCurrentVersion, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isTrue);
        expect(prefsStorage['last_known_version'], equals('2.1.0'));
      });

      test('should extract version from script content pattern', () async {
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithScriptVersion, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isTrue);
        expect(prefsStorage['last_known_version'], equals('2.1.0'));
      });

      test('should extract version from general pattern', () async {
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithGeneralPattern, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isTrue);
        expect(prefsStorage['last_known_version'], equals('2.1.0'));
      });

      test('should return false when no version pattern matches', () async {
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlNoVersion, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isFalse);
        expect(prefsStorage.containsKey('last_update_check'), isTrue);
        expect(prefsStorage.containsKey('last_known_version'), isFalse);
      });
    });

    group('Version Comparison Logic', () {
      test('should return true when newer version is available', () async {
        when(mockPackageInfo.version).thenReturn('1.0.0');
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithJsonVersion, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isTrue);
      });

      test('should return false when current version is up to date', () async {
        when(mockPackageInfo.version).thenReturn('2.1.0');
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithJsonVersion, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isFalse);
      });

      test('should return false when current version is newer than store', () async {
        when(mockPackageInfo.version).thenReturn('3.0.0');
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithJsonVersion, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isFalse);
      });
    });

    group('Update Check Flow', () {
      test('should skip check if recently checked', () async {
        final currentTime = DateTime.now().millisecondsSinceEpoch;
        prefsStorage['last_update_check'] = currentTime;

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isFalse);
        verifyNever(mockHttpClient.get(any, headers: anyNamed('headers')));
      });

      test('should check for updates if not recently checked', () async {
        final oldTime = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;
        prefsStorage['last_update_check'] = oldTime;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithJsonVersion, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isTrue);
        verify(mockHttpClient.get(any, headers: anyNamed('headers'))).called(1);
      });

      test('should handle HTTP errors gracefully', () async {
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers')))
            .thenAnswer((_) async => http.Response('Not Found', 404));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isFalse);
        expect(prefsStorage.containsKey('last_update_check'), isTrue);
      });

      test('should handle network exceptions gracefully', () async {
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers')))
            .thenThrow(const SocketException('Network unreachable'));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isFalse);
      });
    });

    group('Caching Strategy', () {
      test('should use cached version when network fails', () async {
        prefsStorage['last_known_version'] = '2.1.0';
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;
        
        when(mockPackageInfo.version).thenReturn('1.0.0');

        when(mockHttpClient.get(any, headers: anyNamed('headers')))
            .thenThrow(const SocketException('Network error'));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isTrue);
      });

      test('should prefer fresh data over cached when network succeeds', () async {
        prefsStorage['last_known_version'] = '1.5.0';
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;
        
        when(mockPackageInfo.version).thenReturn('1.0.0');

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithJsonVersion, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isTrue);
        expect(prefsStorage['last_known_version'], equals('2.1.0'));
      });
    });

    group('Manual Update Check', () {
      test('should perform update check bypassing time restrictions', () async {
        final recentTime = DateTime.now().millisecondsSinceEpoch;
        prefsStorage['last_update_check'] = recentTime;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithJsonVersion, 200));

        final updateAvailable = await service.manualUpdateCheck();

        expect(updateAvailable, isTrue);
        verify(mockHttpClient.get(any, headers: anyNamed('headers'))).called(1);
      });
    });

    group('Preferences Management', () {
      test('should clear all update preferences', () async {
        // Set some initial values
        prefsStorage['last_update_check'] = 123456789;
        prefsStorage['update_skipped_version'] = '2.0.0';
        prefsStorage['last_known_version'] = '1.9.0';

        await service.clearUpdatePreferences();

        verify(mockPrefs.remove('last_update_check')).called(1);
        verify(mockPrefs.remove('update_skipped_version')).called(1);
        verify(mockPrefs.remove('last_known_version')).called(1);
        
        // Verify storage is actually cleared
        expect(prefsStorage.containsKey('last_update_check'), isFalse);
        expect(prefsStorage.containsKey('update_skipped_version'), isFalse);
        expect(prefsStorage.containsKey('last_known_version'), isFalse);
      });

      test('should handle preferences errors gracefully', () async {
        when(mockPrefs.remove(any)).thenThrow(Exception('Prefs error'));

        await expectLater(service.clearUpdatePreferences(), completes);
      });
    });

    group('Analytics', () {
      test('should return correct analytics data', () async {
        final testTime = DateTime.now().millisecondsSinceEpoch;

        prefsStorage['last_known_version'] = '2.1.0';
        prefsStorage['update_skipped_version'] = '2.0.0';
        prefsStorage['last_update_check'] = testTime;

        final analytics = await service.getUpdateAnalytics();

        expect(analytics['lastKnownVersion'], equals('2.1.0'));
        expect(analytics['skippedVersion'], equals('2.0.0'));
        expect(analytics['lastCheck'], isA<DateTime>());
        expect(analytics['daysSinceLastCheck'], equals(0));
      });

      test('should handle missing analytics data', () async {
        final analytics = await service.getUpdateAnalytics();

        expect(analytics['lastKnownVersion'], isNull);
        expect(analytics['skippedVersion'], isNull);
        expect(analytics['lastCheck'], isNull);
        expect(analytics['daysSinceLastCheck'], isNull);
      });
    });

    group('Version Validation', () {
      test('should accept valid semantic versions', () async {
        final validVersions = ['1.0.0', '2.1.0', '10.5.3', '1.0.0.1'];

        for (final version in validVersions) {
          // Clear previous state
          prefsStorage.clear();
          prefsStorage['last_update_check'] = DateTime.now()
              .subtract(const Duration(days: 4))
              .millisecondsSinceEpoch;

          final html = '''<script>{"versionName": "$version"}</script>''';
          when(mockHttpClient.get(any, headers: anyNamed('headers')))
              .thenAnswer((_) async => http.Response(html, 200));

          await service.checkForUpdates(showDialog: false);

          expect(prefsStorage['last_known_version'], equals(version));
        }
      });

      test('should reject invalid version formats', () async {
        final invalidVersions = ['1.0', 'v2.1.0', '1.0.0-beta', 'invalid'];

        for (final version in invalidVersions) {
          // Clear previous state
          prefsStorage.clear();
          prefsStorage['last_update_check'] = DateTime.now()
              .subtract(const Duration(days: 4))
              .millisecondsSinceEpoch;

          final html = '''<script>{"versionName": "$version"}</script>''';
          when(mockHttpClient.get(any, headers: anyNamed('headers')))
              .thenAnswer((_) async => http.Response(html, 200));

          await service.checkForUpdates(showDialog: false);

          expect(prefsStorage.containsKey('last_known_version'), isFalse);
        }
      });
    });

    group('Error Handling', () {
      test('should handle timeout exceptions', () async {
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenThrow(
            TimeoutException('Request timeout', const Duration(seconds: 15)));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isFalse);
      });

      test('should handle malformed HTML gracefully', () async {
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        const malformedHtml = '<html><body>Not valid HTML structure';
        when(mockHttpClient.get(any, headers: anyNamed('headers')))
            .thenAnswer((_) async => http.Response(malformedHtml, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isFalse);
        expect(prefsStorage.containsKey('last_update_check'), isTrue);
      });
    });

    group('Platform Specific Behavior', () {
      test('should handle Android platform update checks', () async {
        prefsStorage['last_update_check'] = DateTime.now()
            .subtract(const Duration(days: 4))
            .millisecondsSinceEpoch;

        when(mockHttpClient.get(any, headers: anyNamed('headers'))).thenAnswer(
            (_) async => http.Response(playStoreHtmlWithJsonVersion, 200));

        final updateAvailable = await service.checkForUpdates(showDialog: false);

        expect(updateAvailable, isTrue);
        verify(mockHttpClient.get(any, headers: anyNamed('headers'))).called(1);
      });
    });
  });
}