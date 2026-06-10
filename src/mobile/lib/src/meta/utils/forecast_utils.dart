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

Color getForecastAirQualityColor(String aqiCategory) {
  switch (aqiCategory) {
    case "Good":
      return const Color(0xFF00C853);
    case "Moderate":
      return const Color(0xFFFFD600);
    case "Unhealthy for Sensitive Groups":
      return const Color(0xFFFF6D00);
    case "Unhealthy":
      return const Color(0xFFDD2C00);
    case "Very Unhealthy":
      return const Color(0xFF6A1B9A);
    case "Hazardous":
      return const Color(0xFF4E0000);
    default:
      return const Color(0xFF9E9E9E);
  }
}
