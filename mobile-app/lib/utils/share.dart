import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/site.dart';
import 'package:app/utils/pm.dart';
import 'package:share/share.dart';

void shareApp() {
  Share.share(
      'Download the ${AppConfig.name} app from Play Store '
      ' ${Links().playStoreUrl} '
      'or App Store ${Links().iOSUrl}',
      subject: '${AppConfig.name} app!');
}

void shareLocation(Site site) {
  Share.share(
      'Checkout the air quality of '
      '${site.getName()} '
      ' ${Links().websiteUrl}',
      subject: '${AppConfig.name}, ${site.getName()}!');
}

void shareMeasurement(Measurement measurement) {
  Share.share(
      '${measurement.site.getName()} air quality readings \n'
      'PM 2.5 : ${measurement.getPm2_5Value().toStringAsFixed(2)} µg/m\u00B3 (${pmToString(measurement.getPm2_5Value())}) \n'
      'PM 10 : ${measurement.getPm10Value().toStringAsFixed(2)} µg/m\u00B3 ',
      subject: '${AppConfig.name}, ${measurement.site.getName()}!');
}
