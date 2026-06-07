import 'package:airqo/src/app/dashboard/repository/forecast_repository.dart';
import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';

@GenerateMocks([http.Client, CacheManager])
import 'forecast_repository_test.mocks.dart';

void main() {
  group('ForecastRepository', () {
    late MockClient mockHttpClient;
    late MockCacheManager mockCacheManager;
    late ForecastImpl repository;

    setUpAll(() async {
      dotenv.testLoad(fileInput: '''
AIRQO_API_TOKEN=test-forecast-token-123
AIRQO_MOBILE_TOKEN=test-mobile-token
''');
    });

    setUp(() {
      mockHttpClient = MockClient();
      mockCacheManager = MockCacheManager();
      repository = ForecastImpl(
        httpClient: mockHttpClient,
        cacheManager: mockCacheManager,
      );
    });

    tearDown(() {
      ForecastImpl.resetInstance();
    });

    group('loadForecasts', () {
      const tSiteId = 'test-site-123';
      final tForecastResponse = ForecastResponse(
        forecasts: [
          Forecast(
            aqiCategory: 'Good',
            aqiColor: '#00E400',
            aqiColorName: 'Green',
            pm25: 8.5,
            time: DateTime.parse('2024-01-15T00:00:00Z'),
          ),
          Forecast(
            aqiCategory: 'Moderate',
            aqiColor: '#FFFF00',
            aqiColorName: 'Yellow',
            pm25: 25.3,
            time: DateTime.parse('2024-01-16T00:00:00Z'),
          ),
        ],
      );

      test('should return cached forecast when available and not stale',
          () async {
        final cachedData = CachedData<ForecastResponse>(
          data: tForecastResponse,
          timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
        );

        when(mockCacheManager.get<ForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: 'daily_forecast_$tSiteId',
          fromJson: anyNamed('fromJson'),
        )).thenAnswer((_) async => cachedData);

        when(mockCacheManager.shouldRefresh<ForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: 'daily_forecast_$tSiteId',
          policy: RefreshPolicy.forecast,
          cachedData: cachedData,
          forceRefresh: false,
        )).thenReturn(false);

        when(mockCacheManager.isConnected).thenReturn(true);

        final result = await repository.loadForecasts(tSiteId);

        expect(result.forecasts, hasLength(2));
        expect(result.forecasts[0].pm25, equals(8.5));
        expect(result.forecasts[1].pm25, equals(25.3));
      });

      test('should fetch fresh forecast data when cache is stale', () async {
        final mockApiResponse = {
          'success': true,
          'data': {
            'forecasts': [
              {
                'site_details': {'site_id': tSiteId, 'site_name': 'Test Site'},
                'forecasts': [
                  {
                    'date': '2024-01-15',
                    'forecast': {'pm2_5_mean': 10.2, 'forecast_confidence': 85.0},
                    'aqi': {'label': 'Good'},
                    'met': {'air_temperature': 24.0, 'relative_humidity': 70.0},
                  },
                ],
              },
            ],
          },
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

        final result =
            await repository.loadForecasts(tSiteId, forceRefresh: true);

        expect(result.forecasts, hasLength(1));
        expect(result.forecasts[0].pm25, equals(10.2));
        expect(result.forecasts[0].aqiCategory, equals('Good'));
        expect(result.forecasts[0].forecastConfidence, equals(85.0));
      });

      test('should throw ForecastException when network fails and no cache',
          () async {
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

        expect(
          () => repository.loadForecasts(tSiteId),
          throwsA(isA<ForecastException>()),
        );
      });

      test('should return cached data when offline', () async {
        final cachedData = CachedData<ForecastResponse>(
          data: tForecastResponse,
          timestamp: DateTime.now().subtract(const Duration(hours: 2)),
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
        )).thenReturn(false);

        when(mockCacheManager.isConnected).thenReturn(false);

        final result = await repository.loadForecasts(tSiteId);

        expect(result.forecasts, hasLength(2));
        verifyNever(mockHttpClient.get(any, headers: anyNamed('headers')));
      });

      test('should throw ForecastException when offline and no cache',
          () async {
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

        when(mockCacheManager.isConnected).thenReturn(false);

        expect(
          () => repository.loadForecasts(tSiteId),
          throwsA(isA<ForecastException>()),
        );
      });

      test('should handle HTTP 404 error with specific message', () async {
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
        )).thenAnswer((_) async => http.Response('Not found', 404));

        expect(
          () => repository.loadForecasts(tSiteId),
          throwsA(
            predicate((e) =>
                e is ForecastException &&
                e.toString().contains('Forecast not found')),
          ),
        );
      });

      test('should handle server errors with cached fallback', () async {
        final cachedData = CachedData<ForecastResponse>(
          data: tForecastResponse,
          timestamp: DateTime.now().subtract(const Duration(hours: 5)),
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
        )).thenAnswer(
            (_) async => http.Response('Internal Server Error', 500));

        final result = await repository.loadForecasts(tSiteId);

        expect(result.forecasts, hasLength(2));
      });
    });

    group('clearCache', () {
      const tSiteId = 'test-site-456';

      test('should call cache manager delete for daily and hourly keys',
          () async {
        when(mockCacheManager.delete(
          boxName: CacheBoxName.forecast,
          key: anyNamed('key'),
        )).thenAnswer((_) async {});

        await repository.clearCache(tSiteId);

        verify(mockCacheManager.delete(
          boxName: CacheBoxName.forecast,
          key: 'daily_forecast_$tSiteId',
        )).called(1);
        verify(mockCacheManager.delete(
          boxName: CacheBoxName.forecast,
          key: 'hourly_forecast_$tSiteId',
        )).called(1);
      });
    });

    group('clearAllCaches', () {
      test('should call cache manager clearBox', () async {
        when(mockCacheManager.clearBox(CacheBoxName.forecast))
            .thenAnswer((_) async {});

        await repository.clearAllCaches();

        verify(mockCacheManager.clearBox(CacheBoxName.forecast)).called(1);
      });
    });

    group('getForecastStream', () {
      const tSiteId = 'test-site-789';

      test('should return broadcast stream for site', () {
        final stream = repository.getForecastStream(tSiteId);
        expect(stream, isA<Stream<ForecastResponse>>());
      });
    });
  });
}
