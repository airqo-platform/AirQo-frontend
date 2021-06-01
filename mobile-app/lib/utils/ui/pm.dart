import 'dart:ui';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/pollutant.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:charts_flutter/flutter.dart' as charts;

charts.Color pmToChartColor(double pm2_5) {
  if (pm2_5 <= 12) {
    //good
    return charts.ColorUtil.fromDartColor(greenColor);
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return charts.ColorUtil.fromDartColor(yellowColor);
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return charts.ColorUtil.fromDartColor(orangeColor);
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return charts.ColorUtil.fromDartColor(redColor);
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return charts.ColorUtil.fromDartColor(purpleColor);
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return charts.ColorUtil.fromDartColor(maroonColor);
  } else {
    return charts.ColorUtil.fromDartColor(appColor);
  }
}

Color pmToColor(double pm2_5) {
  if (pm2_5 <= 12) {
    //good
    return greenColor;
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return yellowColor;
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return orangeColor;
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return redColor;
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return purpleColor;
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return maroonColor;
  } else {
    return appColor;
  }
}

Color pmTextColor(double pm2_5) {
  if (pm2_5 <= 12) {
    //good
    return Colors.black;
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return Colors.black;
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return Colors.black;
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return Colors.white;
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return Colors.white;
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return Colors.white;
  } else {
    return appColor;
  }
}

String pmToString(double pm2_5) {
  if (pm2_5 <= 12) {
    //good
    return 'Good';
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return 'Moderate';
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return 'Unhealthy for\nsensitive people';
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return 'Unhealthy';
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return 'Very Unhealthy';
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return 'Hazardous';
  } else {
    return '';
  }
}

String pmToImage(double pm2_5) {
  if (pm2_5 <= 12) {
    //good
    return 'assets/images/good.png';
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return 'assets/images/moderate.png';
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return 'assets/images/sensitive.png';
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return 'assets/images/unhealthy.png';
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return 'assets/images/veryUnhealthy.png';
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return 'assets/images/hazardous.png';
  } else {
    return 'assets/images/pmDefault.png';
  }
}

String pmToEmoji(double pm2_5) {
  if (pm2_5 <= 12) {
    //good
    return 'assets/images/good-face.png';
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return 'assets/images/moderate-face.png';
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return 'assets/images/sensitive-face.png';
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return 'assets/images/unhealthy-face.png';
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return 'assets/images/very-unhealthy-face.png';
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return 'assets/images/hazardous-face.png';
  } else {
    return 'assets/images/good-face.png';
  }
}

BitmapDescriptor pmToMarkerPoint(double pm2_5) {
  if (pm2_5 <= 12) {
    //good
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(greenColor).hue);
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(yellowColor).hue);
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(orangeColor).hue);
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(redColor).hue);
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(purpleColor).hue);
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(maroonColor).hue);
  } else {
    return BitmapDescriptor.defaultMarker;
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
      textDirection: TextDirection.ltr, textAlign: TextAlign.center);

  textPainter.text = TextSpan(
    text: value.toString(),
    style: TextStyle(
      fontSize: radius - 10,
      fontWeight: FontWeight.bold,
      color: textColor,
    ),
  );
  textPainter.layout();
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
