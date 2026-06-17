import 'package:flutter/material.dart';

Color hexToColor(String hex) {
  try {
    return Color(int.parse('FF${hex.replaceAll('#', '')}', radix: 16));
  } catch (_) {
    return const Color(0xFF9E9E9E);
  }
}

Color readableAqiColor(Color color) {
  final r = (color.r * 255.0).round().clamp(0, 255) / 255;
  final g = (color.g * 255.0).round().clamp(0, 255) / 255;
  final b = (color.b * 255.0).round().clamp(0, 255) / 255;
  double lin(double c) =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) * ((c + 0.055) / 1.055);
  final luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  if (luminance > 0.4) {
    return HSLColor.fromColor(color).withLightness(0.3).toColor();
  }
  return color;
}

String getForecastAirQualityIcon(String aqiCategory) {
  switch (aqiCategory) {
    case "Good":
      return "assets/images/shared/airquality_indicators/good.svg";
    case "Moderate":
      return "assets/images/shared/airquality_indicators/moderate.svg";
    case "Unhealthy for Sensitive Groups":
      return "assets/images/shared/airquality_indicators/unhealthy-sensitive.svg";
    case "Unhealthy":
      return "assets/images/shared/airquality_indicators/unhealthy.svg";
    case "Very Unhealthy":
      return "assets/images/shared/airquality_indicators/very-unhealthy.svg";
    case "Hazardous":
      return "assets/images/shared/airquality_indicators/hazardous.svg";
    default:
      return "assets/images/shared/airquality_indicators/unavailable.svg";
  }
}

String normalizeAqiCategory(String category) {
  return category.trim().toLowerCase();
}

/// Canonical app AQI palette — matches map markers and air quality indicators.
/// Always prefer this over API-supplied hex values for visual consistency.
Color getAppAqiCategoryColor(String category) {
  switch (normalizeAqiCategory(category)) {
    case 'good':
      return const Color(0xFF34C759);
    case 'moderate':
      return const Color(0xFFFDC412);
    case 'unhealthy for sensitive groups':
    case 'u4sg':
      return const Color(0xFFFF851F);
    case 'unhealthy':
      return const Color(0xFFFE726B);
    case 'very unhealthy':
      return const Color(0xFFC78AE8);
    case 'hazardous':
      return const Color(0xFFD95BA3);
    default:
      return const Color(0xFF9E9E9E);
  }
}

Color getForecastAirQualityColor(String aqiCategory) {
  return getAppAqiCategoryColor(aqiCategory);
}
