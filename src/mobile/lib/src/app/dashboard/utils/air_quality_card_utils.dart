import 'dart:convert';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

/// Shared rendering helpers for the air-quality share/filter/sticker cards so
/// they all present identical values (color, category label, sanitized
/// text) without duplicating logic in every widget.

/// Windows-1252 maps bytes 0x80-0x9F to these code points (smart quotes,
/// em-dashes, etc.) instead of leaving them as Latin-1 control codes. When
/// UTF-8 text is mis-decoded as Windows-1252, these are the code points
/// that show up — e.g. "it's" becomes "itâ€™s". Plain `latin1.encode`
/// can't reverse these (they're outside Latin-1's 0-255 range entirely),
/// so it throws and the mojibake silently survives.
const Map<int, int> _windows1252HighBytes = {
  0x20AC: 0x80, // €
  0x201A: 0x82, // ‚
  0x0192: 0x83, // ƒ
  0x201E: 0x84, // „
  0x2026: 0x85, // …
  0x2020: 0x86, // †
  0x2021: 0x87, // ‡
  0x02C6: 0x88, // ˆ
  0x2030: 0x89, // ‰
  0x0160: 0x8A, // Š
  0x2039: 0x8B, // ‹
  0x0152: 0x8C, // Œ
  0x017D: 0x8E, // Ž
  0x2018: 0x91, // '
  0x2019: 0x92, // '
  0x201C: 0x93, // "
  0x201D: 0x94, // "
  0x2022: 0x95, // •
  0x2013: 0x96, // –
  0x2014: 0x97, // —
  0x02DC: 0x98, // ˜
  0x2122: 0x99, // ™
  0x0161: 0x9A, // š
  0x203A: 0x9B, // ›
  0x0153: 0x9C, // œ
  0x017E: 0x9E, // ž
  0x0178: 0x9F, // Ÿ
};

/// Fixes mojibake that occasionally shows up in API text fields — UTF-8
/// bytes that got shown as Latin-1/Windows-1252 text, e.g. "CafÃ©" instead
/// of "Café" or "itâ€™s" instead of "it's".
///
/// Only rewrites strings matching one of the classic mojibake signatures
/// below ('Ã' or 'Â' immediately followed by another character, or the
/// smart-quote/dash prefix 'â€') — a bare 'â' is left alone, since that's a
/// legitimate letter in its own right (e.g. "château", "âge").
String sanitizeCardText(String value) {
  final looksLikeMojibake =
      value.contains('Ã') || value.contains('â€') || value.contains('Â');
  if (!looksLikeMojibake) return value;

  final bytes = <int>[];
  for (final unit in value.codeUnits) {
    if (unit <= 0xFF) {
      bytes.add(unit);
      continue;
    }
    final mappedByte = _windows1252HighBytes[unit];
    if (mappedByte == null) return value; // Not a reversible mojibake byte.
    bytes.add(mappedByte);
  }

  try {
    return utf8.decode(bytes);
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
