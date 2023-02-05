import 'config.dart';

class AirQoUrls {
  static String get firebaseLookup =>
      '${Config.airqoApiUrl}users/firebase/lookup';

  static String get insights =>
      '${Config.airqoApiUrl}view/measurements/mobile-app/insights';

  static String get measurements => '${Config.airqoApiUrl}devices/events';

  static String get requestEmailReAuthentication =>
      '${Config.airqoApiUrl}users/emailAuth';

  static String get requestEmailVerification =>
      '${Config.airqoApiUrl}users/emailLogin';

  static String get feedback => '${Config.airqoApiUrl}users/feedback';

  static String get welcomeMessage =>
      '${Config.airqoApiUrl}notifications/welcomeMessage';

  static String get ipGeoCoordinates =>
      '${Config.airqoApiUrl}meta-data/ip-geo-coordinates';

  static String get mobileCarrier =>
      '${Config.airqoApiUrl}meta-data/mobile-carrier';
}
