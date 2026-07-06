import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/models/route_exposure_summary.dart';
import 'package:airqo/src/app/exposure/repository/route_exposure_repository.dart';
import 'package:airqo/src/app/exposure/widgets/my_trips_view.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('MyTripsView shows a route summary after analysis',
      (tester) async {
    final repository = _FakeRouteExposureRepository();

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: Scaffold(
          body: MyTripsView(
            savedSites: const [
              SelectedSite(
                id: 'site-1',
                name: 'Home',
                searchName: 'Home',
                latitude: 0.3476,
                longitude: 32.5825,
              ),
              SelectedSite(
                id: 'site-2',
                name: 'Office',
                searchName: 'Office',
                latitude: 0.3136,
                longitude: 32.5811,
              ),
            ],
            repository: repository,
          ),
        ),
      ),
    );

    await tester.tap(find.text('Analyze trip exposure'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.text('Home to Office'), findsOneWidget);
    expect(find.text('Average PM2.5'), findsOneWidget);
    expect(find.text('24.8 µg/m³'), findsNWidgets(2));
    expect(find.textContaining('Highest route reading near City Square'),
        findsOneWidget);
  });

  testWidgets('MyTripsView explains when there are not enough saved sites',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: const Scaffold(
          body: MyTripsView(
            savedSites: [
              SelectedSite(
                id: 'site-1',
                name: 'Home',
                searchName: 'Home',
                latitude: 0.3476,
                longitude: 32.5825,
              ),
            ],
          ),
        ),
      ),
    );

    expect(find.text('Add at least two saved places to analyze a trip.'),
        findsOneWidget);
  });
}

class _FakeRouteExposureRepository implements RouteExposureRepository {
  @override
  Future<RouteExposureSummary> buildTripExposure({
    required SelectedSite origin,
    required SelectedSite destination,
    double radiusKm = 2.5,
  }) async {
    return RouteExposureSummary(
      origin: origin,
      destination: destination,
      distanceLabel: '9 km',
      durationLabel: '19 mins',
      radiusKm: radiusKm,
      sampledPointCount: 12,
      nearbySites: const [
        RouteMonitoringSite(id: 'monitor-1', name: 'City Square'),
      ],
      measurements: [
        Measurement(
          siteId: 'monitor-1',
          pm25: Pm25(value: 24.8),
          siteDetails: SiteDetails(name: 'City Square'),
        ),
      ],
      averagePm25: 24.8,
      peakPm25: 24.8,
      exposureLevel: ExposureLevel.moderate,
      headline: 'This route has noticeable pollution',
      guidance: 'Air between Home and Office is mixed.',
      highestSiteName: 'City Square',
    );
  }
}
