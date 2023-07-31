import 'config.dart';

class AirQoUrls {
  static String get termsUrl =>
      'https://docs.airqo.net/#/mobile_app/privacy_policy';

  static String get firebaseLookup =>
      '${Config.airqoApi}/v1/users/firebase/lookup';

  static String get forecast => '${Config.airqoApi}/v2/predict/daily-forecast';

  static String get appVersion =>
      '${Config.airqoApi}/v2/view/mobile-app/version-info';

  static String get searchAirQuality => '${Config.airqoApi}/v2/predict/search';

  static String get measurements => '${Config.airqoApi}/v2/devices/events';

  static String get emailReAuthentication =>
      '${Config.airqoApi}/v1/users/emailAuth';

  static String get emailVerification =>
      '${Config.airqoApi}/v1/users/emailLogin';

  static String get feedback => '${Config.airqoApi}/v1/users/feedback';

  static String get mobileCarrier =>
      '${Config.airqoApi}/v2/meta-data/mobile-carrier';

  static String get favourites => '${Config.airqoApi}/v2/users/favorites';

  static String get locationHistory =>
      '${Config.airqoApi}/v2/users/locationHistory';

  static String get kya => '${Config.airqoApi}/v2/devices/kya';
}

enum ApiService {
  deviceRegistry('device-registry'),
  auth('auth'),
  view('view'),
  metaData('meta-data'),
  predict('predict'),
  forecast('forecast');

  const ApiService(this.serviceName);

  final String serviceName;

  @override
  String toString() => serviceName;
}
