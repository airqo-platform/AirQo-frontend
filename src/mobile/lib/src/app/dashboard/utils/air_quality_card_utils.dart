import 'dart:convert';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

/// Shared rendering helpers for the air-quality share/filter/sticker cards so
/// they all present identical values (color, category label, sanitized
/// text) without duplicating logic in every widget.

/// Fixes mojibake that occasionally shows up in API text fields.
String sanitizeCardText(String value) {
  if (!value.contains('Ã') && !value.contains('Â') && !value.contains('â')) {
    return value;
  }

  try {
    return utf8.decode(latin1.encode(value));
  } catch (_) {
    return value;
  }
}

/// Resolves the AQI accent color for a measurement, preferring the color
/// returned by the API and falling back to a category lookup.
Color getMeasurementAqiColor(Measurement measurement) {
  if (measurement.aqiColor != null) {
    try {
      final colorString = measurement.aqiColor!.replaceAll('#', '');
      return Color(int.parse('0xFF$colorString'));
    } catch (_) {}
  }

  switch (measurement.aqiCategory?.toLowerCase() ?? '') {
    case 'good':
      return const Color(0xFF179D5B);
    case 'moderate':
      return const Color(0xFFC79000);
    case 'unhealthy for sensitive groups':
    case 'u4sg':
      return const Color(0xFFE17827);
    case 'unhealthy':
      return const Color(0xFFD63A45);
    case 'very unhealthy':
      return const Color(0xFF7540B5);
    case 'hazardous':
      return const Color(0xFF6D4C41);
    default:
      return AppColors.primaryColor;
  }
}

/// Shortens verbose AQI category labels so they fit on compact card pills.
String aqiCategoryLabel(String category) {
  switch (category.toLowerCase()) {
    case 'unhealthy for sensitive groups':
      return 'Sensitive Groups';
    case 'very unhealthy':
      return 'Very Unhealthy';
    default:
      return category;
  }
}

/// Light pastel background for an AQI status pill, derived by blending the
/// category color into white — matches the Figma "Label/Status/Good"
/// component style (solid pale bg + solid saturated text) rather than a
/// translucent overlay, which reads as muddy over photos.
Color aqiPillBackground(Color categoryColor) {
  return Color.alphaBlend(categoryColor.withValues(alpha: 0.18), Colors.white);
}

/// Resolves the circular AQI "wheel" icon (ring + face) used on the share
/// card, filter, and sticker templates — same asset set used across the
/// dashboard and map so the icon always matches the category color.
String getMeasurementAqiIconAsset(Measurement measurement) {
  switch (measurement.aqiCategory?.toLowerCase() ?? '') {
    case 'good':
      return 'assets/images/shared/airquality_indicators/good.svg';
    case 'moderate':
      return 'assets/images/shared/airquality_indicators/moderate.svg';
    case 'unhealthy for sensitive groups':
    case 'u4sg':
      return 'assets/images/shared/airquality_indicators/unhealthy-sensitive.svg';
    case 'unhealthy':
      return 'assets/images/shared/airquality_indicators/unhealthy.svg';
    case 'very unhealthy':
      return 'assets/images/shared/airquality_indicators/very-unhealthy.svg';
    case 'hazardous':
      return 'assets/images/shared/airquality_indicators/hazardous.svg';
    default:
      return 'assets/images/shared/airquality_indicators/unavailable.svg';
  }
}
