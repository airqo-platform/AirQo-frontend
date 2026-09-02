import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/pages/exposure_dashboard_view.dart';
import 'package:airqo/src/app/exposure/widgets/my_trips_view.dart';
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
}
