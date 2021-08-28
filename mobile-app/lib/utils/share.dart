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
      'PM 2.5 : ${measurement.getPm2_5Value().toStringAsFixed(2)} µg/m\u00B3 (${pmToString(measurement.getPm2_5Value())}) \n'
      'PM 10 : ${measurement.getPm10Value().toStringAsFixed(2)} µg/m\u00B3 ',
      subject: '$appName, ${measurement.device.siteName}!');
}
