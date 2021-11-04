import 'package:app/constants/app_constants.dart';
import 'package:app/models/air_quality_tip.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/site.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';
import 'package:share/share.dart';
import 'package:url_launcher/url_launcher.dart';

import 'dialogs.dart';

Future<void> reportPlace(Site site, context) async {
  var snackBar = SnackBar(
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(10),
    ),
    elevation: 20,
    behavior: SnackBarBehavior.floating,
    content: const Text(
      'Could not launch email. Please visit our website'
      ' to get intouch',
      softWrap: true,
      textAlign: TextAlign.center,
    ),
    backgroundColor: ColorConstants.appColor,
    action: SnackBarAction(
      textColor: Colors.white,
      label: 'Click to go to Website',
      onPressed: () async {
        await canLaunch(Links.contactUsUrl)
            ? await launch(Links.contactUsUrl)
            : showSnackBar(
                context,
                'Oops something bad happened.'
                ' Please try again later');
      },
    ),
  );

  final _emailFeedbackUri = Uri(
      scheme: 'mailto',
      path: Links.airqoFeedbackEmail,
      queryParameters: {
        'subject': 'Mobile\bApp\bFeedback\bon\b${site.getName()}!'
      }).toString();

  await canLaunch(_emailFeedbackUri)
      ? await launch(_emailFeedbackUri)
      : ScaffoldMessenger.of(context).showSnackBar(snackBar);
}

void shareApp() {
  Share.share(
      'Get the ${AppConfig.name} app from Play Store '
      '\n\n${Links.playStoreUrl} '
      '\nor App Store \n\n${Links.appStoreUrl}',
      subject: '${AppConfig.name} app!');
}

void shareLocation(PlaceDetails placeDetails) {
  Share.share(
      'Checkout the Air Quality of '
      '${placeDetails.name}\n'
      ' ${Links.websiteUrl}\n\n'
      'Source: AiQo App',
      subject: '${AppConfig.name}, ${placeDetails.name}!');
}

void shareMeasurement(Measurement measurement) {
  var recommendationList =
      getHealthRecommendations(measurement.getPm2_5Value());
  var recommendations = '';
  for (var value in recommendationList) {
    recommendations = '$recommendations\n- ${value.body}';
  }
  Share.share(
      '${measurement.site.getName()}, Current Air Quality. \n\n'
      'PM2.5 : ${measurement.getPm2_5Value().toStringAsFixed(2)} µg/m\u00B3 (${pm2_5ToString(measurement.getPm2_5Value())}) \n'
      'PM10 : ${measurement.getPm10Value().toStringAsFixed(2)} µg/m\u00B3 \n'
      '$recommendations\n\n'
      'Source: AiQo App',
      subject: '${AppConfig.name}, ${measurement.site.getName()}!');
}

void shareTip(AirQualityTip airQualityTip) {
  Share.share(
      'AIr Quality Tips \n\n'
      '${airQualityTip.title} \n'
      '${airQualityTip.message}\n\n'
      'Source: AiQo App',
      subject: 'Air Quality Tips (AiQo App)');
}
