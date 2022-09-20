import 'package:airqo_api/airqo_api.dart';
import 'package:app_repository/app_repository.dart';

class AppRepository {
  AppRepository({required this.airqoApiKey, required this.baseUrl})
      : _airqoApiClient = AirQoApiClient(
          airqoApiToken: airqoApiKey,
          baseUrl: baseUrl,
        );

  final AirQoApiClient _airqoApiClient;
  final String airqoApiKey;
  final String baseUrl;

  Future<List<SiteReading>> getSitesReadings() async {
    final measurements = await _airqoApiClient.fetchLatestMeasurements();
    return parseSitesReadings(measurements);
  }
}
