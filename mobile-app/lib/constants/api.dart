import 'package:app/config/env.dart';

class AirQoUrls {
  final String _baseUrl = baseUrl;
  final String _searchBaseUrl = placesSearchUrl;

  String get feedbackUrl => feedbackWebhook;

  String get imageUploadUrl => airqoImageUploadUrl;

  String get forecast => '${_baseUrl}predict/';

  String get measurements => '${_baseUrl}devices/events';

  String get sites => '${_baseUrl}devices/sites';

  String get sitesByGeoCoordinates => '${_baseUrl}devices/sites/nearest';

  String get placeSearchDetails => '${_searchBaseUrl}details/json';

  String get searchSuggestions => '${_searchBaseUrl}autocomplete/json';
}
