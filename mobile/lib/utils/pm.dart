import 'dart:ui';

import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

String pmToInfoDialog(double pm2_5) {
  if (pm2_5 <= 12.09) {
    //good
    return 'Air quality is safe for everyone!';
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.49) {
    //moderate
    return 'Unusually sensitive people should consider reducing '
        'prolonged or intense outdoor activities.'
        '';
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.49) {
    //sensitive
    return 'The elderly and children should limit intense outdoor activities.'
        'Sensitive people should reduce prolonged or '
        'intense outdoor activities.';
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.49) {
    // unhealthy
    return 'People with respiratory or heart disease,'
        ' the elderly and children should avoid '
        'intense outdoor activities.'
        'Everyone else should limit intense outdoor activities.';
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.49) {
    // very unhealthy
    return 'People with respiratory or heart disease, '
        'the elderly and children should avoid any outdoor activity.'
        'Everyone else should limit intense outdoor activities.';
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return 'Everyone should avoid any intense outdoor activities. '
        'People with respiratory or heart disease,'
        ' the elderly and children should remain indoors.';
  } else {
    return '';
  }
}

Future<BitmapDescriptor> pmToMarker({
  required double pm2_5,
  required int itemsSize,
}) async {
  final int width = itemsSize > 1 ? 80 : 160;
  final Color bgColor = Pollutant.pm2_5.color(pm2_5);
  final Color textColor = Pollutant.pm2_5.textColor(value: pm2_5);

  final PictureRecorder pictureRecorder = PictureRecorder();
  final Canvas canvas = Canvas(pictureRecorder);
  final Paint paint = Paint()..color = bgColor;
  final double radius = width / 2;
  canvas.drawCircle(
    Offset(radius, radius),
    radius,
    paint,
  );

  final textPainter = TextPainter(
    textDirection: TextDirection.ltr,
    text: TextSpan(
      text: pm2_5.toStringAsFixed(2),
      style: TextStyle(
        fontSize: itemsSize > 1 ? 20 : 40,
        fontWeight: FontWeight.bold,
        color: textColor,
      ),
    ),
    textAlign: TextAlign.center,
  )..layout();

  textPainter.paint(
    canvas,
    Offset(
      radius - textPainter.width / 2,
      radius - textPainter.height / 2,
    ),
  );
  final image = await pictureRecorder.endRecording().toImage(
        radius.toInt() * 2,
        radius.toInt() * 2,
      );
  final data = await image.toByteData(format: ImageByteFormat.png);

  return BitmapDescriptor.fromBytes(data!.buffer.asUint8List());
}

BitmapDescriptor pmToMarkerPoint(double pm2_5, AqiColors aqiColors) {
  if (pm2_5 <= 12.09) {
    //good
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      aqiColors.aqiGreen ?? Colors.white,
    ).hue);
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.49) {
    //moderate
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      aqiColors.aqiYellow ?? Colors.white,
    ).hue);
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.49) {
    //sensitive
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      aqiColors.aqiOrange ?? Colors.white,
    ).hue);
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.49) {
    // unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      aqiColors.aqiRed ?? Colors.white,
    ).hue);
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.49) {
    // very unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      aqiColors.aqiPurple ?? Colors.white,
    ).hue);
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      aqiColors.aqiMaroon ?? Colors.white,
    ).hue);
  } else {
    return BitmapDescriptor.defaultMarker;
  }
}
