import 'package:airqo/src/app/exposure/models/declared_place.dart';

abstract class HourlyReadingsRepository {
  // Returns 24 entries (one per hour 0–23); null pm25 = no sensor data.
  // Always returns a full list — falls back to 24 nulls on any error.
  Future<List<HourlyReading>> fetchHourlyReadings(String siteId, DateTime date);

  /// Loads all configured Favorites together. Implementations can override
  /// this to use a server-side batch endpoint and avoid one request per card.
  Future<Map<String, List<HourlyReading>>> fetchHourlyReadingsForPlaces(
    List<DeclaredPlace> places,
    DateTime date,
  ) async {
    final entries = await Future.wait(
      places.map(
        (place) => fetchHourlyReadings(place.siteId, date).then(
          (readings) => MapEntry(place.siteId, readings),
        ),
      ),
    );
    return Map.fromEntries(entries);
  }
}
