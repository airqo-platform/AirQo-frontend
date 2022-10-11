import 'config.dart';

class AirQoUrls {
  static String get carrierSearchApi => Config.carrierSearchApi;

  static String get checkUserExists => Config.airqoApiUserExistsUrl;

  static String get insights =>
      '${Config.airqoApiUrl}view/measurements/app/insights';

  static String get measurements => '${Config.airqoApiUrl}devices/events';

  static String get placeSearchDetails =>
      '${Config.placesSearchUrl}details/json';

  static String get requestEmailReAuthentication =>
      '${Config.airqoApiUrl}users/emailAuth';

  static String get requestEmailVerification =>
      '${Config.airqoApiUrl}users/emailLogin';

  static String get searchSuggestions =>
      '${Config.placesSearchUrl}autocomplete/json';

  static String get welcomeMessage =>
      '${Config.airqoApiUrl}notifications/welcomeMessage';

  static String get ipGeoCoordinates =>
      '${Config.airqoApiUrl}meta-data/ip-geo-coordinates';
}
