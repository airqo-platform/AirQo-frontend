import 'package:app/config/env.dart';

class AirQoUrls {
  final String _baseUrl = baseUrl;
  final _stageBaseUrl = stageBaseUrl;
  final String _baseUrlV2 = baseUrlV2;
  final String _searchBaseUrl = placesSearchUrl;

  String get alerts => '${_baseUrl}notifications';

  String get feedbackUrl => feedbackWebhook;

  String get forecast => '${_baseUrlV2}predict/';

  String get imageUploadUrl => airqoImageUploadUrl;

  String get measurements => '${_baseUrl}devices/events';

  String get placeSearchDetails => '${_searchBaseUrl}details/json';

  String get requestEmailReAuthentication => '${_baseUrl}users/emailAuth';

  String get requestEmailVerification => '${_baseUrl}users/emailLogin';

  String get searchSuggestions => '${_searchBaseUrl}autocomplete/json';

  String get sites => '${_baseUrl}devices/sites';

  String get sitesByGeoCoordinates => '${_baseUrl}devices/sites/nearest';

  String get stories => storiesLink;

  String get welcomeMessage => '${_baseUrl}notifications/welcomeMessage';
}
