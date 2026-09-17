import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/map/services/map_navigation_service.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('publishes and clears a requested monitor', () {
    final service = MapNavigationService.instance;
    final measurement = Measurement(
      siteId: 'site-1',
      siteDetails: SiteDetails(
        id: 'site-1',
        name: 'City monitor',
        approximateLatitude: 0.3476,
        approximateLongitude: 32.5825,
      ),
    );

    service.showMonitor(measurement);
    expect(service.requestedMeasurement.value, same(measurement));

    service.clear(measurement);
    expect(service.requestedMeasurement.value, isNull);
  });
}
