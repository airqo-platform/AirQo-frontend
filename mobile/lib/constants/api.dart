import 'config.dart';

class AirQoUrls {
  static String get firebaseLookup =>
      '${Config.airqoApi}/v2/users/firebase/lookup';

  static String get forecast => '${Config.airqoApi}/v2/predict/daily-forecast';

  static String get appVersion =>
      '${Config.airqoApi}/v2/view/mobile-app/version-info';

  static String get measurements => '${Config.airqoApi}/v2/devices/events';

  static String get emailReAuthentication =>
      '${Config.airqoApi}/v2/users/emailAuth';

  static String get emailVerification =>
      '${Config.airqoApi}/v2/users/emailLogin';

  static String get feedback => '${Config.airqoApi}/v2/users/feedback';

  static String get mobileCarrier =>
      '${Config.airqoApi}/v2/meta-data/mobile-carrier';
}
