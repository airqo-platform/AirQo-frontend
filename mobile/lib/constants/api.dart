import 'config.dart';

class AirQoUrls {
  static String get firebaseLookup =>
      '${Config.airqoApiUrl}users/firebase/lookup';

  static String get forecast => '${Config.airqoApiUrl}daily_forecast';

  static String get appVersion =>
      '${Config.airqoApiUrl}view/mobile-app/version-info';

  static String get measurements => '${Config.airqoApiUrl}devices/events';

  static String get placeSearchDetails =>
      '${Config.placesSearchUrl}details/json';

  static String get requestEmailReAuthentication =>
      '${Config.airqoApiUrl}users/emailAuth';

  static String get requestEmailVerification =>
      '${Config.airqoApiUrl}users/emailLogin';

  static String get feedback => '${Config.airqoApiUrl}users/feedback';

  static String get searchSuggestions =>
      '${Config.placesSearchUrl}autocomplete/json';

  static String get ipGeoCoordinates =>
      '${Config.airqoApiUrl}meta-data/ip-geo-coordinates';

  static String get mobileCarrier =>
      '${Config.airqoApiUrl}meta-data/mobile-carrier';
}
