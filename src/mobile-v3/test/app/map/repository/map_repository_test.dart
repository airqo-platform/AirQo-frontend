import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:http/http.dart' as http;
import 'package:airqo/src/app/map/repository/map_repository.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'dart:convert';

// Generate mocks
@GenerateMocks([http.Client])
import 'map_repository_test.mocks.dart';

void main() {
  group('MapRepository', () {
    late MockClient mockHttpClient;
    late MapImpl mapRepository;

    setUp(() {
      mockHttpClient = MockClient();
      mapRepository = MapImpl();
    });

    group('fetchAirQualityReadings', () {
      test('returns AirQualityResponse on successful HTTP 200 response', () async {
        // Arrange
        final mockResponseData = {
          'success': true,
          'message': 'Data retrieved successfully',
          'measurements': [
            {
              '_id': 'measurement-1',
              'site_id': 'site-1',
              'pm2_5': {'value': 25.5},
              'aqi_category': 'Moderate',
              'aqi_color': '#ffff00',
              'siteDetails': {
                '_id': 'site-1',
                'search_name': 'Kampala Central',
                'city': 'Kampala',
                'country': 'Uganda',
                'approximate_latitude': 0.3476,
                'approximate_longitude': 32.5825,
              }
            },
            {
              '_id': 'measurement-2',
              'site_id': 'site-2',
              'pm2_5': {'value': 15.2},
              'aqi_category': 'Good',
              'aqi_color': '#00e400',
              'siteDetails': {
                '_id': 'site-2',
                'search_name': 'Makerere University',
                'city': 'Kampala',
                'country': 'Uganda',
                'approximate_latitude': 0.3354,
                'approximate_longitude': 32.5617,
              }
            }
          ]
        };

        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          json.encode(mockResponseData),
          200,
          headers: {'content-type': 'application/json'},
        ));

        // Act
        final result = await mapRepository.fetchAirQualityReadings();

        // Assert
        expect(result, isA<AirQualityResponse>());
        expect(result.success, isTrue);
        expect(result.message, equals('Data retrieved successfully'));
        expect(result.measurements, hasLength(2));
        expect(result.measurements![0].pm25!.value, equals(25.5));
        expect(result.measurements![0].aqiCategory, equals('Moderate'));
        expect(result.measurements![0].siteDetails!.city, equals('Kampala'));
      });

      test('returns AirQualityResponse with empty measurements on HTTP 200 with empty data', () async {
        // Arrange
        final mockResponseData = {
          'success': true,
          'message': 'No measurements available',
          'measurements': []
        };

        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          json.encode(mockResponseData),
          200,
          headers: {'content-type': 'application/json'},
        ));

        // Act
        final result = await mapRepository.fetchAirQualityReadings();

        // Assert
        expect(result, isA<AirQualityResponse>());
        expect(result.success, isTrue);
        expect(result.measurements, isEmpty);
      });

      test('throws exception on HTTP 500 server error', () async {
        // Arrange
        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          'Internal Server Error',
          500,
        ));

        // Act & Assert
        expect(
          () => mapRepository.fetchAirQualityReadings(),
          throwsA(isA<Exception>()),
        );
      });

      test('throws exception on HTTP 401 unauthorized', () async {
        // Arrange
        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          'Unauthorized',
          401,
        ));

        // Act & Assert
        expect(
          () => mapRepository.fetchAirQualityReadings(),
          throwsA(isA<Exception>()),
        );
      });

      test('throws exception on HTTP 404 not found', () async {
        // Arrange
        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          'Not Found',
          404,
        ));

        // Act & Assert
        expect(
          () => mapRepository.fetchAirQualityReadings(),
          throwsA(isA<Exception>()),
        );
      });

      test('handles malformed JSON response gracefully', () async {
        // Arrange
        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          'Invalid JSON{',
          200,
        ));

        // Act & Assert
        expect(
          () => mapRepository.fetchAirQualityReadings(),
          throwsA(isA<FormatException>()),
        );
      });

      test('handles network timeout', () async {
        // Arrange
        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenThrow(Exception('Connection timeout'));

        // Act & Assert
        expect(
          () => mapRepository.fetchAirQualityReadings(),
          throwsA(isA<Exception>()),
        );
      });

      test('includes correct headers in request', () async {
        // Arrange
        final mockResponseData = {
          'success': true,
          'measurements': []
        };

        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          json.encode(mockResponseData),
          200,
        ));

        // Act
        await mapRepository.fetchAirQualityReadings();

        // Assert
        verify(mockHttpClient.get(
          any,
          headers: argThat(
            containsPair('token', anything),
            named: 'headers',
          ),
        )).called(1);
      });

      test('handles response with missing required fields', () async {
        // Arrange - Response missing some required fields
        final mockResponseData = {
          'success': true,
          'measurements': [
            {
              '_id': 'incomplete-measurement',
              // Missing site_id, pm2_5, etc.
            }
          ]
        };

        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          json.encode(mockResponseData),
          200,
        ));

        // Act
        final result = await mapRepository.fetchAirQualityReadings();

        // Assert - Should handle gracefully
        expect(result, isA<AirQualityResponse>());
        expect(result.measurements, hasLength(1));
        expect(result.measurements![0].id, equals('incomplete-measurement'));
      });

      test('handles measurements with various AQI categories', () async {
        // Arrange
        final mockResponseData = {
          'success': true,
          'measurements': [
            {
              '_id': 'good-air',
              'pm2_5': {'value': 8.0},
              'aqi_category': 'Good',
              'aqi_color': '#00e400',
            },
            {
              '_id': 'moderate-air',
              'pm2_5': {'value': 25.0},
              'aqi_category': 'Moderate',
              'aqi_color': '#ffff00',
            },
            {
              '_id': 'unhealthy-air',
              'pm2_5': {'value': 65.0},
              'aqi_category': 'Unhealthy',
              'aqi_color': '#ff0000',
            },
            {
              '_id': 'hazardous-air',
              'pm2_5': {'value': 300.0},
              'aqi_category': 'Hazardous',
              'aqi_color': '#7e0023',
            }
          ]
        };

        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          json.encode(mockResponseData),
          200,
        ));

        // Act
        final result = await mapRepository.fetchAirQualityReadings();

        // Assert
        expect(result.measurements, hasLength(4));
        expect(result.measurements![0].aqiCategory, equals('Good'));
        expect(result.measurements![1].aqiCategory, equals('Moderate'));
        expect(result.measurements![2].aqiCategory, equals('Unhealthy'));
        expect(result.measurements![3].aqiCategory, equals('Hazardous'));
        
        // Check PM2.5 values
        expect(result.measurements![0].pm25!.value, equals(8.0));
        expect(result.measurements![3].pm25!.value, equals(300.0));
      });

      test('handles measurements from different countries', () async {
        // Arrange
        final mockResponseData = {
          'success': true,
          'measurements': [
            {
              '_id': 'uganda-measurement',
              'siteDetails': {
                'city': 'Kampala',
                'country': 'Uganda',
              }
            },
            {
              '_id': 'kenya-measurement',
              'siteDetails': {
                'city': 'Nairobi',
                'country': 'Kenya',
              }
            },
            {
              '_id': 'ghana-measurement',
              'siteDetails': {
                'city': 'Accra',
                'country': 'Ghana',
              }
            }
          ]
        };

        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          json.encode(mockResponseData),
          200,
        ));

        // Act
        final result = await mapRepository.fetchAirQualityReadings();

        // Assert
        expect(result.measurements, hasLength(3));
        
        final countries = result.measurements!
            .map((m) => m.siteDetails?.country)
            .where((country) => country != null)
            .toList();
        
        expect(countries, containsAll(['Uganda', 'Kenya', 'Ghana']));
      });

      test('verifies API endpoint URL construction', () async {
        // Arrange
        final mockResponseData = {'success': true, 'measurements': []};

        when(mockHttpClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          json.encode(mockResponseData),
          200,
        ));

        // Act
        await mapRepository.fetchAirQualityReadings();

        // Assert - Verify the correct API endpoint was called
        final captured = verify(mockHttpClient.get(
          captureAny,
          headers: anyNamed('headers'),
        )).captured;
        
        expect(captured.length, equals(1));
        final uri = captured[0] as Uri;
        expect(uri.toString(), contains('api.airqo.net'));
        expect(uri.toString(), contains('/api/v2/devices/measurements'));
      });
    });
  });
}