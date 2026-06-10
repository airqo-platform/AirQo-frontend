import 'package:airqo/src/app/exposure/models/declared_place.dart';

abstract final class ExposurePlaceReadings {
  ExposurePlaceReadings._();

  static double? averagePm25ForCard({
    required DeclaredPlace place,
    required List<HourlyReading> readings,
    required DateTime dayOfView,
  }) {
    if (place.isAbsentOn(dayOfView)) return null;
    final w = place.windowFor(dayOfView);
    if (w == null) return meanPm25(readings);
    final inWindow = readings.where((r) => r.pm25 != null && w.overlapsHour(r.hour)).toList();
    if (inWindow.isEmpty) return meanPm25(readings);
    return inWindow.map((r) => r.pm25!).reduce((a, b) => a + b) / inWindow.length;
  }

  static double meanPm25(List<HourlyReading> readings) {
    final v = readings.where((x) => x.pm25 != null).toList();
    if (v.isEmpty) return 8.0;
    return v.map((x) => x.pm25!).reduce((a, b) => a + b) / v.length;
  }
}
