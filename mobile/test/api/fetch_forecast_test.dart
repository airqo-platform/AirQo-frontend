// import 'package:app/constants/constants.dart';
// import 'package:app/models/models.dart';
// import 'package:app/services/rest_api.dart';
// import 'package:app/utils/utils.dart';
// import 'package:flutter_dotenv/flutter_dotenv.dart';

// import 'package:flutter_test/flutter_test.dart';

// Future<void> main() async {
//   await dotenv.load(fileName: Config.environmentFile);

//   group('fetchesForecast', () {
//     test('fetches forecast from API', () async {
//       List<AirQualityReading> readings =
//           await AirqoApiClient().fetchAirQualityReadings();
//       List<String> siteIds = readings.map((e) => e.referenceSite).toList();
//       List<Forecast> forecasts = [];

//       for (String siteId in siteIds) {
//         if (forecasts.isNotEmpty) {
//           break;
//         }
//         forecasts = await AirqoApiClient().fetchForecast(siteId);
//       }

//       Forecast forecast = forecasts.reduce((value, element) {
//         if (value.time.isBefore(element.time)) {
//           return value;
//         }
//         return element;
//       });
//       expect(forecast.time.isAfterOrEqualToToday(), true);
//     });

//     test('checks if forecast data has health tips', () async {
//       List<AirQualityReading> readings =
//           await AirqoApiClient().fetchAirQualityReadings();
//       List<String> siteIds = readings.map((e) => e.referenceSite).toList();
//       List<Forecast> forecasts = [];

//       for (String siteId in siteIds) {
//         if (forecasts.isNotEmpty) {
//           break;
//         }
//         forecasts = await AirqoApiClient().fetchForecast(siteId);
//       }

//       List<Forecast> forecastsWithoutHealthTips =
//           forecasts.where((element) => element.healthTips.isEmpty).toList();
//       expect(forecastsWithoutHealthTips.isEmpty, true);
//     });
//   });
// }
