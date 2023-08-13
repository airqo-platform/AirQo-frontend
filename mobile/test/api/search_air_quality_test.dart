import 'dart:math';

import 'package:app/constants/constants.dart';
import 'package:app/models/air_quality_reading.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';

Future<void> main() async {
  test('search for air quality using API', () async {
    await dotenv.load(fileName: Config.environmentFile);
    AirQualityReading? airQualityReading =
        await AirqoApiClient().searchAirQuality(
      const Point(
        0.912314,
        32.599872,
      ),
    );
    expect(airQualityReading, isNotNull);
  });
}
