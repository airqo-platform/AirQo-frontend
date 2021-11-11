import 'dart:io';
import 'dart:ui' as ui;

import 'package:app/constants/app_constants.dart';
import 'package:app/models/air_quality_tip.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/site.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import 'date.dart';
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

Future<void> shareCard(BuildContext buildContext, GlobalKey globalKey,
    Measurement measurement) async {
  var dialogResponse = await showDialog<String>(
    context: buildContext,
    builder: (BuildContext context) => AlertDialog(
      title: const Text('Share Options'),
      content: const Text('Share via'),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.pop(context, 'image'),
          child: const Text('Image'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, 'text'),
          child: const Text('Text'),
        ),
      ],
    ),
  );

  if (dialogResponse == 'image') {
    var boundary =
        globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
    var image = await boundary.toImage();
    var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    var pngBytes = byteData!.buffer.asUint8List();

    final directory = (await getApplicationDocumentsDirectory()).path;
    var imgFile = File('$directory/analytics_card.png');
    await imgFile.writeAsBytes(pngBytes);

    var message = '${measurement.site.getName()}, Current Air Quality. \n\n'
        'Source: AiQo App';
    Share.shareFiles([imgFile.path], text: message);
  } else {
    shareMeasurementText(measurement);
  }
}

Widget shareCardImage(
    Measurement measurement, PlaceDetails placeDetails, BuildContext context) {
  return Container(
    padding: const EdgeInsets.only(top: 12, bottom: 12, left: 10, right: 10),
    decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(Radius.circular(16.0)),
        border: Border.all(color: Colors.transparent)),
    child: Column(
      children: [
        Row(
          children: [
            analyticsAvatar(measurement, 104, 40, 12),
            const SizedBox(width: 16.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    placeDetails.getName(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 20),
                  ),
                  Text(
                    placeDetails.getLocation(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        fontSize: 14, color: Colors.black.withOpacity(0.3)),
                  ),
                  const SizedBox(
                    height: 12,
                  ),
                  Container(
                    padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                    decoration: BoxDecoration(
                        borderRadius:
                            const BorderRadius.all(Radius.circular(40.0)),
                        color: pm2_5ToColor(measurement.getPm2_5Value())
                            .withOpacity(0.4),
                        border: Border.all(color: Colors.transparent)),
                    child: Text(
                      pm2_5ToString(measurement.getPm2_5Value()),
                      maxLines: 1,
                      textAlign: TextAlign.start,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 14,
                        color: pm2_5TextColor(measurement.getPm2_5Value()),
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                          constraints: BoxConstraints(
                              maxWidth:
                                  MediaQuery.of(context).size.width / 3.2),
                          child: Text(
                            dateToString(measurement.time, true),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                fontSize: 8,
                                color: Colors.black.withOpacity(0.3)),
                          )),
                      const SizedBox(
                        width: 8.0,
                      ),
                    ],
                  ),
                ],
              ),
            )
          ],
        ),
        Text(
          'AirQo App',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.5)),
        ),
      ],
    ),
  );
}

Future<void> shareGraph(BuildContext buildContext, GlobalKey globalKey,
    PlaceDetails placeDetails) async {
  var boundary =
      globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
  var image = await boundary.toImage();
  var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
  var pngBytes = byteData!.buffer.asUint8List();

  final directory = (await getApplicationDocumentsDirectory()).path;
  var imgFile = File('$directory/analytics_graph.png');
  await imgFile.writeAsBytes(pngBytes);

  var message = '${placeDetails.getName()}, Current Air Quality. \n\n'
      'Source: AiQo App';
  await Share.shareFiles([imgFile.path], text: message);
}

Future<void> shareKya(BuildContext buildContext, GlobalKey globalKey) async {
  var boundary =
      globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
  var image = await boundary.toImage();
  var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
  var pngBytes = byteData!.buffer.asUint8List();

  final directory = (await getApplicationDocumentsDirectory()).path;
  var imgFile = File('$directory/analytics_graph.png');
  await imgFile.writeAsBytes(pngBytes);

  var message = 'Source: AiQo App';
  await Share.shareFiles([imgFile.path], text: message);
}

void shareLocation(PlaceDetails placeDetails) {
  Share.share(
      'Checkout the Air Quality of '
      '${placeDetails.getName()}\n'
      ' ${Links.websiteUrl}\n\n'
      'Source: AiQo App',
      subject: '${AppConfig.name}, ${placeDetails.getName()}!');
}

void shareMeasurementText(Measurement measurement) {
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
