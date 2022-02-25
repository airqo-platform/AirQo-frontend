import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
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
      path: '${Links.airqoFeedbackEmail}',
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
      '\nor App Store \n\n${Links.iOSUrl}',
      subject: '${AppConfig.name} app!');
}

void shareLocation(Site site) {
  Share.share(
      'Checkout the air quality of '
      '${site.getName()} '
      ' ${Links.websiteUrl}',
      subject: '${AppConfig.name}, ${site.getName()}!');
}

void shareMeasurement(Measurement measurement) {
  var recommendationList =
      getHealthRecommendations(measurement.getPm2_5Value());
  var recommendations = '';
  for (var value in recommendationList) {
    recommendations = '$recommendations\n- ${value.recommendation}';
  }
  Share.share(
      '${measurement.site.getName()} air quality \n\n'
      'PM2.5 : ${measurement.getPm2_5Value().toStringAsFixed(2)} µg/m\u00B3 (${pmToString(measurement.getPm2_5Value())}) \n'
      'PM10 : ${measurement.getPm10Value().toStringAsFixed(2)} µg/m\u00B3 \n'
      '$recommendations\n\n'
      'Source: AiQo App',
      subject: '${AppConfig.name}, ${measurement.site.getName()}!');
}

void shareRanking(List<Measurement> measurements) {
  var messages = '';
  var size = 0;
  for (var measurement in measurements) {
    size = size + 1;
    var message = '${measurement.site.getName()} ('
        'PM2.5 : ${measurement.getPm2_5Value().toStringAsFixed(2)} µg/m\u00B3'
        ' (${pmToString(measurement.getPm2_5Value())}) , '
        'PM10 : ${measurement.getPm10Value().toStringAsFixed(2)} µg/m\u00B3 )'
        '\n\n';

    messages = '$messages $message';
    if (size == 5) {
      break;
    }
  }

  messages = '$messages ... \n\n'
      'Source: AiQo App';

  Share.share(messages, subject: '${AppConfig.name}, places\' ranking');
}
