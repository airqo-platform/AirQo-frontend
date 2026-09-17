import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/pages/exposure_dashboard_view.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/widgets/my_trips_view.dart';
import 'package:airqo/src/app/map/bloc/map_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const sites = [
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
  ];

  DashboardLoaded loadedWithSites() {
    return DashboardLoaded(
      AirQualityResponse(success: true, measurements: []),
      userPreferences: const UserPreferencesModel(
        id: 'pref-1',
        userId: 'user-1',
        selectedSites: sites,
      ),
    );
  }

  test(
      'Exposure favorites keep dashboard order and omit stale cached declarations',
      () {
    const declaredOffice = DeclaredPlace(
      siteId: 'site-2',
      displayName: 'Work',
      locationName: 'Office',
      city: 'Kampala',
      type: PlaceType.work,
    );
    const stalePlace = DeclaredPlace(
      siteId: 'removed-site',
      displayName: 'Old place',
      locationName: 'Old place',
      city: 'Kampala',
      type: PlaceType.other,
    );

    final result = exposureFavoritesForDashboard(
      sites,
      const [declaredOffice, stalePlace],
    );

    expect(result.map((item) => item.site.id), ['site-1', 'site-2']);
    expect(result.first.declaredPlace, isNull);
    expect(result.last.declaredPlace?.displayName, declaredOffice.displayName);
    expect(result.last.declaredPlace?.locationName, 'Office');
    expect(result.last.declaredPlace?.monitorName, 'Office');
    expect(
      result.any((item) => item.site.id == stalePlace.siteId),
      isFalse,
    );
  });

  test('Exposure uses the same visible location title as dashboard Favorites',
      () {
    const favorite = SelectedSite(
      id: 'kisumu-site',
      name: "Ang'awa Avenue",
      searchName: 'Kisumu 256',
    );
    const declared = DeclaredPlace(
      siteId: 'kisumu-site',
      displayName: 'Work',
      locationName: "Ang'awa Avenue",
      city: 'Kisumu 256',
      type: PlaceType.work,
    );

    final item = exposureFavoritesForDashboard(
      const [favorite],
      const [declared],
    ).single;

    expect(item.declaredPlace?.locationName, 'Kisumu 256');
    expect(item.declaredPlace?.monitorName, "Ang'awa Avenue");
  });

  test('dashboard favorites remain resolved during a refresh', () {
    expect(
      dashboardFavoritesAreResolved(
        DashboardLoading(previousState: loadedWithSites()),
      ),
      isTrue,
    );
    expect(dashboardFavoritesAreResolved(DashboardInitial()), isFalse);
  });

  testWidgets(
      'keeps the trip selector visible while dashboard preferences refresh',
      (tester) async {
    final sitesDuringRefresh = favouritesFromDashboardState(
      DashboardLoading(previousState: loadedWithSites()),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: MyTripsView(savedSites: sitesDuringRefresh),
        ),
      ),
    );

    expect(find.text('Check route exposure'), findsOneWidget);
    expect(find.text('Analyze trip exposure'), findsOneWidget);
  });

  test('Trips only uses AirQo-operated locations from the live map data', () {
    Measurement measurement({
      required String id,
      required String country,
      required String provider,
    }) {
      return Measurement(
        id: 'reading-$id',
        siteId: id,
        pm25: Pm25(value: 12),
        siteDetails: SiteDetails(
          id: id,
          name: '$country monitor',
          country: country,
          dataProvider: provider,
          approximateLatitude: 1,
          approximateLongitude: 2,
        ),
      );
    }

    final state = MapLoaded(
      AirQualityResponse(
        success: true,
        measurements: [
          measurement(id: 'ug-1', country: 'Uganda', provider: 'AirQo'),
          measurement(
            id: 'es-1',
            country: 'Spain',
            provider: 'AIRGRADIENT',
          ),
          measurement(
            id: 'ma-1',
            country: 'Morocco',
            provider: 'AIRGRADIENT',
          ),
          measurement(
            id: 'mw-1',
            country: 'Malawi',
            provider: 'AIRGRADIENT',
          ),
        ],
      ),
    );

    final networkSites = tripNetworkSitesFromMapState(state, const []);

    expect(networkSites.map((entry) => entry.country), ['Uganda']);
  });
}
