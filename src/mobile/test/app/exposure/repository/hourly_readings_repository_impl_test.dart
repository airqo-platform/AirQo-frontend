import 'dart:convert';

import 'package:airqo/src/app/exposure/repository/hourly_readings_repository_impl.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  setUpAll(() {
    dotenv.testLoad(fileInput: 'AIRQO_API_TOKEN=test-token');
  });

  test('maps documented site measurements into local hourly slots', () async {
    late Uri requestedUri;
    final client = MockClient((request) async {
      requestedUri = request.url;
      return http.Response(
        jsonEncode({
          'success': true,
          'measurements': [
            {
              'time': '2026-09-16T14:00:00.000Z',
              'pm2_5': {'value': 10.8},
            },
          ],
        }),
        200,
      );
    });

    final repository = HourlyReadingsRepositoryImpl(httpClient: client);
    final readings = await repository.fetchHourlyReadings(
      'site-1',
      DateTime(2026, 9, 16),
    );
    final expectedHour =
        DateTime.parse('2026-09-16T14:00:00.000Z').toLocal().hour;

    expect(readings, hasLength(24));
    expect(readings[expectedHour].pm25, 10.8);
    expect(requestedUri.path,
        '/api/v2/devices/measurements/sites/site-1/historical');
    expect(requestedUri.queryParameters['token'], 'test-token');
    expect(requestedUri.queryParameters, contains('startTime'));
    expect(requestedUri.queryParameters, contains('endTime'));
    expect(requestedUri.queryParameters['limit'], '1000');
  });

  test('loads multiple Favorite hourly histories in one batch request',
      () async {
    late http.Request capturedRequest;
    var requestCount = 0;
    final client = MockClient((request) async {
      requestCount += 1;
      capturedRequest = request;
      return http.Response(
        jsonEncode({
          'status': 'success',
          'data': [
            {
              'datetime': '2026-09-16 14:00:00Z',
              'site_name': 'KCCA Division Rubaga',
              'pm2_5_calibrated_value': 18.4,
            },
            {
              'datetime': '2026-09-16 15:00:00Z',
              'site_name': "Ang'awa Avenue",
              'pm2_5': 9.2,
            },
          ],
        }),
        200,
      );
    });
    const places = [
      DeclaredPlace(
        siteId: 'site-home',
        displayName: 'Home',
        locationName: 'KCCA Division Rubaga',
        city: 'Kampala',
        type: PlaceType.home,
      ),
      DeclaredPlace(
        siteId: 'site-work',
        displayName: 'Work',
        locationName: "Ang'awa Avenue",
        city: 'Kisumu',
        type: PlaceType.work,
      ),
    ];

    final repository = HourlyReadingsRepositoryImpl(httpClient: client);
    final readings = await repository.fetchHourlyReadingsForPlaces(
      places,
      DateTime(2026, 9, 16),
    );

    final homeHour = DateTime.parse('2026-09-16T14:00:00Z').toLocal().hour;
    final workHour = DateTime.parse('2026-09-16T15:00:00Z').toLocal().hour;
    expect(requestCount, 1);
    expect(capturedRequest.method, 'POST');
    expect(
      capturedRequest.url.path,
      '/api/v3/public/analytics/data-download',
    );
    final payload = jsonDecode(capturedRequest.body) as Map<String, dynamic>;
    expect(payload['sites'], ['site-home', 'site-work']);
    expect(payload['frequency'], 'hourly');
    expect(readings['site-home']?[homeHour].pm25, 18.4);
    expect(readings['site-work']?[workHour].pm25, 9.2);
  });

  test('returns explicit unavailable hours when the request fails', () async {
    final repository = HourlyReadingsRepositoryImpl(
      httpClient: MockClient((_) async => http.Response('Unauthorized', 401)),
    );

    final readings = await repository.fetchHourlyReadings(
      'site-1',
      DateTime(2026, 9, 16),
    );

    expect(readings, hasLength(24));
    expect(readings.every((reading) => reading.pm25 == null), isTrue);
  });
}
