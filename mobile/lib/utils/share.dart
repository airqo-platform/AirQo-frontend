import 'dart:io';
import 'dart:ui' as ui;

import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import 'date.dart';

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
    var image = await boundary.toImage(pixelRatio: 10.0);
    var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    var pngBytes = byteData!.buffer.asUint8List();

    final directory = (await getApplicationDocumentsDirectory()).path;
    var imgFile = File('$directory/analytics_card.png');
    await imgFile.writeAsBytes(pngBytes);

    var message = '${measurement.site.getName()}, Current Air Quality. \n\n'
        'Source: AiQo App';
    await Share.shareFiles([imgFile.path], text: message);
  } else if (dialogResponse == 'text') {
    shareMeasurementText(measurement);
  } else {
    return;
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
    child: ListView(
      shrinkWrap: true,
      children: [
        Row(
          children: [
            analyticsAvatar(measurement, 104, 40, 12),
            const SizedBox(width: 10.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    placeDetails.getName(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 17),
                  ),
                  Text(
                    placeDetails.getLocation(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        fontSize: 12, color: Colors.black.withOpacity(0.3)),
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
                        fontSize: 12,
                        color: pm2_5TextColor(measurement.getPm2_5Value()),
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Text(
                    dateToString(measurement.time),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        fontSize: 8,
                        color: Colors.black.withOpacity(0.3)),
                  ),
                ],
              ),
            )
          ],
        ),
        Text(
          '© ${DateTime.now().year} AirQo',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.right,
          style: TextStyle(fontSize: 6, color: Colors.black.withOpacity(0.5)),
        ),
      ],
    ),
  );
}

Future<void> shareGraph(BuildContext buildContext, GlobalKey globalKey,
    PlaceDetails placeDetails) async {
  var boundary =
      globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
  var image = await boundary.toImage(pixelRatio: 10.0);
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
  var image = await boundary.toImage(pixelRatio: 10.0);
  var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
  var pngBytes = byteData!.buffer.asUint8List();

  final directory = (await getApplicationDocumentsDirectory()).path;
  var imgFile = File('$directory/analytics_graph.png');
  await imgFile.writeAsBytes(pngBytes);

  var message = 'Source: AiQo App';
  await Share.shareFiles([imgFile.path], text: message);
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
