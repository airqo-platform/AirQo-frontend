class AirQoUrls {
  final String _baseUrl = 'https://platform.airqo.net/api/v1/';
  final String _baseUrlV2 = 'https://platform.airqo.net/api/v2/';

  String get cloundinaryUrl =>
      'https://api.cloudinary.com/v1_1/happen2020/image/upload';

  String get devices => '${_baseUrl}devices';

  String get devicesByGeoCoordinates =>
      '${_baseUrl}devices/by/nearest-coordinates';

  String get forecast => '${_baseUrl}predict/';

  String get measurements => '${_baseUrl}devices/events';
  String get hourlyMeasurements => '${_baseUrlV2}devices/events';
}
