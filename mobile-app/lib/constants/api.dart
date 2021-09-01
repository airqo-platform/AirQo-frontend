import 'package:app/config/env.dart';

class AirQoUrls {
  final String _baseUrl = baseUrl;
  final String _baseUrlV2 = baseUrlV2;

  String get cloundinaryUrl => airqoCloundinaryUrl;

  String get sites => '${_baseUrl}devices/sites';

  String get sitesByGeoCoordinates =>
      '${_baseUrl}devices/sites/by/nearest-coordinates';

  String get forecast => '${_baseUrl}predict/';

  String get measurements => '${_baseUrl}devices/events';

  String get hourlyMeasurements => '${_baseUrlV2}devices/events';
}
