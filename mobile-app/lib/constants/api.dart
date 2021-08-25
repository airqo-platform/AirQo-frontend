const getDevices =
    'https://staging-platform.airqo.net/api/v1/devices?tenant=airqo&active=yes';
const getDevicesByGeoCoordinates =
    'https://staging-platform.airqo.net/api/v1/devices/by/nearest-coordinates?tenant=airqo';
const getDevice =
    'https://staging-platform.airqo.net/api/v1/devices?tenant=airqo&name=';
const getHourlyEvents =
    'https://us-central1-airqo-250220.cloudfunctions.net/get_hourly_channel_data?channel_id=';
const getForecastUrl = 'https://staging-platform.airqo.net/api/v1/predict/';
const getCloundinaryUrl =
    'https://api.cloudinary.com/v1_1/happen2020/image/upload';

class AirQoUrls {
  final String _baseUrl = 'https://staging-platform.airqo.net/api/v1/';

  String get measurements => '${_baseUrl}devices/events';

  String get devices => '${_baseUrl}devices';

  String get forecast => '${_baseUrl}predict';

  String get devicesByGeoCoordinates =>
      '${_baseUrl}devices/by/nearest-coordinates';
}
