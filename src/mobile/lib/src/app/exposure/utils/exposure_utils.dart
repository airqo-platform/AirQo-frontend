import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';

String getAirQualityIconPath(String category, double value) {
  switch (category.toLowerCase()) {
    case 'good':
      return "assets/images/shared/airquality_indicators/good.svg";
    case 'moderate':
      return "assets/images/shared/airquality_indicators/moderate.svg";
    case 'unhealthy for sensitive groups':
      return "assets/images/shared/airquality_indicators/unhealthy-sensitive.svg";
    case 'unhealthy':
      return "assets/images/shared/airquality_indicators/unhealthy.svg";
    case 'very unhealthy':
      return "assets/images/shared/airquality_indicators/very-unhealthy.svg";
    case 'hazardous':
      return "assets/images/shared/airquality_indicators/hazardous.svg";
    default:
      return "assets/images/shared/airquality_indicators/unavailable.svg";
  }
}

String getCurrentHourAirQualityIcon(DailyExposureSummary? exposureData) {
  if (exposureData == null) {
    return "assets/images/shared/airquality_indicators/unavailable.svg";
  }

  final currentHour = DateTime.now().hour;

  for (final point in exposureData.dataPoints) {
    if (point.timestamp.hour == currentHour) {
      return getAirQualityIconPath(
        point.aqiCategory ?? 'Unknown',
        point.pm25Value ?? 0.0,
      );
    }
  }

  return "assets/images/shared/airquality_indicators/moderate.svg";
}

Color getPeakCategoryColor(String category) {
  switch (category.toLowerCase()) {
    case 'good':
      return const Color(0xFF4CAF50);
    case 'moderate':
      return const Color(0xFFFF9800);
    case 'unhealthy for sensitive groups':
      return const Color(0xFFFF5722);
    case 'unhealthy':
      return const Color(0xFFF44336);
    case 'very unhealthy':
      return const Color(0xFF9C27B0);
    case 'hazardous':
      return const Color(0xFF795548);
    default:
      return const Color(0xFF757575);
  }
}

Color getRiskLevelColor(ExposureRiskLevel level) {
  switch (level) {
    case ExposureRiskLevel.minimal:
      return Colors.green;
    case ExposureRiskLevel.low:
      return Colors.blue;
    case ExposureRiskLevel.moderate:
      return Colors.orange;
    case ExposureRiskLevel.high:
      return Colors.red;
  }
}

String getDynamicTitle(DailyExposureSummary? data) {
  if (data == null) return 'No exposure data';

  switch (data.riskLevel) {
    case ExposureRiskLevel.minimal:
      return 'Minimal exposure day';
    case ExposureRiskLevel.low:
      return 'Low exposure day';
    case ExposureRiskLevel.moderate:
      return 'Moderate exposure day';
    case ExposureRiskLevel.high:
      return 'High exposure day';
  }
}

String getDynamicDescription(DailyExposureSummary? data) {
  if (data == null) return 'Unable to load exposure data. Please check your location settings.';

  final timeFrame = 'past 24 hours';
  final outdoorHours = data.totalOutdoorTime.inHours;
  final outdoorMinutes = data.totalOutdoorTime.inMinutes % 60;
  final timeSpent = outdoorHours > 0
      ? '${outdoorHours}h ${outdoorMinutes}m'
      : '${outdoorMinutes}m';

  switch (data.riskLevel) {
    case ExposureRiskLevel.minimal:
      return 'In the $timeFrame, you\'ve had minimal pollution exposure with no health impact. You spent $timeSpent in tracked areas.';
    case ExposureRiskLevel.low:
      return 'In the $timeFrame, you\'ve had low pollution exposure with minimal health impact. You spent $timeSpent in tracked areas.';
    case ExposureRiskLevel.moderate:
      return 'In the $timeFrame, you\'ve experienced moderate pollution exposure. Consider limiting outdoor activities. You spent $timeSpent in tracked areas.';
    case ExposureRiskLevel.high:
      return 'In the $timeFrame, you\'ve had high pollution exposure. Consider avoiding unnecessary outdoor activities. You spent $timeSpent in tracked areas.';
  }
}

String getLocationDescription(ExposureDataPoint? point) {
  if (point == null) return 'at unknown location';

  if (point.siteName != null && point.siteName!.isNotEmpty) {
    return 'near ${point.siteName}';
  }

  return 'in your area';
}
