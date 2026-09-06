import 'package:airqo/src/app/debug/debug_api_override.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  tearDown(() {
    DebugApiOverride.instance.setForceEmptyAirQuality(false);
    DebugApiOverride.instance.setForceFailAirQuality(false);
    DebugApiOverride.instance.setForceEmptyLearn(false);
    DebugApiOverride.instance.setForceEmptySurveys(false);
    DebugApiOverride.instance.setForceEmptyPlaces(false);
    DebugApiOverride.instance.setForceFailPlaces(false);
  });

  test('empty air quality payload has no measurements', () {
    DebugApiOverride.instance.setForceEmptyAirQuality(true);
    expect(DebugApiOverride.instance.forceEmptyAirQuality, isTrue);
    expect(DebugApiOverride.instance.forceFailAirQuality, isFalse);
    expect(
      DebugApiOverride.instance.emptyAirQualityResponse.hasMeasurements,
      isFalse,
    );
  });

  test('fail air quality override is exclusive of empty air quality', () {
    DebugApiOverride.instance.setForceEmptyAirQuality(true);
    DebugApiOverride.instance.setForceFailAirQuality(true);
    expect(DebugApiOverride.instance.forceFailAirQuality, isTrue);
    expect(DebugApiOverride.instance.forceEmptyAirQuality, isFalse);
  });

  test('empty learn catalog has no courses', () {
    DebugApiOverride.instance.setForceEmptyLearn(true);
    expect(DebugApiOverride.instance.forceEmptyLearn, isTrue);
    expect(DebugApiOverride.instance.emptyLearnCatalog.courses, isEmpty);
  });

  test('empty surveys override is readable in debug', () {
    DebugApiOverride.instance.setForceEmptySurveys(true);
    expect(DebugApiOverride.instance.forceEmptySurveys, isTrue);
  });

  test('empty places override is readable in debug', () {
    DebugApiOverride.instance.setForceEmptyPlaces(true);
    expect(DebugApiOverride.instance.forceEmptyPlaces, isTrue);
    expect(DebugApiOverride.instance.forceFailPlaces, isFalse);
  });

  test('fail places override is exclusive of empty places', () {
    DebugApiOverride.instance.setForceEmptyPlaces(true);
    DebugApiOverride.instance.setForceFailPlaces(true);
    expect(DebugApiOverride.instance.forceFailPlaces, isTrue);
    expect(DebugApiOverride.instance.forceEmptyPlaces, isFalse);
  });
}
