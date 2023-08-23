import 'package:app/constants/constants.dart';
import 'package:app/models/app_store_version.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:package_info_plus/package_info_plus.dart';

Future<void> main() async {
  setUpAll(() async {
    await dotenv.load(fileName: Config.environmentFile);
  });

  test('return Android version from API', () async {
    PackageInfo.setMockInitialValues(
      appName: "airqo",
      packageName: "com.airqo.app",
      version: "2.0.1",
      buildNumber: "123",
      buildSignature: "123",
    );
    final PackageInfo packageInfo = await PackageInfo.fromPlatform();
    AirqoApiClient airqoApiClient = AirqoApiClient();
    AppStoreVersion? appVersion = await airqoApiClient.getAppVersion(
        currentVersion: packageInfo.version,
        packageName: packageInfo.packageName);
    expect(appVersion, isA<AppStoreVersion>());
    expect(
      appVersion?.url,
      Uri.parse(
        "https://play.google.com/store/apps/details?id=com.airqo.app",
      ),
    );
  });

  test('returns iOS version from API', () async {
    PackageInfo.setMockInitialValues(
      appName: "airqo",
      packageName: "com.airqo.net",
      version: "2.0.1",
      buildNumber: "123",
      buildSignature: "123",
    );
    final PackageInfo packageInfo = await PackageInfo.fromPlatform();

    AirqoApiClient airqoApiClient = AirqoApiClient();
    AppStoreVersion? appVersion = await airqoApiClient.getAppVersion(
        currentVersion: packageInfo.version, bundleId: packageInfo.packageName);
    expect(appVersion, isA<AppStoreVersion>());
    expect(
      appVersion?.url,
      Uri.parse(
        "https://apps.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091",
      ),
    );
  });
}
