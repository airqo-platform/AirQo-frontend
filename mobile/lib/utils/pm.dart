import 'dart:ui';

import 'package:app/constants/config.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../models/enum_constants.dart';

List<Recommendation> getHealthRecommendations(
    double pm2_5, Pollutant pollutant) {
  // TODO add recommendations for pm10
  final recommendations = <Recommendation>[];
  if (pm2_5 <= 12.09) {
    //good
    recommendations
      ..add(Recommendation(
          'For everyone',
          'Great air here today! Zero air pollution Zero worries',
          'assets/images/family.png'))
      ..add(Recommendation(
          'For children',
          'Perfect time to let your kids enjoy the park',
          'assets/images/child.png'))
      ..add(Recommendation(
          'For pregnant women',
          'Great time to enjoy a bleeze outdoor with caution',
          'assets/images/pregnant_woman.png'))
      ..add(Recommendation(
          'For elderly people',
          'Great time to enjoy a bleeze outdoor with caution',
          'assets/images/old_man.png'));
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.49) {
    //moderate
    recommendations
      ..add(Recommendation(
          'For everyone',
          'Reduce the intensity of your outdoor activities,'
              ' If possible stay indoor',
          'assets/images/family.png'))
      ..add(Recommendation(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png'))
      ..add(Recommendation(
          'For pregnant women',
          'To keep you and your baby healthy, reduce'
              ' the intensity of your outdoor activities',
          'assets/images/pregnant_woman.png'))
      ..add(Recommendation(
          'For elderly people',
          'Reduce the intensity of your outdoor activities',
          'assets/images/old_man.png'));
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.49) {
    //sensitive
    recommendations
      ..add(Recommendation(
          'For everyone',
          'Reduce the intensity of your outdoor activities,'
              ' If possible stay indoor',
          'assets/images/family.png'))
      ..add(Recommendation(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png'))
      ..add(Recommendation(
          'For pregnant women',
          'To keep you and your baby healthy, reduce'
              ' the intensity of your outdoor activities',
          'assets/images/pregnant_woman.png'))
      ..add(Recommendation(
          'For elderly people',
          'Reduce the intensity of your outdoor activities',
          'assets/images/old_man.png'));
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.49) {
    // unhealthy
    recommendations
      ..add(Recommendation(
          'For everyone',
          'Reduce the intensity of your outdoor activities,'
              ' If possible stay indoor',
          'assets/images/family.png'))
      ..add(Recommendation(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png'))
      ..add(Recommendation(
          'For pregnant women',
          'To keep you and your baby healthy, reduce'
              ' the intensity of your outdoor activities',
          'assets/images/pregnant_woman.png'))
      ..add(Recommendation(
          'For elderly people',
          'Reduce the intensity of your outdoor activities',
          'assets/images/old_man.png'));
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.49) {
    // very unhealthy
    recommendations
      ..add(Recommendation(
          'For everyone',
          'Reduce the intensity of your outdoor activities,'
              ' If possible stay indoor',
          'assets/images/family.png'))
      ..add(Recommendation(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png'))
      ..add(Recommendation(
          'For pregnant women',
          'To keep you and your baby healthy, reduce'
              ' the intensity of your outdoor activities',
          'assets/images/pregnant_woman.png'))
      ..add(Recommendation(
          'For elderly people',
          'Reduce the intensity of your outdoor activities',
          'assets/images/old_man.png'));
  } else if (pm2_5 >= 250.5) {
    // hazardous
    recommendations
      ..add(Recommendation(
          'For everyone',
          'Reduce the intensity of your outdoor activities,'
              ' If possible stay indoor',
          'assets/images/family.png'))
      ..add(Recommendation(
          'For children',
          'Reduce the intensity of your outdoor activities',
          'assets/images/child.png'))
      ..add(Recommendation(
          'For pregnant women',
          'To keep you and your baby healthy, reduce'
              ' the intensity of your outdoor activities',
          'assets/images/pregnant_woman.png'))
      ..add(Recommendation(
          'For elderly people',
          'Reduce the intensity of your outdoor activities',
          'assets/images/old_man.png'));
  } else {}
  return recommendations;
}

Color pollutantTextColor(
    {required double value, required Pollutant pollutant, bool? graph}) {
  switch (pollutant) {
    case Pollutant.pm2_5:
      if (value <= 12.09) {
        //good
        return const Color(0xff03B600);
      } else if (value >= 12.1 && value <= 35.49) {
        //moderate
        return const Color(0xffA8A800);
      } else if (value >= 35.5 && value <= 55.49) {
        //sensitive
        return const Color(0xffB86000);
      } else if (value >= 55.5 && value <= 150.49) {
        // unhealthy
        return const Color(0xffB80B00);
      } else if (value >= 150.5 && value <= 250.49) {
        // very unhealthy
        return const Color(0xff8E00AC);
      } else if (value >= 250.5) {
        // hazardous
        if (graph != null && graph) {
          return Config.maroon;
        }
        return const Color(0xffDBA5B2);
      } else {
        return Config.appColor;
      }
    case Pollutant.pm10:
      if (value <= 50.99) {
        //good
        return const Color(0xff03B600);
      } else if (value >= 51.00 && value <= 100.99) {
        //moderate
        return const Color(0xffA8A800);
      } else if (value >= 101.00 && value <= 250.99) {
        //sensitive
        return const Color(0xffB86000);
      } else if (value >= 251.00 && value <= 350.99) {
        // unhealthy
        return const Color(0xffB80B00);
      } else if (value >= 351.00 && value <= 430.99) {
        // very unhealthy
        return const Color(0xff8E00AC);
      } else if (value >= 431.00) {
        // hazardous
        if (graph != null && graph) {
          return Config.maroon;
        }
        return const Color(0xffDBA5B2);
      } else {
        return Config.appColor;
      }
  }
}

Color pollutantValueColor(
    {required double value, required Pollutant pollutant}) {
  switch (pollutant) {
    case Pollutant.pm2_5:
      if (value <= 12.09) {
        //good
        return Config.green;
      } else if (value >= 12.1 && value <= 35.49) {
        //moderate
        return Config.yellow;
      } else if (value >= 35.5 && value <= 55.49) {
        //sensitive
        return Config.orange;
      } else if (value >= 55.5 && value <= 150.49) {
        // unhealthy
        return Config.red;
      } else if (value >= 150.5 && value <= 250.49) {
        // very unhealthy
        return Config.purple;
      } else if (value >= 250.5) {
        // hazardous
        return Config.maroon;
      } else {
        return Config.appColor;
      }
    case Pollutant.pm10:
      if (value <= 50.99) {
        //good
        return Config.green;
      } else if (value >= 51.00 && value <= 100.99) {
        //moderate
        return Config.yellow;
      } else if (value >= 101.00 && value <= 250.99) {
        //sensitive
        return Config.orange;
      } else if (value >= 251.00 && value <= 350.99) {
        // unhealthy
        return Config.red;
      } else if (value >= 351.00 && value <= 430.99) {
        // very unhealthy
        return Config.purple;
      } else if (value >= 431.00) {
        // hazardous
        return Config.maroon;
      } else {
        return Config.appColor;
      }
  }
}

String pollutantValueString(
    {required double value, required Pollutant pollutant}) {
  switch (pollutant) {
    case Pollutant.pm2_5:
      if (value <= 12.09) {
        //good
        return 'Good';
      } else if (value >= 12.1 && value <= 35.49) {
        //moderate
        return 'Moderate';
      } else if (value >= 35.5 && value <= 55.49) {
        //sensitive
        return 'Unhealthy For Sensitive Groups';
      } else if (value >= 55.5 && value <= 150.49) {
        // unhealthy
        return 'Unhealthy';
      } else if (value >= 150.5 && value <= 250.49) {
        // very unhealthy
        return 'Very Unhealthy';
      } else if (value >= 250.5) {
        // hazardous
        return 'Hazardous';
      } else {
        return '';
      }
    case Pollutant.pm10:
      if (value <= 50.99) {
        //good
        return 'Good';
      } else if (value >= 51.00 && value <= 100.99) {
        //moderate
        return 'Moderate';
      } else if (value >= 101.00 && value <= 250.99) {
        //sensitive
        return 'Unhealthy For Sensitive Groups';
      } else if (value >= 251.00 && value <= 350.99) {
        // unhealthy
        return 'Unhealthy';
      } else if (value >= 351.00 && value <= 430.99) {
        // very unhealthy
        return 'Very Unhealthy';
      } else if (value >= 431.00) {
        // hazardous
        return 'Hazardous';
      } else {
        return '';
      }
  }
}

charts.Color pollutantChartValueColor(double value, Pollutant pollutant) {
  if (pollutant == Pollutant.pm2_5) {
    if (value <= 12.09) {
      //good
      return charts.ColorUtil.fromDartColor(Config.green);
    } else if (value >= 12.1 && value <= 35.49) {
      //moderate
      return charts.ColorUtil.fromDartColor(Config.yellow);
    } else if (value >= 35.5 && value <= 55.49) {
      //sensitive
      return charts.ColorUtil.fromDartColor(Config.orange);
    } else if (value >= 55.5 && value <= 150.49) {
      // unhealthy
      return charts.ColorUtil.fromDartColor(Config.red);
    } else if (value >= 150.5 && value <= 250.49) {
      // very unhealthy
      return charts.ColorUtil.fromDartColor(Config.purple);
    } else if (value >= 250.5) {
      // hazardous
      return charts.ColorUtil.fromDartColor(Config.maroon);
    } else {
      return charts.ColorUtil.fromDartColor(Config.appColor);
    }
  } else {
    if (value <= 50.99) {
      //good
      return charts.ColorUtil.fromDartColor(Config.green);
    } else if (value >= 51.00 && value <= 100.99) {
      //moderate
      return charts.ColorUtil.fromDartColor(Config.yellow);
    } else if (value >= 101.00 && value <= 250.99) {
      //sensitive
      return charts.ColorUtil.fromDartColor(Config.orange);
    } else if (value >= 251.00 && value <= 350.99) {
      // unhealthy
      return charts.ColorUtil.fromDartColor(Config.red);
    } else if (value >= 351.00 && value <= 430.99) {
      // very unhealthy
      return charts.ColorUtil.fromDartColor(Config.purple);
    } else if (value >= 431.00) {
      // hazardous
      return charts.ColorUtil.fromDartColor(Config.maroon);
    } else {
      return charts.ColorUtil.fromDartColor(Config.appColor);
    }
  }
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
  final bgColor = pollutantValueColor(value: pm2_5, pollutant: Pollutant.pm2_5);
  final textColor =
      pollutantTextColor(value: pm2_5, pollutant: Pollutant.pm2_5);

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
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(Config.green).hue);
  } else if (pm2_5 >= 12.10 && pm2_5 <= 35.49) {
    //moderate
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(Config.yellow).hue);
  } else if (pm2_5 >= 35.50 && pm2_5 <= 55.49) {
    //sensitive
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(Config.orange).hue);
  } else if (pm2_5 >= 55.50 && pm2_5 <= 150.49) {
    // unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(Config.red).hue);
  } else if (pm2_5 >= 150.50 && pm2_5 <= 250.49) {
    // very unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(Config.purple).hue);
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return BitmapDescriptor.defaultMarkerWithHue(
        HSVColor.fromColor(Config.maroon).hue);
  } else {
    return BitmapDescriptor.defaultMarker;
  }
}

Future<BitmapDescriptor> pmToSmallMarker(double pm2_5) async {
  const width = 20;
  final bgColor = pollutantValueColor(value: pm2_5, pollutant: Pollutant.pm2_5);

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
  Recommendation(this.title, this.body, this.imageUrl);
  String title = '';
  String body = '';
  String imageUrl = '';
}
