import 'config.dart';

class AirQoUrls {
  static String get firebaseLookup =>
      '${Config.airqoApi}/v1/users/firebase/lookup';

  static String get forecast => '${Config.airqoApi}/v2/predict/daily-forecast';

  static String get appVersion =>
      '${Config.airqoApi}/v1/view/mobile-app/version-info';

  static String get measurements => '${Config.airqoApi}/v2/devices/events';

  static String get emailReAuthentication =>
      '${Config.airqoApi}/v1/users/emailAuth';

  static String get emailVerification =>
      '${Config.airqoApi}/v1/users/emailLogin';

  static String get signUp => '${Config.airqoApi}/v2/users/signup';

  static String get feedback => '${Config.airqoApi}/v1/users/feedback';

  static String get mobileCarrier =>
      '${Config.airqoApi}/v1/meta-data/mobile-carrier';
}

enum ApiService {
  deviceRegistry('device-registry'),
  auth('auth'),
  view('view'),
  metaData('meta-data'),
  forecast('forecast');

  const ApiService(this.serviceName);

  final String serviceName;

  @override
  String toString() => serviceName;
}
