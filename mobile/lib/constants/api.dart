import 'config.dart';

class AirQoUrls {
  String get forecast => '${Config.airqoApiUrlV2}predict/';

  String get measurements => '${Config.airqoApiUrl}devices/events';

  String get placeSearchDetails => '${Config.placesSearchUrl}details/json';

  String get requestEmailReAuthentication =>
      '${Config.airqoApiUrl}users/emailAuth';

  String get requestEmailVerification =>
      '${Config.airqoApiUrl}users/emailLogin';

  String get searchSuggestions => '${Config.placesSearchUrl}autocomplete/json';

  String get sites => '${Config.airqoApiUrl}devices/sites';

  String get sitesByGeoCoordinates =>
      '${Config.airqoApiUrl}devices/sites/nearest';

  String get welcomeMessage =>
      '${Config.airqoApiUrl}notifications/welcomeMessage';
}
