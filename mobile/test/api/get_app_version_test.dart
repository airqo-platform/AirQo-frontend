import 'package:app/constants/constants.dart';
import 'package:app/models/app_store_version.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'api.mocks.dart';

@GenerateMocks([http.Client])
Future<void> main() async {
  late MockClient client;
  late Map<String, String> headers;
  late String packageName;
  late String bundleId;

  group('returnsCurrentAppVersion', () {
    setUpAll(() async {
      await dotenv.load(fileName: Config.environmentFile);
      headers = {
        'Authorization': 'JWT ${Config.airqoJWTToken}',
        'service': ApiService.view.serviceName,
      };
      client = MockClient();
      bundleId = "com.airqo.net";
      packageName = "com.airqo.app";
    });

    test('returns mocked AppVersion', () async {
      when(
        client.get(
          Uri.parse(
            '${AirQoUrls.appVersion}?bundleId=$bundleId&packageName=$packageName&TOKEN=${Config.airqoApiV2Token}',
          ),
          headers: headers,
        ),
      ).thenAnswer(
        (_) async => http.Response(
          '{"data": {"version": "v1.0.0", "url": "https://api.airqo.net/version"}}',
          200,
        ),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);

      expect(
          await airqoApiClient.getAppVersion(
              bundleId: bundleId, packageName: packageName),
          isA<AppStoreVersion>());
    });

    test('returns null if data not in response body', () async {
      when(
        client.get(
            Uri.parse(
              '${AirQoUrls.appVersion}?bundleId=$bundleId&packageName=$packageName&TOKEN=${Config.airqoApiV2Token}',
            ),
            headers: headers),
      ).thenAnswer(
        (_) async => http.Response(
            '{"version": "v1.0.0", "url": "https://api.airqo.net/version"}',
            200),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);

      expect(
        await airqoApiClient.getAppVersion(
            bundleId: bundleId, packageName: packageName),
        null,
      );
    });

    test('returns null if an exception occurs', () async {
      when(
        client.get(
          Uri.parse(
            '${AirQoUrls.appVersion}?bundleId=""&packageName=""&TOKEN=${Config.airqoApiV2Token}',
          ),
          headers: headers,
        ),
      ).thenAnswer(
        (_) async => http.Response('', 200),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);

      expect(
        await airqoApiClient.getAppVersion(
            bundleId: bundleId, packageName: packageName),
        null,
      );
    });

    test('return Android version from API', () async {
      AirqoApiClient airqoApiClient = AirqoApiClient();
      AppStoreVersion? appVersion = await airqoApiClient.getAppVersion(
        bundleId: bundleId,
        packageName: "",
      );
      expect(appVersion, isA<AppStoreVersion>());
      expect(
        appVersion?.url,
        Uri.parse(
            "https://apps.apple.com/us/app/airqo-air-quality/id1337573091?uo=4"),
      );
    });

    test('returns iOS version from API', () async {
      AirqoApiClient airqoApiClient = AirqoApiClient();
      AppStoreVersion? appVersion = await airqoApiClient.getAppVersion(
        bundleId: "",
        packageName: packageName,
      );
      expect(appVersion, isA<AppStoreVersion>());
      expect(
        appVersion?.url,
        Uri.parse(
            "https://play.google.com/store/apps/details?id=com.airqo.app"),
      );
    });
  });
}
