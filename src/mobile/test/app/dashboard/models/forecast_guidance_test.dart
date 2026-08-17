import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/forecast_guidance.dart';
import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:flutter_test/flutter_test.dart';

Measurement _measurement({double pm25 = 42.3}) {
  return Measurement(
    aqiCategory: 'Moderate',
    aqiColor: '#FF9900',
    pm25: Pm25(value: pm25),
    healthTips: [
      HealthTip(description: 'Limit outdoor activity.'),
    ],
  );
}

Forecast _forecast({
  required DateTime time,
  double pm25 = 55.0,
}) {
  return Forecast(
    aqiCategory: 'Unhealthy for Sensitive Groups',
    aqiColor: '#FF6600',
    aqiColorName: 'orange',
    pm25: pm25,
    time: time,
    forecastConfidence: 80,
  );
}

HourlyForecastEntry _hourlyEntry({
  required DateTime time,
  double pm25 = 48.0,
}) {
  return HourlyForecastEntry(
    aqiCategory: 'Moderate',
    aqiColor: '#FF9900',
    pm25Mean: pm25,
    time: time,
    forecastConfidence: 75,
  );
}

void main() {
  group('isForecastToday', () {
    test('returns true for same calendar day', () {
      final now = DateTime(2026, 8, 17, 15, 30);
      expect(isForecastToday(DateTime(2026, 8, 17, 8), now), isTrue);
    });

    test('returns false for a different day', () {
      final now = DateTime(2026, 8, 17, 15, 30);
      expect(isForecastToday(DateTime(2026, 8, 18, 8), now), isFalse);
    });
  });

  group('isCurrentHourEntry', () {
    test('returns true when entry matches current hour on today', () {
      final now = DateTime(2026, 8, 17, 15, 45);
      final entry = _hourlyEntry(time: DateTime(2026, 8, 17, 15));
      expect(isCurrentHourEntry(entry, now), isTrue);
    });

    test('returns false for a different hour', () {
      final now = DateTime(2026, 8, 17, 15, 45);
      final entry = _hourlyEntry(time: DateTime(2026, 8, 17, 16));
      expect(isCurrentHourEntry(entry, now), isFalse);
    });
  });

  group('ForecastReadingSnapshot.fromDailyOrLive', () {
    test('uses live reading for today when measurement is available', () {
      final now = DateTime(2026, 8, 17, 12);
      final snapshot = ForecastReadingSnapshot.fromDailyOrLive(
        forecast: _forecast(time: DateTime(2026, 8, 17)),
        measurement: _measurement(pm25: 42.3),
        now: now,
      );

      expect(snapshot.pm25, 42.3);
      expect(snapshot.aqiCategory, 'Moderate');
      expect(snapshot.forecastConfidence, isNull);
    });

    test('uses forecast for future days', () {
      final now = DateTime(2026, 8, 17, 12);
      final snapshot = ForecastReadingSnapshot.fromDailyOrLive(
        forecast: _forecast(time: DateTime(2026, 8, 18), pm25: 55),
        measurement: _measurement(pm25: 42.3),
        now: now,
      );

      expect(snapshot.pm25, 55);
      expect(snapshot.forecastConfidence, 80);
    });

    test('falls back to forecast for today without live reading', () {
      final now = DateTime(2026, 8, 17, 12);
      final snapshot = ForecastReadingSnapshot.fromDailyOrLive(
        forecast: _forecast(time: DateTime(2026, 8, 17), pm25: 55),
        measurement: Measurement(aqiCategory: 'Moderate'),
        now: now,
      );

      expect(snapshot.pm25, 55);
      expect(snapshot.forecastConfidence, 80);
    });
  });

  group('ForecastReadingSnapshot.fromHourlyOrLive', () {
    test('uses live reading for current hour on today', () {
      final now = DateTime(2026, 8, 17, 15, 20);
      final snapshot = ForecastReadingSnapshot.fromHourlyOrLive(
        entry: _hourlyEntry(time: DateTime(2026, 8, 17, 15), pm25: 48),
        measurement: _measurement(pm25: 42.3),
        now: now,
      );

      expect(snapshot.pm25, 42.3);
      expect(snapshot.forecastConfidence, isNull);
    });

    test('uses forecast for a future hour on today', () {
      final now = DateTime(2026, 8, 17, 15, 20);
      final snapshot = ForecastReadingSnapshot.fromHourlyOrLive(
        entry: _hourlyEntry(time: DateTime(2026, 8, 17, 16), pm25: 48),
        measurement: _measurement(pm25: 42.3),
        now: now,
      );

      expect(snapshot.pm25, 48);
      expect(snapshot.forecastConfidence, 75);
    });
  });

  group('guidanceFromMeasurement', () {
    test('maps first health tip description to guidance message', () {
      final guidance = guidanceFromMeasurement(_measurement());
      expect(guidance.message, 'Limit outdoor activity.');
      expect(guidance.trendMessage, isNull);
    });
  });
}
