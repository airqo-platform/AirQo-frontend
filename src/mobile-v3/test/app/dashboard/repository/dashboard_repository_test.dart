import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:http/http.dart' as http;
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

    setUp(() {
      mockHttpClient = MockClient();
      mockCacheManager = MockCacheManager();
      
      // Create repository instance - note: you may need to modify DashboardImpl 
      // to accept dependencies for testing
      repository = DashboardImpl();
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
          fromJson: any(named: 'fromJson'),
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

        final expectedResponse = AirQualityResponse.fromJson(mockApiResponse);

        when(mockCacheManager.get<AirQualityResponse>(
          boxName: any(named: 'boxName'),
          key: any(named: 'key'),
          fromJson: any(named: 'fromJson'),
        )).thenAnswer((_) async => null);

        when(mockCacheManager.shouldRefresh<AirQualityResponse>(
          boxName: any(named: 'boxName'),
          key: any(named: 'key'),
          policy: any(named: 'policy'),
          cachedData: null,
          forceRefresh: false,
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
          boxName: any(named: 'boxName'),
          key: any(named: 'key'),
          data: any(named: 'data'),
          toJson: any(named: 'toJson'),
          etag: any(named: 'etag'),
        )).thenAnswer((_) async {});

        // Act
        final result = await repository.fetchAirQualityReadings(forceRefresh: true);

        // Assert
        expect(result.success, isTrue);
        expect(result.measurements, hasLength(1));
        expect(result.measurements!.first.id, equals('fresh-id'));
        expect(result.measurements!.first.pm25!.value, equals(15.2));
      });

      test('throws exception when network fails and no cache available', () async {
        // Arrange
        when(mockCacheManager.get<AirQualityResponse>(
          boxName: any(named: 'boxName'),
          key: any(named: 'key'),
          fromJson: any(named: 'fromJson'),
        )).thenAnswer((_) async => null);

        when(mockCacheManager.shouldRefresh<AirQualityResponse>(
          boxName: any(named: 'boxName'),
          key: any(named: 'key'),
          policy: any(named: 'policy'),
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
          boxName: any(named: 'boxName'),
          key: any(named: 'key'),
          fromJson: any(named: 'fromJson'),
        )).thenAnswer((_) async => cachedData);

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
          boxName: any(named: 'boxName'),
          key: any(named: 'key'),
          fromJson: any(named: 'fromJson'),
        )).thenAnswer((_) async => null);

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
          boxName: any(named: 'boxName'),
          key: any(named: 'key'),
        )).thenThrow(Exception('Cache delete failed'));

        // Act & Assert
        expect(
          () => repository.clearCache(),
          throwsA(isA<Exception>()),
        );
      });
    });

    group('airQualityStream', () {
      test('provides stream of air quality responses', () async {
        // This tests the stream functionality if needed
        expect(repository.airQualityStream, isA<Stream<AirQualityResponse>>());
      });
    });
  });
}