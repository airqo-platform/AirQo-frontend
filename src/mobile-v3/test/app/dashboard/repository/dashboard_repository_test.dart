import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'dart:async';

// Generate mocks
@GenerateMocks([http.Client, CacheManager])
import 'dashboard_repository_test.mocks.dart';

void main() {
  group('DashboardRepository', () {
    late MockClient mockHttpClient;
    late MockCacheManager mockCacheManager;
    late DashboardImpl repository;

    setUpAll(() async {
      // Initialize dotenv for tests
      dotenv.testLoad(fileInput: '''
AIRQO_API_TOKEN=test-token-123
''');
    });

    setUp(() {
      mockHttpClient = MockClient();
      mockCacheManager = MockCacheManager();
      
      // Create repository with mocked dependencies
      repository = DashboardImpl(
        httpClient: mockHttpClient,
        cacheManager: mockCacheManager,
      );
    });

    tearDown(() {
      // Reset singleton for next test
      DashboardImpl.resetInstance();
    });

    group('fetchAirQualityReadings', () {
      test('returns cached data when available and not stale', () async {
        // Arrange
        final mockResponse = AirQualityResponse(
          success: true,
          message: 'Success',
          measurements: [
            Measurement(
              id: 'test-id',
              siteId: 'test-site-id',
              pm25: Pm25(value: 25.5),
              aqiCategory: 'Good',
            )
          ],
        );
        
        final cachedData = CachedData<AirQualityResponse>(
          data: mockResponse,
          timestamp: DateTime.now().subtract(Duration(minutes: 30)),
        );

        when(mockCacheManager.get<AirQualityResponse>(
          boxName: CacheBoxName.airQuality,
          key: 'air_quality_readings',
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => cachedData);

        when(mockCacheManager.shouldRefresh<AirQualityResponse>(
          boxName: CacheBoxName.airQuality,
          key: 'air_quality_readings',
          policy: RefreshPolicy.airQuality,
          cachedData: cachedData,
          forceRefresh: false,
        )).thenReturn(false);

        when(mockCacheManager.isConnected).thenReturn(true);

        // Act
        final result = await repository.fetchAirQualityReadings();

        // Assert
        expect(result, equals(mockResponse));
        expect(result.success, isTrue);
        expect(result.measurements, hasLength(1));
        expect(result.measurements!.first.pm25!.value, equals(25.5));
        
        // Verify cache was checked
        verify(mockCacheManager.get<AirQualityResponse>(
          boxName: CacheBoxName.airQuality,
          key: 'air_quality_readings',
          fromJson: anyNamed('fromJson'),
        )).called(1);
      });

      test('fetches fresh data when cache is stale', () async {
        // Arrange
        final mockApiResponse = {
          'success': true,
          'message': 'Success',
          'measurements': [
            {
              '_id': 'fresh-id',
              'site_id': 'fresh-site-id',
              'pm2_5': {'value': 15.2},
              'aqi_category': 'Good',
              'siteDetails': {
                '_id': 'site-detail-id',
                'search_name': 'Test Location',
                'city': 'Test City',
                'country': 'Test Country',
              }
            }
          ]
        };

        when(mockCacheManager.get<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => null);

        when(mockCacheManager.shouldRefresh<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          policy: anyNamed('policy'),
          cachedData: null,
          forceRefresh: true,
        )).thenReturn(true);

        when(mockCacheManager.isConnected).thenReturn(true);

        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          json.encode(mockApiResponse),
          200,
          headers: {'content-type': 'application/json'},
        ));

        when(mockCacheManager.put<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          data: anyNamed('data'),
          toJson: anyNamed('toJson'),
          etag: anyNamed('etag'),
        )).thenAnswer((_) async {});

        // Act
        final result = await repository.fetchAirQualityReadings(forceRefresh: true);

        // Assert
        expect(result.success, isTrue);
        expect(result.measurements, hasLength(1));
        expect(result.measurements!.first.id, equals('fresh-id'));
        expect(result.measurements!.first.pm25!.value, equals(15.2));
        
        // Verify HTTP call was made
        verify(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).called(1);
        
        // Verify data was cached
        verify(mockCacheManager.put<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          data: anyNamed('data'),
          toJson: anyNamed('toJson'),
          etag: anyNamed('etag'),
        )).called(1);
      });

      test('throws exception when network fails and no cache available', () async {
        // Arrange
        when(mockCacheManager.get<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => null);

        when(mockCacheManager.shouldRefresh<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          policy: anyNamed('policy'),
          cachedData: null,
          forceRefresh: false,
        )).thenReturn(true);

        when(mockCacheManager.isConnected).thenReturn(true);

        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenThrow(Exception('Network error'));

        // Act & Assert
        expect(
          () => repository.fetchAirQualityReadings(),
          throwsA(isA<Exception>()),
        );
      });

      test('returns cached data when offline', () async {
        // Arrange
        final mockResponse = AirQualityResponse(
          success: true,
          message: 'Cached data',
          measurements: [
            Measurement(
              id: 'cached-id',
              siteId: 'cached-site-id',
              pm25: Pm25(value: 30.0),
              aqiCategory: 'Moderate',
            )
          ],
        );
        
        final cachedData = CachedData<AirQualityResponse>(
          data: mockResponse,
          timestamp: DateTime.now().subtract(Duration(hours: 2)),
        );

        when(mockCacheManager.get<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => cachedData);

        // Add the missing shouldRefresh stub
        when(mockCacheManager.shouldRefresh<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          policy: anyNamed('policy'),
          cachedData: cachedData,
          forceRefresh: false,
        )).thenReturn(false);

        when(mockCacheManager.isConnected).thenReturn(false);

        // Act
        final result = await repository.fetchAirQualityReadings();

        // Assert
        expect(result, equals(mockResponse));
        expect(result.measurements!.first.pm25!.value, equals(30.0));
        
        // Verify no network call was made
        verifyNever(mockHttpClient.get(any, headers: anyNamed('headers')));
      });

      test('throws exception when offline and no cache available', () async {
        // Arrange
        when(mockCacheManager.get<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => null);

        // Add the missing shouldRefresh stub
        when(mockCacheManager.shouldRefresh<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          policy: anyNamed('policy'),
          cachedData: null,
          forceRefresh: false,
        )).thenReturn(true);

        when(mockCacheManager.isConnected).thenReturn(false);

        // Act & Assert
        expect(
          () => repository.fetchAirQualityReadings(),
          throwsA(
            predicate((e) => 
              e is Exception && 
              e.toString().contains('No internet connection and no cached data available')
            ),
          ),
        );
      });

      test('handles HTTP error with cached fallback', () async {
        // Arrange
        final cachedResponse = AirQualityResponse(
          success: true,
          message: 'Cached data',
          measurements: [
            Measurement(id: 'cached-id', pm25: Pm25(value: 20.0))
          ],
        );
        
        final cachedData = CachedData<AirQualityResponse>(
          data: cachedResponse,
          timestamp: DateTime.now().subtract(Duration(hours: 1)),
        );

        when(mockCacheManager.get<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => cachedData);

        when(mockCacheManager.shouldRefresh<AirQualityResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          policy: anyNamed('policy'),
          cachedData: cachedData,
          forceRefresh: false,
        )).thenReturn(true);

        when(mockCacheManager.isConnected).thenReturn(true);

        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response('Server Error', 500));

        // Act
        final result = await repository.fetchAirQualityReadings();

        // Assert - Should return cached data despite HTTP error
        expect(result, equals(cachedResponse));
        expect(result.measurements!.first.pm25!.value, equals(20.0));
      });
    });

    group('clearCache', () {
      test('calls cache manager delete with correct parameters', () async {
        // Arrange
        when(mockCacheManager.delete(
          boxName: CacheBoxName.airQuality,
          key: 'air_quality_readings',
        )).thenAnswer((_) async {});

        // Act
        await repository.clearCache();

        // Assert
        verify(mockCacheManager.delete(
          boxName: CacheBoxName.airQuality,
          key: 'air_quality_readings',
        )).called(1);
      });

      test('propagates exception from cache manager', () async {
        // Arrange
        when(mockCacheManager.delete(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
        )).thenThrow(Exception('Cache delete failed'));

        // Act & Assert
        expect(
          () => repository.clearCache(),
          throwsA(isA<Exception>()),
        );
      });
    });

    group('airQualityStream', () {
      test('provides stream of air quality responses', () {
        // Act & Assert
        expect(repository.airQualityStream, isA<Stream<AirQualityResponse>>());
      });
    });
  });

  group('DashboardImpl Production Usage', () {
    test('maintains singleton behavior when no dependencies provided', () {
      // Reset any existing instance
      DashboardImpl.resetInstance();
      
      final instance1 = DashboardImpl();
      final instance2 = DashboardImpl();
      
      expect(identical(instance1, instance2), isTrue);
    });

    test('creates new instances when dependencies are provided', () {
      final mockClient1 = MockClient();
      final mockClient2 = MockClient();
      
      final instance1 = DashboardImpl(httpClient: mockClient1);
      final instance2 = DashboardImpl(httpClient: mockClient2);
      
      expect(identical(instance1, instance2), isFalse);
    });
  });
}