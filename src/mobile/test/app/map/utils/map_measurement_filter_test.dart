import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/map/utils/map_measurement_filter.dart';
import 'package:flutter_test/flutter_test.dart';

Measurement _measurement({required String provider, double? pm25 = 10}) {
  return Measurement(
    id: 'reading-1',
    siteId: 'site-1',
    pm25: Pm25(value: pm25),
    siteDetails: SiteDetails(
      id: 'site-1',
      country: 'Uganda',
      dataProvider: provider,
      approximateLatitude: 0.3476,
      approximateLongitude: 32.5825,
    ),
  );
}

void main() {
  test('recognizes AirQo provider variants from map data', () {
    expect(isAirQoNetworkMeasurement(_measurement(provider: 'AirQo')), isTrue);
    expect(isAirQoNetworkMeasurement(_measurement(provider: 'AIRQO')), isTrue);
    expect(
      isAirQoNetworkMeasurement(_measurement(provider: 'AIRGRADIENT / AIRQO')),
      isTrue,
    );
  });

  test('excludes partner-only and non-visible measurements', () {
    expect(
      isAirQoNetworkMeasurement(_measurement(provider: 'AIRGRADIENT')),
      isFalse,
    );
    expect(
      isAirQoNetworkMeasurement(
        _measurement(provider: 'AirQo', pm25: null),
      ),
      isFalse,
    );
  });
}
