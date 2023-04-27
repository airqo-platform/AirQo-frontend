import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';

import 'package:flutter_test/flutter_test.dart';

@GenerateMocks([http.Client])
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

      List<AirQualityReading> readingsWithoutHealthTips =
          readings.where((element) => element.healthTips.isEmpty).toList();
      expect(readingsWithoutHealthTips.isEmpty, true);
    });
  });
}
