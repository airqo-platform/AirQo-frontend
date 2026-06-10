import 'package:flutter/material.dart';

typedef MapAqLevel = ({String asset, Color color});

MapAqLevel mapAqLevelFromPm25(double pm25) {
  if (pm25 < 12.1) {
    return (
      asset: 'assets/images/shared/airquality_indicators/good.svg',
      color: const Color(0xFF34C759),
    );
  }
  if (pm25 < 35.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/moderate.svg',
      color: const Color(0xFFFDC412),
    );
  }
  if (pm25 < 55.5) {
    return (
      asset:
          'assets/images/shared/airquality_indicators/unhealthy-sensitive.svg',
      color: const Color(0xFFFF851F),
    );
  }
  if (pm25 < 150.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/unhealthy.svg',
      color: const Color(0xFFFE726B),
    );
  }
  if (pm25 < 250.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/very-unhealthy.svg',
      color: const Color(0xFFC78AE8),
    );
  }
  return (
    asset: 'assets/images/shared/airquality_indicators/hazardous.svg',
    color: const Color(0xFFD95BA3),
  );
}
