import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/utils/reading_freshness.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final now = DateTime.utc(2026, 11, 7, 18, 22);

  group('newestReadingAge', () {
    test('uses the most recent timestamp', () {
      final age = newestReadingAge([
        Measurement(id: 'a', time: '2026-11-07T12:00:00.000Z'),
        Measurement(id: 'b', time: '2026-11-07T14:00:00.000Z'),
        Measurement(id: 'c', time: '2026-11-07T08:00:00.000Z'),
      ], now);
      expect(age, const Duration(hours: 4, minutes: 22));
    });

    test('ignores missing or unparseable timestamps', () {
      final age = newestReadingAge([
        Measurement(id: 'a'),
        Measurement(id: 'b', time: 'not-a-date'),
        Measurement(id: 'c', time: '2026-11-07T18:00:00.000Z'),
      ], now);
      expect(age, const Duration(minutes: 22));
    });

    test('returns null when no reading has a timestamp', () {
      expect(newestReadingAge([Measurement(id: 'a')], now), isNull);
      expect(newestReadingAge(const [], now), isNull);
    });

    test('treats future timestamps (clock skew) as fresh', () {
      final age = newestReadingAge(
          [Measurement(id: 'a', time: '2026-11-07T19:00:00.000Z')], now);
      expect(age, Duration.zero);
    });

    test('Kampala on 7 Nov evening (12:00 UTC data at 18:22) is stale', () {
      final age = newestReadingAge(
          [Measurement(id: 'k', time: '2026-11-07T12:00:00.000Z')], now)!;
      expect(age >= kStaleReadingThreshold, isTrue);
    });

    test('a 4-hour lag (14:00 UTC data at 18:22) does not warn', () {
      final age = newestReadingAge(
          [Measurement(id: 'n', time: '2026-11-07T14:00:00.000Z')], now)!;
      expect(age < kStaleReadingThreshold, isTrue);
    });

    test('threshold is 6 hours', () {
      expect(kStaleReadingThreshold, const Duration(hours: 6));
    });
  });
}
