import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AirQualityResponse helpers', () {
    test('hasMeasurements is false for null and empty lists', () {
      expect(AirQualityResponse(success: true).hasMeasurements, isFalse);
      expect(
        AirQualityResponse(success: true, measurements: []).hasMeasurements,
        isFalse,
      );
    });

    test('hasMeasurements is true when the list has items', () {
      expect(
        AirQualityResponse(
          success: true,
          measurements: [Measurement(id: '1')],
        ).hasMeasurements,
        isTrue,
      );
    });

    test('validMeasurements drops readings without site details', () {
      final response = AirQualityResponse(
        success: true,
        measurements: [
          Measurement(id: 'no-site'),
          Measurement(
            id: 'with-site',
            siteDetails: SiteDetails(id: 'site-1'),
          ),
        ],
      );
      expect(response.validMeasurements, hasLength(1));
      expect(response.validMeasurements.first.id, 'with-site');
    });
  });
}
