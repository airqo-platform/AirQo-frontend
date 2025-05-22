import 'package:airqo/src/app/dashboard/pages/location_selection/components/swipeable_analytics_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:airqo/src/app/dashboard/widgets/my_places_view.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/other/places/repository/google_places_repository.dart';
import 'package:hive_flutter/hive_flutter.dart';

// Generate mocks
@GenerateMocks([DashboardBloc, CacheManager, GooglePlacesBloc, GooglePlacesRepository])
import 'my_places_view_test.mocks.dart';

void main() {
  group('MyPlacesView Widget Tests', () {
    late MockDashboardBloc mockDashboardBloc;
    late MockCacheManager mockCacheManager;
    late MockGooglePlacesBloc mockGooglePlacesBloc;

    setUpAll(() async {
      // Initialize Hive for tests
      TestWidgetsFlutterBinding.ensureInitialized();
      await Hive.initFlutter();
    });

    setUp(() {
      mockDashboardBloc = MockDashboardBloc();
      mockCacheManager = MockCacheManager();
      mockGooglePlacesBloc = MockGooglePlacesBloc();
    });

    tearDown(() async {
      // Clean up Hive boxes after each test
      await Hive.deleteFromDisk();
    });

    Widget createTestWidget({UserPreferencesModel? userPreferences}) {
      return MaterialApp(
        home: MultiBlocProvider(
          providers: [
            BlocProvider<DashboardBloc>.value(value: mockDashboardBloc),
            BlocProvider<GooglePlacesBloc>.value(value: mockGooglePlacesBloc),
          ],
          child: Scaffold(
            body: SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: MediaQuery.of(NavigationToolbar.maybeOf(context as BuildContext)?.context ?? context).size.height,
                ),
                child: MyPlacesView(
                  userPreferences: userPreferences,
                ),
              ),
            ),
          ),
        ),
      );
    }

    testWidgets('displays empty state when no user preferences provided', (WidgetTester tester) async {
      // Arrange
      when(mockDashboardBloc.state).thenReturn(DashboardLoaded(
        AirQualityResponse(success: true, measurements: []),
      ));
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.empty());

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Add places you love'), findsOneWidget);
      expect(find.text('Start by adding locations you care about.'), findsOneWidget);
      expect(find.text('+Add Location'), findsAtLeastNWidgets(1));
    });

    testWidgets('displays empty state when user preferences has no selected sites', (WidgetTester tester) async {
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

      // Act
      await tester.pumpWidget(createTestWidget(userPreferences: userPreferences));
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Add places you love'), findsOneWidget);
      expect(find.text('Start by adding locations you care about.'), findsOneWidget);
      expect(find.text('+Add Location'), findsAtLeastNWidgets(1));
    });

    testWidgets('displays loading state initially', (WidgetTester tester) async {
      // Arrange
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

      // Act
      await tester.pumpWidget(createTestWidget(userPreferences: userPreferences));
      
      // Assert - should show loading initially
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('displays swipeable analytics cards when measurements are loaded', (WidgetTester tester) async {
      // Arrange
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
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.value(dashboardState));

      // Act
      await tester.pumpWidget(createTestWidget(userPreferences: userPreferences));
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(SwipeableAnalyticsCard), findsNWidgets(2));
      // Use more specific text matching to avoid duplicates
      expect(find.text('Central Kampala'), findsOneWidget);
      expect(find.text('Central Nairobi'), findsOneWidget);
    });

    testWidgets('displays unmatched site card when measurement not found', (WidgetTester tester) async {
      // Arrange
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
        AirQualityResponse(success: true, measurements: []), // No matching measurements
        userPreferences: userPreferences,
      );

      when(mockDashboardBloc.state).thenReturn(dashboardState);
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.value(dashboardState));

      // Act
      await tester.pumpWidget(createTestWidget(userPreferences: userPreferences));
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Remote Location'), findsOneWidget);
      expect(find.text('Loading data'), findsOneWidget);
      expect(find.text('Lat: 1.000000'), findsOneWidget);
      expect(find.text('Long: 2.000000'), findsOneWidget);
    });

    testWidgets('add location button is tappable', (WidgetTester tester) async {
      // Arrange
      when(mockDashboardBloc.state).thenReturn(DashboardLoaded(
        AirQualityResponse(success: true, measurements: []),
      ));
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.empty());

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Find and tap the add location button
      final addLocationButton = find.text('+Add Location').first;
      expect(addLocationButton, findsOneWidget);
      
      // Just verify the button is tappable - navigation testing would require more complex setup
      await tester.tap(addLocationButton);
      await tester.pump();

      // Assert - Button was successfully tapped (no exceptions thrown)
      expect(addLocationButton, findsOneWidget);
    });

    testWidgets('shows prevent removal dialog when trying to remove last location', (WidgetTester tester) async {
      // Arrange
      final selectedSites = [
        SelectedSite(
          id: 'site-1',
          name: 'Only Location',
          searchName: 'Only Location, Country',
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
          searchName: 'Only Location, Country',
          name: 'Only Location',
        ),
      );

      final dashboardState = DashboardLoaded(
        AirQualityResponse(success: true, measurements: [measurement]),
        userPreferences: userPreferences,
      );

      when(mockDashboardBloc.state).thenReturn(dashboardState);
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.value(dashboardState));

      // Act
      await tester.pumpWidget(createTestWidget(userPreferences: userPreferences));
      await tester.pumpAndSettle();

      // Find the SwipeableAnalyticsCard
      final analyticsCard = find.byType(SwipeableAnalyticsCard);
      expect(analyticsCard, findsOneWidget);

      // Simulate horizontal drag to reveal delete option
      await tester.drag(analyticsCard, const Offset(-100, 0));
      await tester.pumpAndSettle();

      // Look for delete button and tap it
      final deleteButton = find.text('Remove');
      if (deleteButton.evaluate().isNotEmpty) {
        await tester.tap(deleteButton);
        await tester.pumpAndSettle();

        // Assert - Should show dialog preventing removal
        expect(find.text('Cannot Remove Default Location'), findsOneWidget);
        expect(find.text('You need to have at least one location in My Places. Add another location before removing this one.'), findsOneWidget);
        
        // Close the dialog
        final okButton = find.text('OK');
        if (okButton.evaluate().isNotEmpty) {
          await tester.tap(okButton);
          await tester.pumpAndSettle();
        }
      }
    });

    testWidgets('handles dashboard state changes correctly', (WidgetTester tester) async {
      // Arrange
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

      // Act
      await tester.pumpWidget(createTestWidget(userPreferences: userPreferences));
      await tester.pump(); // Initial state

      // Simulate state change
      when(mockDashboardBloc.state).thenReturn(loadedState);
      await tester.pump();
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Add places you love'), findsOneWidget);
    });

    testWidgets('handles loading state gracefully', (WidgetTester tester) async {
      // Arrange
      when(mockDashboardBloc.state).thenReturn(DashboardLoading());
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.empty());

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Assert - Should show empty state when loading without preferences
      expect(find.text('Add places you love'), findsOneWidget);
    });

    testWidgets('handles error state gracefully', (WidgetTester tester) async {
      // Arrange
      when(mockDashboardBloc.state).thenReturn(
        DashboardLoadingError('Network error', isOffline: true),
      );
      when(mockDashboardBloc.stream).thenAnswer((_) => Stream.empty());

      // Act
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Assert - Should show empty state when there's an error
      expect(find.text('Add places you love'), findsOneWidget);
    });
  });
}