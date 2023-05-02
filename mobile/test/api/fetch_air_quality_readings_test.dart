import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'package:flutter_test/flutter_test.dart';

Future<void> main() async {
  await dotenv.load(fileName: Config.environmentFile);

  group('fetchesAirQualityReadings', () {
    test('fetches latest air quality readings from  API', () async {
      List<AirQualityReading> readings =
          await AirqoApiClient().fetchAirQualityReadings();
      expect(readings.isEmpty, false);

      AirQualityReading reading = readings.reduce((value, element) {
        if (value.dateTime.isBefore(element.dateTime)) {
          return value;
        }
        return element;
      });
      expect(
          reading.dateTime
              .isAfter(DateTime.now().subtract(const Duration(days: 1))),
          true);
    });

    test('checks if all air quality readings have health tips.', () async {
      List<AirQualityReading> readings =
          await AirqoApiClient().fetchAirQualityReadings();
      List<AirQualityReading> readingsWithoutHealthTips =
          readings.where((element) => element.healthTips.isEmpty).toList();
      expect(readingsWithoutHealthTips.isEmpty, true);
    });
  });
}
