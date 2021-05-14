
import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:share/share.dart';

void shareLocation(Device device){
  Share.share(
      'Checkout the air quality of '
          '${device.siteName} '
          '$appWebsite',
      subject:
      '$appName, ${device.siteName}!');
}

void shareApp(){
  Share.share(
      'Download the $appName app from Play Store $appPlayStoreLink '
          'or App Store $appIOSLink',
      subject: '$appName app!');
}