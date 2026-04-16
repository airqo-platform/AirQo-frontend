import 'dart:math' show Random;

import 'package:airqo/src/app/exposure/models/declared_place.dart';

/// Hourly air-quality rows for exposure. Replace mock with HTTP when backend is ready.
///
/// **API hook:** [hourlyForSite] should become something like:
/// `GET /api/v2/devices/measurements/sites/:siteId/hourly?date=YYYY-MM-DD`
/// returning one row per hour (0–23) with PM2.5 (or null if offline).
abstract final class ExposurePlaceReadings {
  ExposurePlaceReadings._();

  /// Full 24h manifest for a site on [date] (used for card math + detail sheet list).
  /// Mock is deterministic from [siteId]; [date] reserved for future API parity.
  static List<HourlyReading> hourlyForSite(String siteId, DateTime date) {
    return _mockHourly(siteId);
  }

  /// PM2.5 average for the **summary line / risk chip** on a place card: only hours
  /// inside [place.windowFor(dayOfView)] (weekday vs weekend for that calendar day).
  /// Returns **null** when the user declared they are not at this place today (weekday/weekend absent).
  /// The **detail sheet** should still pass the full list from [hourlyForSite] unchanged.
  static double? averagePm25ForCard({
    required DeclaredPlace place,
    required List<HourlyReading> readings,
    required DateTime dayOfView,
  }) {
    if (place.isAbsentOn(dayOfView)) return null;
    final w = place.windowFor(dayOfView);
    if (w == null) {
      return meanPm25(readings);
    }
    final inWindow = readings.where((r) => r.pm25 != null && w.overlapsHour(r.hour)).toList();
    if (inWindow.isEmpty) {
      return meanPm25(readings);
    }
    return inWindow.map((r) => r.pm25!).reduce((a, b) => a + b) / inWindow.length;
  }

  /// Unweighted 24h mean PM2.5 (e.g. detail sheet chip when the card has no window-weighted score).
  static double meanPm25(List<HourlyReading> readings) => _meanPm25(readings);

  static double _meanPm25(List<HourlyReading> readings) {
    final v = readings.where((x) => x.pm25 != null).toList();
    if (v.isEmpty) return 8.0;
    return v.map((x) => x.pm25!).reduce((a, b) => a + b) / v.length;
  }

  // --- Mock only; delete when API is wired ---

  /// Deterministic mock hourly readings — seeded by [siteId].
  /// TODO(api): remove; replace [hourlyForSite] implementation.
  static List<HourlyReading> _mockHourly(String siteId) {
    final seed = siteId.codeUnits.fold(0, (a, b) => a + b);
    final rng = Random(seed);
    final base = 5.0 + rng.nextDouble() * 55;
    return List.generate(24, (h) {
      final offline = (h == 3 || h == 4) && rng.nextBool();
      if (offline) return HourlyReading(hour: h);
      double shape = 1.0;
      if (h >= 6 && h <= 9) shape = 1.4;
      if (h >= 16 && h <= 20) shape = 1.3;
      if (h >= 1 && h <= 5) shape = 0.6;
      final pm = (base * shape + rng.nextDouble() * 6 - 3).clamp(1.0, 200.0);
      return HourlyReading(hour: h, pm25: pm);
    });
  }
}
