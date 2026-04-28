import 'package:airqo/src/app/exposure/models/declared_place.dart';

abstract class HourlyReadingsRepository {
  // Returns 24 entries (one per hour 0–23); null pm25 = no sensor data.
  // Always returns a full list — falls back to 24 nulls on any error.
  Future<List<HourlyReading>> fetchHourlyReadings(String siteId, DateTime date);
}
