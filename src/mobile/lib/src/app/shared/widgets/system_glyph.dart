import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';
import 'package:flutter/material.dart';

/// AirQo system glyphs (https://aero-glyphs.vercel.app/icons) tinted with
/// [AppAlertColors] for errors and [AppTextColors] for empty/offline so icons
/// stay consistent in both themes.
class SystemGlyph {
  const SystemGlyph._();

  static Widget error(BuildContext context, {double size = 48, Color? color}) {
    return AqAlertCircle(
      size: size,
      color: color ?? AppAlertColors.errorForeground(context),
      semanticsLabel: 'Error',
    );
  }

  static Widget offline(BuildContext context, {double size = 48}) {
    return AqWifiOff(
      size: size,
      color: AppTextColors.muted(context),
      semanticsLabel: 'Offline',
    );
  }

  static Widget emptyPlace(BuildContext context, {double size = 48}) {
    return AqMarkerPin01(
      size: size,
      color: AppTextColors.muted(context),
      semanticsLabel: 'No locations',
    );
  }

  static Widget emptyMap(BuildContext context, {double size = 48}) {
    return AqMap01(
      size: size,
      color: AppTextColors.muted(context),
      semanticsLabel: 'No map data',
    );
  }

  static Widget emptyLearn(BuildContext context, {double size = 48}) {
    return AqBookOpen01(
      size: size,
      color: AppTextColors.muted(context),
      semanticsLabel: 'No courses',
    );
  }

  static Widget emptySurvey(BuildContext context, {double size = 48}) {
    return AqFileQuestion01(
      size: size,
      color: AppTextColors.muted(context),
      semanticsLabel: 'No surveys',
    );
  }

  static Widget emptyTrip(BuildContext context, {double size = 48}) {
    return AqRoute(
      size: size,
      color: AppTextColors.muted(context),
      semanticsLabel: 'No trips',
    );
  }

  static Widget retry({double size = 18, Color color = Colors.white}) {
    return AqRefreshCw01(
      size: size,
      color: color,
      semanticsLabel: 'Retry',
    );
  }

  static Widget add({double size = 18, Color color = Colors.white}) {
    return AqPlus(
      size: size,
      color: color,
      semanticsLabel: 'Add',
    );
  }

  static Widget explore({double size = 18, Color color = Colors.white}) {
    return AqCompass01(
      size: size,
      color: color,
      semanticsLabel: 'Explore',
    );
  }
}
