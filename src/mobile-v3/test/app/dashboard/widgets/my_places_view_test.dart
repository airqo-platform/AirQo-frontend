import 'package:airqo/src/app/dashboard/bloc/forecast/forecast_bloc.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/swipeable_analytics_card.dart';
import 'package:airqo/src/app/dashboard/repository/forecast_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:airqo/src/app/dashboard/widgets/my_places_view.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';


@GenerateMocks([DashboardBloc])
import 'my_places_view_test.mocks.dart';

void main() {
  group('MyPlacesView Widget Tests', () {
    late MockDashboardBloc mockDashboardBloc;

    setUp(() {
      mockDashboardBloc = MockDashboardBloc();
    });


    Widget createTestWidget({UserPreferencesModel? userPreferences}) {
      return MaterialApp(
        home: MultiBlocProvider(
          providers: [
            BlocProvider<DashboardBloc>.value(value: mockDashboardBloc),
            BlocProvider<ForecastBloc>(
              create: (context) => ForecastBloc(ForecastImpl()),
            ),
          ],
          child: Scaffold(
            body: MyPlacesView(
              userPreferences: userPreferences,
            ),
          ),
        ),
      );
    }

    testWidgets('displays empty state when no user preferences provided',
        (WidgetTester tester) async {

      when(mockDashboardBloc.state).thenReturn(DashboardLoaded(
        AirQualityResponse(success: true, measurements: []),
      ));
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.empty());

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('Add places you love'), findsOneWidget);
      expect(find.text('Start by adding locations you care about.'),
          findsOneWidget);
      expect(find.text('+Add Location'), findsAtLeastNWidgets(1));
    });

    testWidgets(
        'displays empty state when user preferences has no selected sites',
        (WidgetTester tester) async {
      // Arrange
      final userPreferences = UserPreferencesModel(
        id: 'test-id',
        userId: 'test-user-id',
        selectedSites: [],
      );

      when(mockDashboardBloc.state).thenReturn(DashboardLoaded(
        AirQualityResponse(success: true, measurements: []),
        userPreferences: userPreferences,
      ));
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.empty());

      await tester
          .pumpWidget(createTestWidget(userPreferences: userPreferences));
      await tester.pumpAndSettle();

      expect(find.text('Add places you love'), findsOneWidget);
      expect(find.text('Start by adding locations you care about.'),
          findsOneWidget);
      expect(find.text('+Add Location'), findsAtLeastNWidgets(1));
    });

    testWidgets('displays loading state initially when preferences have sites',
        (WidgetTester tester) async {

      final userPreferences = UserPreferencesModel(
        id: 'test-id',
        userId: 'test-user-id',
        selectedSites: [
          SelectedSite(
            id: 'site-1',
            name: 'Test Location',
            searchName: 'Test Location Search Name',
          ),
        ],
      );

      when(mockDashboardBloc.state).thenReturn(DashboardLoaded(
        AirQualityResponse(success: true, measurements: []),
        userPreferences: userPreferences,
      ));
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.empty());

      await tester
          .pumpWidget(createTestWidget(userPreferences: userPreferences));

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets(
        'displays swipeable analytics cards when measurements are loaded',
        (WidgetTester tester) async {

      final selectedSites = [
        SelectedSite(
          id: 'site-1',
          name: 'Kampala',
          searchName: 'Central Kampala',
        ),
        SelectedSite(
          id: 'site-2',
          name: 'Nairobi',
          searchName: 'Central Nairobi',
        ),
      ];

      final userPreferences = UserPreferencesModel(
        id: 'test-id',
        userId: 'test-user-id',
        selectedSites: selectedSites,
      );

      final measurements = [
        Measurement(
          id: 'measurement-1',
          siteId: 'site-1',
          pm25: Pm25(value: 25.5),
          aqiCategory: 'Moderate',
          aqiColor: '#ffff00',
          siteDetails: SiteDetails(
            id: 'site-1',
            searchName: 'Central Kampala',
            city: 'Kampala',
            country: 'Uganda',
            approximateLatitude: 0.3476,
            approximateLongitude: 32.5825,
          ),
        ),
        Measurement(
          id: 'measurement-2',
          siteId: 'site-2',
          pm25: Pm25(value: 15.2),
          aqiCategory: 'Good',
          aqiColor: '#00e400',
          siteDetails: SiteDetails(
            id: 'site-2',
            searchName: 'Central Nairobi',
            city: 'Nairobi',
            country: 'Kenya',
            approximateLatitude: -1.2921,
            approximateLongitude: 36.8219,
          ),
        ),
      ];

      final dashboardState = DashboardLoaded(
        AirQualityResponse(success: true, measurements: measurements),
        userPreferences: userPreferences,
      );

      when(mockDashboardBloc.state).thenReturn(dashboardState);
      when(mockDashboardBloc.stream)
          .thenAnswer((_) => Stream.value(dashboardState));

      await tester
          .pumpWidget(createTestWidget(userPreferences: userPreferences));
      await tester.pumpAndSettle();

      expect(find.byType(SwipeableAnalyticsCard), findsNWidgets(2));
      expect(find.text('Central Kampala'), findsOneWidget);
      expect(find.text('Central Nairobi'), findsOneWidget);
    });

    testWidgets('displays unmatched site card when measurement not found',
        (WidgetTester tester) async {

      final selectedSites = [
        SelectedSite(
          id: 'unmatched-site',
          name: 'Remote Location',
          searchName: 'Remote Location, Country',
          latitude: 1.0,
          longitude: 2.0,
        ),
      ];

      final userPreferences = UserPreferencesModel(
        id: 'test-id',
        userId: 'test-user-id',
        selectedSites: selectedSites,
      );

      final dashboardState = DashboardLoaded(
        AirQualityResponse(
            success: true, measurements: []), 
        userPreferences: userPreferences,
      );

      when(mockDashboardBloc.state).thenReturn(dashboardState);
      when(mockDashboardBloc.stream)
          .thenAnswer((_) => Stream.value(dashboardState));

      await tester
          .pumpWidget(createTestWidget(userPreferences: userPreferences));
      await tester.pumpAndSettle();

      expect(find.text('Remote Location'), findsOneWidget);
      expect(find.text('Loading data'), findsOneWidget);
      expect(find.text('Lat: 1.000000'), findsOneWidget);
      expect(find.text('Long: 2.000000'), findsOneWidget);
    });

    testWidgets('add location button exists without testing navigation',
        (WidgetTester tester) async {

      when(mockDashboardBloc.state).thenReturn(DashboardLoaded(
        AirQualityResponse(success: true, measurements: []),
      ));
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.empty());

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('+Add Location'), findsAtLeastNWidgets(1));

      final addLocationButtons = find.text('+Add Location');
      expect(addLocationButtons, findsAtLeastNWidgets(1));
    });

    testWidgets('handles dashboard state changes correctly',
        (WidgetTester tester) async {

      final userPreferences = UserPreferencesModel(
        id: 'test-id',
        userId: 'test-user-id',
        selectedSites: [],
      );

      final initialState = DashboardLoading();
      final loadedState = DashboardLoaded(
        AirQualityResponse(success: true, measurements: []),
        userPreferences: userPreferences,
      );

      when(mockDashboardBloc.state).thenReturn(initialState);
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.fromIterable([
            initialState,
            loadedState,
          ]));

      await tester
          .pumpWidget(createTestWidget(userPreferences: userPreferences));
      await tester.pump();

      when(mockDashboardBloc.state).thenReturn(loadedState);
      await tester.pump();
      await tester.pumpAndSettle();

      expect(find.text('Add places you love'), findsOneWidget);
    });

    testWidgets('handles loading state gracefully',
        (WidgetTester tester) async {

      when(mockDashboardBloc.state).thenReturn(DashboardLoading());
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.empty());

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('Add places you love'), findsOneWidget);
    });

    testWidgets('handles error state gracefully', (WidgetTester tester) async {

      when(mockDashboardBloc.state).thenReturn(
        DashboardLoadingError('Network error', isOffline: true),
      );
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.empty());

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('Add places you love'), findsOneWidget);
    });

    testWidgets('verifies widget structure without complex interactions',
        (WidgetTester tester) async {

      final selectedSites = [
        SelectedSite(
          id: 'site-1',
          name: 'Test Location',
          searchName: 'Test Location Name',
        ),
      ];

      final userPreferences = UserPreferencesModel(
        id: 'test-id',
        userId: 'test-user-id',
        selectedSites: selectedSites,
      );

      final measurement = Measurement(
        id: 'measurement-1',
        siteId: 'site-1',
        pm25: Pm25(value: 25.5),
        aqiCategory: 'Moderate',
        siteDetails: SiteDetails(
          id: 'site-1',
          searchName: 'Test Location Name',
          name: 'Test Location',
        ),
      );

      final dashboardState = DashboardLoaded(
        AirQualityResponse(success: true, measurements: [measurement]),
        userPreferences: userPreferences,
      );

      when(mockDashboardBloc.state).thenReturn(dashboardState);
      when(mockDashboardBloc.stream)
          .thenAnswer((_) => Stream.value(dashboardState));

      await tester
          .pumpWidget(createTestWidget(userPreferences: userPreferences));
      await tester.pumpAndSettle();

      expect(find.byType(SwipeableAnalyticsCard), findsOneWidget);
      expect(find.text('Test Location Name'), findsOneWidget);

      expect(find.text('25.50'), findsOneWidget);
      expect(find.text('Moderate'), findsOneWidget);
    });
  });
}
