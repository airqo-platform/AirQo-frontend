import 'package:airqo/src/app/dashboard/repository/forecast_repository.dart';
import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';

// Generate mocks
@GenerateMocks([http.Client, CacheManager])
import 'forecast_repository_test.mocks.dart';

void main() {
  group('ForecastRepository', () {
    late MockClient mockHttpClient;
    late MockCacheManager mockCacheManager;
    late ForecastImpl repository;

    setUpAll(() async {
      // Initialize dotenv for tests
      dotenv.testLoad(fileInput: '''
AIRQO_API_TOKEN=test-forecast-token-123
''');
    });

    setUp(() {
      mockHttpClient = MockClient();
      mockCacheManager = MockCacheManager();

      // Create repository with mocked dependencies
      repository = ForecastImpl(
        httpClient: mockHttpClient,
        cacheManager: mockCacheManager,
      );
    });

    tearDown(() {
      // Reset singleton for next test
      ForecastImpl.resetInstance();
    });

    group('loadForecasts', () {
      const tSiteId = 'test-site-123';
      final tForecastResponse = ForecastResponse(
        aqiRanges: {
          'good': AqiRange(
            aqiCategory: 'Good',
            aqiColor: '#00e400',
            aqiColorName: 'Green',
            label: 'Good',
            min: 0.0,
            max: 12.0,
          ),
        },
        forecasts: [
          Forecast(
            aqiCategory: 'Good',
            aqiColor: '#00e400',
            aqiColorName: 'Green',
            pm25: 8.5,
            time: DateTime.parse('2024-01-15T12:00:00Z'),
          ),
          Forecast(
            aqiCategory: 'Moderate',
            aqiColor: '#ffff00',
            aqiColorName: 'Yellow',
            pm25: 25.3,
            time: DateTime.parse('2024-01-16T12:00:00Z'),
          ),
        ],
      );

      test('should return cached forecast when available and not stale',
          () async {
        // Arrange
        final cachedData = CachedData<ForecastResponse>(
          data: tForecastResponse,
          timestamp: DateTime.now().subtract(Duration(minutes: 30)),
        );

        when(mockCacheManager.get<ForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: 'forecast_$tSiteId',
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => cachedData);

        when(mockCacheManager.shouldRefresh<ForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: 'forecast_$tSiteId',
          policy: RefreshPolicy.forecast,
          cachedData: cachedData,
          forceRefresh: false,
        )).thenReturn(false);

        when(mockCacheManager.isConnected).thenReturn(true);

        // Act
        final result = await repository.loadForecasts(tSiteId);

        // Assert
        expect(result, equals(tForecastResponse));
        expect(result.forecasts, hasLength(2));
        expect(result.forecasts[0].pm25, equals(8.5));
        expect(result.forecasts[1].pm25, equals(25.3));
      });

      test('should fetch fresh forecast data when cache is stale', () async {
        // Arrange
        final mockApiResponse = {
          'aqi_ranges': {
            'good': {
              'aqi_category': 'Good',
              'aqi_color': '#00e400',
              'aqi_color_name': 'Green',
              'label': 'Good',
              'min': 0.0,
              'max': 12.0,
            },
          },
          'forecasts': [
            {
              'aqi_category': 'Good',
              'aqi_color': '#00e400',
              'aqi_color_name': 'Green',
              'pm2_5': 10.2,
              'time': '2024-01-15T12:00:00Z',
            },
          ],
        };

        when(mockCacheManager.get<ForecastResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => null);

        when(mockCacheManager.shouldRefresh<ForecastResponse>(
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

        when(mockCacheManager.put<ForecastResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          data: anyNamed('data'),
          toJson: anyNamed('toJson'),
          etag: anyNamed('etag'),
        )).thenAnswer((_) async {});

        // Act
        final result =
            await repository.loadForecasts(tSiteId, forceRefresh: true);

        // Assert
        expect(result.forecasts, hasLength(1));
        expect(result.forecasts[0].pm25, equals(10.2));
        expect(result.forecasts[0].aqiCategory, equals('Good'));
      });

      test(
          'should throw ForecastException when network fails and no cache available',
          () async {
        // Arrange
        when(mockCacheManager.get<ForecastResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => null);

        when(mockCacheManager.shouldRefresh<ForecastResponse>(
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
          () => repository.loadForecasts(tSiteId),
          throwsA(isA<ForecastException>()),
        );
      });

      test('should return cached data when offline', () async {
        // Arrange
        final cachedData = CachedData<ForecastResponse>(
          data: tForecastResponse,
          timestamp: DateTime.now().subtract(Duration(hours: 2)),
        );

        when(mockCacheManager.get<ForecastResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => cachedData);

        // Add missing shouldRefresh stub for offline scenario
        when(mockCacheManager.shouldRefresh<ForecastResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          policy: anyNamed('policy'),
          cachedData: cachedData,
          forceRefresh: false,
        )).thenReturn(false);

        when(mockCacheManager.isConnected).thenReturn(false);

        // Act
        final result = await repository.loadForecasts(tSiteId);

        // Assert
        expect(result, equals(tForecastResponse));

        // Verify no network call was made
        verifyNever(mockHttpClient.get(any, headers: anyNamed('headers')));
      });

      test('should throw ForecastException when offline and no cache available',
          () async {
        // Arrange
        when(mockCacheManager.get<ForecastResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => null);

        // Add missing shouldRefresh stub
        when(mockCacheManager.shouldRefresh<ForecastResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          policy: anyNamed('policy'),
          cachedData: null,
          forceRefresh: false,
        )).thenReturn(true);

        when(mockCacheManager.isConnected).thenReturn(false);

        // Act & Assert
        expect(
          () => repository.loadForecasts(tSiteId),
          throwsA(
            predicate((e) =>
                e is ForecastException &&
                e.toString().contains(
                    'No internet connection and no cached forecast data available')),
          ),
        );
      });

      test('should handle HTTP 404 error with specific message', () async {
        // Arrange
        when(mockCacheManager.get<ForecastResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => null);

        when(mockCacheManager.shouldRefresh<ForecastResponse>(
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
        )).thenAnswer((_) async => http.Response(
              'Not found',
              404,
            ));

        // Act & Assert
        expect(
          () => repository.loadForecasts(tSiteId),
          throwsA(
            predicate((e) =>
                e is ForecastException &&
                e
                    .toString()
                    .contains('Forecast data not found for this location')),
          ),
        );
      });

      test('should handle server errors with cached fallback', () async {
        // Arrange
        final cachedData = CachedData<ForecastResponse>(
          data: tForecastResponse,
          timestamp: DateTime.now().subtract(Duration(hours: 5)),
        );

        when(mockCacheManager.get<ForecastResponse>(
          boxName: anyNamed('boxName'),
          key: anyNamed('key'),
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => cachedData);

        when(mockCacheManager.shouldRefresh<ForecastResponse>(
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
        )).thenAnswer((_) async => http.Response(
              'Internal Server Error',
              500,
            ));

        // Act
        final result = await repository.loadForecasts(tSiteId);

        // Assert - should return cached data despite server error
        expect(result, equals(tForecastResponse));
      });
    });

    group('clearCache', () {
      const tSiteId = 'test-site-456';

      test('should call cache manager delete with correct parameters',
          () async {
        // Arrange
        when(mockCacheManager.delete(
          boxName: CacheBoxName.forecast,
          key: 'forecast_$tSiteId',
        )).thenAnswer((_) async {});

        // Act
        await repository.clearCache(tSiteId);

        // Assert
        verify(mockCacheManager.delete(
          boxName: CacheBoxName.forecast,
          key: 'forecast_$tSiteId',
        )).called(1);
      });
    });

    group('clearAllCaches', () {
      test('should call cache manager clearBox', () async {
        // Arrange
        when(mockCacheManager.clearBox(CacheBoxName.forecast))
            .thenAnswer((_) async {});

        // Act
        await repository.clearAllCaches();

        // Assert
        verify(mockCacheManager.clearBox(CacheBoxName.forecast)).called(1);
      });
    });

    group('getForecastStream', () {
      const tSiteId = 'test-site-789';

      test('should return broadcast stream for site', () {
        // Act
        final stream = repository.getForecastStream(tSiteId);

        // Assert
        expect(stream, isA<Stream<ForecastResponse>>());
      });
    });
  });
}
