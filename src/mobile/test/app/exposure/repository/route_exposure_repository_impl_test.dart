import 'dart:convert';

import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/repository/route_exposure_repository_impl.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    dotenv.testLoad(mergeWith: {
      'AIRQO_API_URL': 'https://api.airqo.net',
      'AIRQO_MOBILE_TOKEN': 'test-token',
      'GOOGLE_MAPS_API_KEY': 'test-maps-key',
    });
  });

  test('buildTripExposure combines directions, nearby sites, and measurements',
      () async {
    final requests = <Uri>[];
    final repository = RouteExposureRepositoryImpl(
      httpClient: _FakeClient((request) async {
        requests.add(request.url);

        if (request.url.host == 'maps.googleapis.com') {
          return http.Response(
              jsonEncode({
                'routes': [
                  {
                    'overview_polyline': {
                      'points': '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
                    },
                    'legs': [
                      {
                        'distance': {'text': '12 km'},
                        'duration': {'text': '28 mins'},
                      }
                    ],
                  }
                ],
              }),
              200);
        }

        if (request.url.path
            .endsWith('/devices/metadata/routes/nearest-locations')) {
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['radius'], 2.5);
          expect((body['polyline'] as List).length, greaterThanOrEqualTo(2));

          return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'sites': [
                    {'_id': 'site-1', 'name': 'Central Monitor'},
                    {'_id': 'site-2', 'name': 'Roadside Monitor'},
                  ],
                },
              }),
              200);
        }

        if (request.url.path.endsWith('/devices/measurements')) {
          expect(request.url.queryParameters['recent'], 'yes');
          expect(request.url.queryParameters['site_id'], 'site-1,site-2');

          return http.Response(
              jsonEncode({
                'measurements': [
                  {
                    'site_id': 'site-1',
                    'siteDetails': {'name': 'Central Monitor'},
                    'pm2_5': {'value': 18.4},
                  },
                  {
                    'site_id': 'site-2',
                    'siteDetails': {'name': 'Roadside Monitor'},
                    'pm2_5': {'value': 42.7},
                  },
                ],
              }),
              200);
        }

        throw UnsupportedError('Unhandled request: ${request.url}');
      }),
    );

    final summary = await repository.buildTripExposure(
      origin: const SelectedSite(
        id: 'origin',
        name: 'Origin',
        searchName: 'Origin',
        latitude: 0.3476,
        longitude: 32.5825,
      ),
      destination: const SelectedSite(
        id: 'destination',
        name: 'Destination',
        searchName: 'Destination',
        latitude: 0.3136,
        longitude: 32.5811,
      ),
    );

    expect(requests, hasLength(3));
    expect(summary.distanceLabel, '12 km');
    expect(summary.durationLabel, '28 mins');
    expect(summary.nearbySites, hasLength(2));
    expect(summary.averagePm25, closeTo(30.55, 0.001));
    expect(summary.peakPm25, 42.7);
    expect(summary.highestSiteName, 'Roadside Monitor');
    expect(summary.exposureLevel?.label, 'Moderate');
  });

  test('buildTripExposure surfaces a clear directions error for zero results',
      () async {
    final repository = RouteExposureRepositoryImpl(
      httpClient: _FakeClient((request) async {
        if (request.url.host == 'maps.googleapis.com') {
          return http.Response(
            jsonEncode({
              'status': 'ZERO_RESULTS',
              'routes': [],
            }),
            200,
          );
        }

        throw UnsupportedError('Unhandled request: ${request.url}');
      }),
    );

    expect(
      () => repository.buildTripExposure(
        origin: const SelectedSite(
          id: 'origin',
          name: 'Fire Station, Nairobi',
          searchName: 'Fire Station, Nairobi',
          latitude: -1.2864,
          longitude: 36.8172,
        ),
        destination: const SelectedSite(
          id: 'destination',
          name: 'Kampala Metropolitan CPS',
          searchName: 'Kampala Metropolitan CPS',
          latitude: 0.3476,
          longitude: 32.5825,
        ),
      ),
      throwsA(
        isA<Exception>().having(
          (error) => error.toString(),
          'message',
          contains(
            'Google Maps could not find a drivable route between Fire Station, Nairobi and Kampala Metropolitan CPS',
          ),
        ),
      ),
    );
  });
}

class _FakeClient extends http.BaseClient {
  _FakeClient(this._handler);

  final Future<http.Response> Function(http.Request request) _handler;

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final httpRequest = request as http.Request;
    final response = await _handler(httpRequest);
    return http.StreamedResponse(
      Stream.value(response.bodyBytes),
      response.statusCode,
      headers: response.headers,
      request: request,
    );
  }
}
