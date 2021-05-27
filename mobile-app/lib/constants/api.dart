const getLatestEvents =
    'http://staging-platform.airqo.net/api/v1/devices/events?tenant=airqo&recent=yes';
const getEvensByTime =
    'http://staging-platform.airqo.net/api/v1/devices/events?tenant=airqo&startTime=';
const getLatestDeviceEvents =
    'http://staging-platform.airqo.net/api/v1/data/feeds/transform/recent?channel=';
const getDevices =
    'http://staging-platform.airqo.net/api/v1/devices?tenant=airqo';
const getDevice =
    'http://staging-platform.airqo.net/api/v1/devices?tenant=airqo&name=';
const getHourlyEvents =
    'http://us-central1-airqo-250220.cloudfunctions.net/get_hourly_channel_data?channel_id=';
const getForecastUrl = 'https://staging-platform.airqo.net/api/v1/predict/';
