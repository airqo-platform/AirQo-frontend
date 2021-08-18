const getLatestEvents =
    'https://staging-platform.airqo.net/api/v1/devices/events?tenant=airqo&recent=yes';
const getLatestDeviceEvents =
    'https://staging-platform.airqo.net/api/v1/devices/events?tenant=airqo&recent=yes&device=';
const getEvensByTime =
    'https://staging-platform.airqo.net/api/v1/devices/events?tenant=airqo&startTime=';
// const getLatestDeviceEvents =
//     'https://staging-platform.airqo.net/api/v1/data/feeds/transform/recent?channel=';
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

  String get latestMeasurements => '${_baseUrl}devices/events?tenant=airqo&recent=yes';
  String get getDevices => '${_baseUrl}devices?tenant=airqo&active=yes';
  String get getForecast => '${_baseUrl}predict';
}

