import 'package:airqo/src/app/dashboard/models/airquality_response.dart';

/// Past this age the latest reading no longer reflects "right now", so the UI
/// adds a gentle "fresh updates are on their way" note. Hourly processing
/// routinely runs a few hours behind, so only note it once the lag is unusual.
///
/// The age is used internally only: user-facing copy never states how old
/// readings are (AirQo keeps app messaging positive; no timestamps).
const Duration kStaleReadingThreshold = Duration(hours: 6);

/// Age of the most recent reading among [measurements], or `null` when none
/// carries a parseable timestamp. Future timestamps (clock skew) count as 0.
Duration? newestReadingAge(Iterable<Measurement> measurements, DateTime now) {
  DateTime? newest;
  for (final measurement in measurements) {
    final raw = measurement.time;
    if (raw == null) continue;
    final parsed = DateTime.tryParse(raw);
    if (parsed == null) continue;
    if (newest == null || parsed.isAfter(newest)) newest = parsed;
  }
  if (newest == null) return null;
  final age = now.toUtc().difference(newest.toUtc());
  return age.isNegative ? Duration.zero : age;
}
