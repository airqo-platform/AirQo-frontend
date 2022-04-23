import 'config.dart';

class AirQoUrls {
  static String get carrierSearchApi => Config.carrierSearchApi;

  static String get checkUserExists => Config.airqoApiUserExistsUrl;

  static String get forecast => '${Config.airqoApiUrlV2}predict/';

  static String get insights =>
      '${Config.airqoApiUrl}views/measurements/app/insights';

  static String get measurements => '${Config.airqoApiUrl}devices/events';

  static String get placeSearchDetails =>
      '${Config.placesSearchUrl}details/json';

  static String get requestEmailReAuthentication =>
      '${Config.airqoApiUrl}users/emailAuth';

  static String get requestEmailVerification =>
      '${Config.airqoApiUrl}users/emailLogin';

  static String get searchSuggestions =>
      '${Config.placesSearchUrl}autocomplete/json';

  static String get sites => '${Config.airqoApiUrl}devices/sites';

  static String get sitesByGeoCoordinates =>
      '${Config.airqoApiUrl}devices/sites/nearest';

  static String get welcomeMessage =>
      '${Config.airqoApiUrl}notifications/welcomeMessage';
}
