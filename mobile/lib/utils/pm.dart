import 'dart:ui';

import 'package:app/utils/extensions.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../models/enum_constants.dart';
import '../themes/colors.dart';

List<Recommendation> getHealthRecommendations(
  double pm2_5,
  Pollutant pollutant,
) {
  // TODO add recommendations for pm10
  final recommendations = <Recommendation>[];
  if (pm2_5 <= 12.09) {
    //good
    recommendations
      ..add(
        Recommendation(
          'For everyone',
          'Great air here today! Zero air pollution Zero worries',
          'assets/images/family.png',
        ),
      )
      ..add(
        Recommendation(
          'For children',
          'Perfect time to let your kids enjoy the park',
          'assets/images/child.png',
        ),
      )
      ..add(
        Recommendation(
          'For pregnant women',
          'Great time to enjoy a bleeze outdoor with caution',
          'assets/images/pregnant_woman.png',
        ),
      )
      ..add(
        Recommendation(
          'For elderly people',
          'Great time to enjoy a bleeze outdoor with caution',
          'assets/images/old_man.png',
        ),
      );
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.49) {
    //moderate
    recommendations
      ..add(
        Recommendation(
          'For everyone',
          'Reduce the intensity of your outdoor activities,'
              ' If possible stay indoor',
          'assets/images/family.png',
        ),
      )
      ..add(
        Recommendation(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png',
        ),
      )
      ..add(
        Recommendation(
          'For pregnant women',
          'To keep you and your baby healthy, reduce'
              ' the intensity of your outdoor activities',
          'assets/images/pregnant_woman.png',
        ),
      )
      ..add(
        Recommendation(
          'For elderly people',
          'Reduce the intensity of your outdoor activities',
          'assets/images/old_man.png',
        ),
      );
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.49) {
    //sensitive
    recommendations
      ..add(
        Recommendation(
          'For everyone',
          'Reduce the intensity of your outdoor activities,'
              ' If possible stay indoor',
          'assets/images/family.png',
        ),
      )
      ..add(
        Recommendation(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png',
        ),
      )
      ..add(
        Recommendation(
          'For pregnant women',
          'To keep you and your baby healthy, reduce'
              ' the intensity of your outdoor activities',
          'assets/images/pregnant_woman.png',
        ),
      )
      ..add(
        Recommendation(
          'For elderly people',
          'Reduce the intensity of your outdoor activities',
          'assets/images/old_man.png',
        ),
      );
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.49) {
    // unhealthy
    recommendations
      ..add(
        Recommendation(
          'For everyone',
          'Reduce the intensity of your outdoor activities,'
              ' If possible stay indoor',
          'assets/images/family.png',
        ),
      )
      ..add(
        Recommendation(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png',
        ),
      )
      ..add(
        Recommendation(
          'For pregnant women',
          'To keep you and your baby healthy, reduce'
              ' the intensity of your outdoor activities',
          'assets/images/pregnant_woman.png',
        ),
      )
      ..add(
        Recommendation(
          'For elderly people',
          'Reduce the intensity of your outdoor activities',
          'assets/images/old_man.png',
        ),
      );
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.49) {
    // very unhealthy
    recommendations
      ..add(
        Recommendation(
          'For everyone',
          'Reduce the intensity of your outdoor activities,'
              ' If possible stay indoor',
          'assets/images/family.png',
        ),
      )
      ..add(
        Recommendation(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png',
        ),
      )
      ..add(
        Recommendation(
          'For pregnant women',
          'To keep you and your baby healthy, reduce'
              ' the intensity of your outdoor activities',
          'assets/images/pregnant_woman.png',
        ),
      )
      ..add(
        Recommendation(
          'For elderly people',
          'Reduce the intensity of your outdoor activities',
          'assets/images/old_man.png',
        ),
      );
  } else if (pm2_5 >= 250.5) {
    // hazardous
    recommendations
      ..add(
        Recommendation(
          'For everyone',
          'Reduce the intensity of your outdoor activities,'
              ' If possible stay indoor',
          'assets/images/family.png',
        ),
      )
      ..add(
        Recommendation(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png',
        ),
      )
      ..add(
        Recommendation(
          'For pregnant women',
          'To keep you and your baby healthy, reduce'
              ' the intensity of your outdoor activities',
          'assets/images/pregnant_woman.png',
        ),
      )
      ..add(
        Recommendation(
          'For elderly people',
          'Reduce the intensity of your outdoor activities',
          'assets/images/old_man.png',
        ),
      );
  }

  return recommendations;
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

BitmapDescriptor pmToMarkerPoint(double pm2_5) {
  if (pm2_5 <= 12.09) {
    //good
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      CustomColors.aqiGreen,
    ).hue);
  } else if (pm2_5 >= 12.10 && pm2_5 <= 35.49) {
    //moderate
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      CustomColors.aqiYellow,
    ).hue);
  } else if (pm2_5 >= 35.50 && pm2_5 <= 55.49) {
    //sensitive
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      CustomColors.aqiOrange,
    ).hue);
  } else if (pm2_5 >= 55.50 && pm2_5 <= 150.49) {
    // unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      CustomColors.aqiRed,
    ).hue);
  } else if (pm2_5 >= 150.50 && pm2_5 <= 250.49) {
    // very unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      CustomColors.aqiPurple,
    ).hue);
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return BitmapDescriptor.defaultMarkerWithHue(HSVColor.fromColor(
      CustomColors.aqiMaroon,
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

class Recommendation {
  Recommendation(
    this.title,
    this.body,
    this.imageUrl,
  );
  String title = '';
  String body = '';
  String imageUrl = '';
}
