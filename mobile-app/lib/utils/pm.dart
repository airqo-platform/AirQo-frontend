import 'dart:ui';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/pollutant.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

Color pmTextColor(double pm2_5) {
  if (pm2_5 <= 12.09) {
    //good
    return Colors.black;
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.49) {
    //moderate
    return Colors.black;
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.49) {
    //sensitive
    return Colors.black;
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.49) {
    // unhealthy
    return Colors.white;
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.49) {
    // very unhealthy
    return Colors.white;
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return Colors.white;
  } else {
    return ColorConstants().appColor;
  }
}

charts.Color pmToChartColor(double pm2_5) {
  if (pm2_5 <= 12.09) {
    //good
    return charts.ColorUtil.fromDartColor(ColorConstants().green);
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.49) {
    //moderate
    return charts.ColorUtil.fromDartColor(ColorConstants().yellow);
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.49) {
    //sensitive
    return charts.ColorUtil.fromDartColor(ColorConstants().orange);
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.49) {
    // unhealthy
    return charts.ColorUtil.fromDartColor(ColorConstants().red);
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.49) {
    // very unhealthy
    return charts.ColorUtil.fromDartColor(ColorConstants().purple);
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return charts.ColorUtil.fromDartColor(ColorConstants().maroon);
  } else {
    return charts.ColorUtil.fromDartColor(ColorConstants().appColor);
  }
}

Color pmToColor(double pm2_5) {
  if (pm2_5 <= 12.09) {
    //good
    return ColorConstants().green;
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.49) {
    //moderate
    return ColorConstants().yellow;
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.49) {
    //sensitive
    return ColorConstants().orange;
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.49) {
    // unhealthy
    return ColorConstants().red;
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.49) {
    // very unhealthy
    return ColorConstants().purple;
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return ColorConstants().maroon;
  } else {
    return ColorConstants().appColor;
  }
}

String pmToEmoji(double pm2_5) {
  if (pm2_5 <= 12.09) {
    //good
    return 'assets/images/good-face.png';
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.49) {
    //moderate
    return 'assets/images/moderate-face.png';
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.49) {
    //sensitive
    return 'assets/images/sensitive-face.png';
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.49) {
    // unhealthy
    return 'assets/images/unhealthy-face.png';
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.49) {
    // very unhealthy
    return 'assets/images/very-unhealthy-face.png';
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return 'assets/images/hazardous-face.png';
  } else {
    return 'assets/images/good-face.png';
  }
}

Future<BitmapDescriptor> pmToMarker(double pm2_5) async {
  var width = 55;
  var value = pm2_5;
  var bgColor = pmToColor(pm2_5);
  var textColor = pmTextColor(pm2_5);

  final pictureRecorder = PictureRecorder();
  final canvas = Canvas(pictureRecorder);
  final paint = Paint()..color = bgColor;
  final radius = width / 2;
  canvas.drawCircle(
    Offset(radius, radius),
    radius,
    paint,
  );

  var textPainter = TextPainter(
    textDirection: TextDirection.ltr,
    text: TextSpan(
      text: value.toStringAsFixed(2),
      style: TextStyle(
        fontSize: radius - 10,
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

BitmapDescriptor pmToMarkerPoint(double pm2_5) {
  if (pm2_5 <= 12.09) {
    //good
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(ColorConstants().green).hue);
  } else if (pm2_5 >= 12.10 && pm2_5 <= 35.49) {
    //moderate
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(ColorConstants().yellow).hue);
  } else if (pm2_5 >= 35.50 && pm2_5 <= 55.49) {
    //sensitive
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(ColorConstants().orange).hue);
  } else if (pm2_5 >= 55.50 && pm2_5 <= 150.49) {
    // unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(ColorConstants().red).hue);
  } else if (pm2_5 >= 150.50 && pm2_5 <= 250.49) {
    // very unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(ColorConstants().purple).hue);
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(ColorConstants().maroon).hue);
  } else {
    return BitmapDescriptor.defaultMarker;
  }
}

String pmToString(double pm2_5) {
  if (pm2_5 <= 12.09) {
    //good
    return 'Good';
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.49) {
    //moderate
    return 'Moderate';
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.49) {
    //sensitive
    return 'Unhealthy for\nsensitive people';
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.49) {
    // unhealthy
    return 'Unhealthy';
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.49) {
    // very unhealthy
    return 'Very Unhealthy';
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return 'Hazardous';
  } else {
    return '';
  }
}

Pollutant pollutantDetails(String pollutantConstant) {
  pollutantConstant = pollutantConstant.trim();

  if (pollutantConstant == PollutantConstants.pm2_5.trim()) {
    return Pollutant(
        pollutantToString(PollutantConstants.pm2_5),
        PollutantDescription.pm2_5,
        PollutantSource.pm2_5,
        PollutantEffects.pm2_5,
        PollutantReduction.pm2_5);
  } else if (pollutantConstant == PollutantConstants.pm10.trim()) {
    return Pollutant(
        pollutantToString(PollutantConstants.pm10),
        PollutantDescription.pm10,
        PollutantSource.pm10,
        PollutantEffects.pm10,
        PollutantReduction.pm10);
  } else {
    return Pollutant(
        pollutantToString(PollutantConstants.pm2_5),
        PollutantDescription.pm2_5,
        PollutantSource.pm2_5,
        PollutantEffects.pm2_5,
        PollutantReduction.pm2_5);
  }
}

String pollutantToString(String pollutantConstant) {
  pollutantConstant = pollutantConstant.trim();

  if (pollutantConstant == PollutantConstants.pm2_5) {
    return 'PM 2.5';
  } else if (pollutantConstant == PollutantConstants.pm10) {
    return 'PM 10';
  } else {
    return '';
  }
}
