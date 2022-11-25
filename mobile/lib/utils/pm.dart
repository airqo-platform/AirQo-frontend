import 'dart:ui';

import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

List<HealthTip> getHealthTips(
  double pm2_5,
  Pollutant _,
) {
  // TODO add healthtips for pm10
  final healthtips = <HealthTip>[];
  if (pm2_5 <= 12.09) {
    //good
    healthtips.add(
      HealthTip(
        'For everyone',
        'It\'s a terrific day to go outside and exercise,'
            ' Reduce the number of car trips you make.',
        'assets/images/family.png',
      ),
    );
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.49) {
    // moderate
    healthtips
      ..add(
        HealthTip(
          'For everyone',
          'Today is a great day for outdoor activity.',
          'assets/images/family.png',
        ),
      )
      ..add(
        HealthTip(
          'For pregnant women',
          'Reduce the intensity of your outdoor activities to keep you and your baby healthy.',
          'assets/images/pregnant_woman.png',
        ),
      )
      ..add(
        HealthTip(
          'For elderly people',
          'Reduce the intensity of your outdoor activities.',
          'assets/images/old_man.png',
        ),
      );
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.49) {
    //sensitive
    healthtips
      ..add(
        HealthTip(
          'For people with respiratory issues',
          'Reduce strenuous exercise,'
              'Take it easy if you experience signs like coughing',
          'assets/images/family.png',
        ),
      )
      ..add(
        HealthTip(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png',
        ),
      )
      ..add(
        HealthTip(
          'For pregnant women',
          'Reduce the intensity of your outdoor activities to keep you and your baby healthy',
          'assets/images/pregnant_woman.png',
        ),
      )
      ..add(
        HealthTip(
          'For elderly people',
          'Reduce the intensity of your outdoor activities.',
          'assets/images/old_man.png',
        ),
      );
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.49) {
    // unhealthy
    healthtips.add(
      HealthTip(
        'For everyone',
        'Avoid activities that make you breathe more rapidly,'
            ' Today is the perfect day to spend indoors reading.',
        'assets/images/family.png',
      ),
    );
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.49) {
    // very unhealthy
    healthtips.add(
      HealthTip(
        'For everyone',
        'Reduce the intensity of your outdoor activities,'
            ' Try to stay indoors until the air quality improves.',
        'assets/images/family.png',
      ),
    );
  } else if (pm2_5 >= 250.5) {
    // hazardous
    healthtips.add(
      HealthTip(
          'For everyone',
        'If you have to spend a lot of time outside, disposable masks like the N95 are helpful.',
          'assets/images/family.png',
      ),
      );
  }

  return healthtips;
}

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

Future<BitmapDescriptor> pmToMarker(double pm2_5) async {
  const width = 80;
  final value = pm2_5;
  final bgColor = Pollutant.pm2_5.color(pm2_5);
  final textColor = Pollutant.pm2_5.textColor(value: pm2_5);

  final pictureRecorder = PictureRecorder();
  final canvas = Canvas(pictureRecorder);
  final paint = Paint()..color = bgColor;
  const radius = width / 2;
  canvas.drawCircle(
    const Offset(radius, radius),
    radius,
    paint,
  );

  final textPainter = TextPainter(
    textDirection: TextDirection.ltr,
    text: TextSpan(
      text: value.toStringAsFixed(2),
      style: TextStyle(
        fontSize: 20,
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

Future<BitmapDescriptor> pmToSmallMarker(double pm2_5) async {
  const width = 20;
  final bgColor = Pollutant.pm2_5.color(pm2_5);

  final pictureRecorder = PictureRecorder();
  final canvas = Canvas(pictureRecorder);
  final paint = Paint()..color = bgColor;
  const radius = width / 2;
  canvas.drawCircle(
    const Offset(radius, radius),
    radius,
    paint,
  );

  final image = await pictureRecorder.endRecording().toImage(
        radius.toInt() * 2,
        radius.toInt() * 2,
      );
  final data = await image.toByteData(format: ImageByteFormat.png);

  return BitmapDescriptor.fromBytes(data!.buffer.asUint8List());
}

class HealthTip {
  HealthTip(
    this.title,
    this.body,
    this.imageUrl,
  );
  String title = '';
  String body = '';
  String imageUrl = '';
}
