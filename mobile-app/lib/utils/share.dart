import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/pm.dart';
import 'package:share/share.dart';

void shareApp() {
  Share.share(
      'Download the $appName app from Play Store $appPlayStoreLink '
      'or App Store $appIOSLink',
      subject: '$appName app!');
}

void shareLocation(Device device) {
  Share.share(
      'Checkout the air quality of '
      '${device.siteName} '
      '$appWebsite',
      subject: '$appName, ${device.siteName}!');
}

void shareMeasurement(Measurement measurement) {
  Share.share(
      '${measurement.device.siteName} air quality readings \n'
      'PM 2.5 : ${measurement.pm2_5.calibratedValue.toString()} µg/m\u00B3 (${pmToString(measurement.pm2_5.calibratedValue)}) \n'
      'PM 10 : ${measurement.pm10.calibratedValue.toString()} µg/m\u00B3 ',
      subject: '$appName, ${measurement.device.siteName}!');
}
