import 'config.dart';

class AirQoUrls {
  static String get termsUrl =>
      'https://docs.airqo.net/#/mobile_app/privacy_policy';

  static String get firebaseLookup =>
      '${Config.airqoApi}/v2/users/firebase/lookup';

  static String get forecast => '${Config.airqoApi}/v2/predict/daily-forecast';

  static String get appVersion =>
      '${Config.airqoApi}/v2/view/mobile-app/version-info';

  static String get measurements =>
      '${Config.airqoApi}/v2/devices/readings/map';

  static String get emailReAuthentication =>
      '${Config.airqoApi}/v2/users/emailAuth';

  static String get emailVerification =>
      '${Config.airqoApi}/v2/users/emailLogin';

  static String get feedback => '${Config.airqoApi}/v2/users/feedback';

  static String get mobileCarrier =>
      '${Config.airqoApi}/v2/meta-data/mobile-carrier';

  static String get favourites => '${Config.airqoApi}/v2/users/favorites';

  static String get locationHistory =>
      '${Config.airqoApi}/v2/users/locationHistory';

  static String get kya => '${Config.airqoApi}/v2/devices/kya';

  static String get searchHistory =>
      '${Config.airqoApi}/v2/users/searchHistory';

  static String get syncPlatformAccount =>
      '${Config.airqoApi}/v2/users/syncAnalyticsAndMobile';
}

enum ApiService {
  deviceRegistry('device-registry'),
  auth('auth'),
  view('view'),
  metaData('meta-data'),
  forecast('forecast');

  const ApiService(this.serviceName);

  final String serviceName;
}
