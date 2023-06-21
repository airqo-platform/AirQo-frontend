import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'package:flutter_test/flutter_test.dart';

Future<void> main() async {
  await dotenv.load(fileName: Config.environmentFile);

  group('fetchesForecast', () {
    test('fetches forecast from API', () async {
      List<AirQualityReading> readings =
          await AirqoApiClient().fetchAirQualityReadings();
      List<String> siteIds = readings.map((e) => e.referenceSite).toList();
      List<Forecast> forecasts = [];

      for (String siteId in siteIds) {
        if (forecasts.isNotEmpty) {
          break;
        }
        forecasts = await AirqoApiClient().(String siteId) async {
          final forecasts = <Forecast>[];
        
          try {
            final body = await _performGetRequest(
              {
                "site_id": siteId,
              },
              AirQoUrls.forecast,
              apiService: ApiService.forecast,
            );
        
            for (final forecast in body['forecasts'] as List<dynamic>) {
              try {
                forecasts.add(
                  Forecast.fromJson({
                    'pm2_5': forecast['pm2_5'],
                    'time': forecast['time'],
                    'siteId': siteId,
                    'health_tips': forecast["health_tips"] ?? [],
                    'message': forecast["message"] ?? '',
                  }),
                );
              } catch (exception, stackTrace) {
                await logException(
                  exception,
                  stackTrace,
                );
              }
            }
          } catch (exception, stackTrace) {
            await logException(
              exception,
              stackTrace,
            );
          }
        
          return forecasts.removeInvalidData();
        }(siteId);
      }

      Forecast forecast = forecasts.reduce((value, element) {
        if (value.time.isBefore(element.time)) {
          return value;
        }
        return element;
      });
      expect(forecast.time.isAfterOrEqualToToday(), true);
    });

    test('checks if forecast data has health tips', () async {
      List<AirQualityReading> readings =
          await AirqoApiClient().fetchAirQualityReadings();
      List<String> siteIds = readings.map((e) => e.referenceSite).toList();
      List<Forecast> forecasts = [];

      for (String siteId in siteIds) {
        if (forecasts.isNotEmpty) {
          break;
        }
        forecasts = await AirqoApiClient().(String siteId) async {
          final forecasts = <Forecast>[];
        
          try {
            final body = await _performGetRequest(
              {
                "site_id": siteId,
              },
              AirQoUrls.forecast,
              apiService: ApiService.forecast,
            );
        
            for (final forecast in body['forecasts'] as List<dynamic>) {
              try {
                forecasts.add(
                  Forecast.fromJson({
                    'pm2_5': forecast['pm2_5'],
                    'time': forecast['time'],
                    'siteId': siteId,
                    'health_tips': forecast["health_tips"] ?? [],
                    'message': forecast["message"] ?? '',
                  }),
                );
              } catch (exception, stackTrace) {
                await logException(
                  exception,
                  stackTrace,
                );
              }
            }
          } catch (exception, stackTrace) {
            await logException(
              exception,
              stackTrace,
            );
          }
        
          return forecasts.removeInvalidData();
        }(siteId);
      }

      List<Forecast> forecastsWithoutHealthTips =
          forecasts.where((element) => element.healthTips.isEmpty).toList();
      expect(forecastsWithoutHealthTips.isEmpty, true);
    });
  });
}
