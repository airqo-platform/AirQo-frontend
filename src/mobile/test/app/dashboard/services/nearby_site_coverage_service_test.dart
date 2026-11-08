import 'dart:convert';

import 'package:airqo/src/app/dashboard/services/nearby_site_coverage_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  group('NearbySiteCoverageService', () {
    late List<http.Request> requests;
    late DateTime now;

    NearbySiteCoverageService serviceReturning(http.Response response) {
      return NearbySiteCoverageService(
        baseUrl: 'https://api.test',
        apiToken: 'tkn',
        clock: () => now,
        httpClient: MockClient((request) async {
          requests.add(request);
          return response;
        }),
      );
    }

    http.Response sitesJson(List<Map<String, Object?>> sites) => http.Response(
          json.encode({'success': true, 'sites': sites}),
          200,
        );

    /// [count] distinct sites whose device sent raw data an hour ago.
    http.Response sitesResponse(int count) => sitesJson(List.generate(
          count,
          (i) => {
            '_id': 's$i',
            'lastRawData':
                now.subtract(const Duration(hours: 1)).toIso8601String(),
          },
        ));

    String daysAgo(int days) =>
        now.subtract(Duration(days: days)).toIso8601String();

    setUp(() {
      requests = [];
      now = DateTime.utc(2026, 11, 8, 10);
    });

    test('counts sites and queries without an online_status filter', () async {
      final service = serviceReturning(sitesResponse(3));

      final count = await service.countSitesWithin(
        latitude: 0.247123,
        longitude: 32.551234,
        radiusKm: 10,
      );

      expect(count, 3);
      final params = requests.single.url.queryParameters;
      expect(requests.single.url.path, '/api/v2/devices/sites/nearest');
      expect(params['latitude'], '0.247123');
      expect(params['longitude'], '32.551234');
      expect(params['radius'], '10.0');
      expect(params['token'], 'tkn');
      expect(params['limit'], '20');
      expect(params.containsKey('online_status'), isFalse);
    });

    test('skips sites that have been silent for longer than a week', () async {
      final service = serviceReturning(sitesJson([
        {'_id': 'live', 'lastRawData': daysAgo(1)},
        {'_id': 'dead', 'lastRawData': daysAgo(90), 'lastActive': daysAgo(95)},
      ]));
      expect(
        await service.countSitesWithin(
            latitude: 0.3, longitude: 32.5, radiusKm: 10),
        1,
      );
    });

    test('a processing backlog does not hide a site whose device still sends',
        () async {
      // lastActive (processed readings) is stale, lastRawData (device feed) is
      // fresh: the site is active and its readings are on their way.
      final service = serviceReturning(sitesJson([
        {'_id': 'kla', 'lastActive': daysAgo(10), 'lastRawData': daysAgo(0)},
      ]));
      expect(
        await service.countSitesWithin(
            latitude: 0.3, longitude: 32.5, radiusKm: 10),
        1,
      );
    });

    test('falls back to lastActive when there is no raw data timestamp',
        () async {
      final service = serviceReturning(sitesJson([
        {'_id': 'a', 'lastActive': daysAgo(2), 'lastRawData': null},
        {'_id': 'b', 'lastActive': daysAgo(30)},
      ]));
      expect(
        await service.countSitesWithin(
            latitude: 0.3, longitude: 32.5, radiusKm: 10),
        1,
      );
    });

    test('skips sites that have never reported', () async {
      final service = serviceReturning(sitesJson([
        {'_id': 'new'},
        {'_id': 'bad', 'lastRawData': 'not-a-date'},
      ]));
      expect(
        await service.countSitesWithin(
            latitude: 0.3, longitude: 32.5, radiusKm: 10),
        0,
      );
    });

    test('counts a site once when the endpoint returns a row per device',
        () async {
      final service = serviceReturning(sitesJson([
        {'_id': 's1', 'lastRawData': daysAgo(0)},
        {'_id': 's1', 'lastRawData': daysAgo(0)},
        {'_id': 's2', 'lastActive': daysAgo(3)},
      ]));
      expect(
        await service.countSitesWithin(
            latitude: 0.3, longitude: 32.5, radiusKm: 10),
        2,
      );
    });

    test('returns 0 when the registry has no sites nearby', () async {
      final service = serviceReturning(sitesResponse(0));
      expect(
        await service.countSitesWithin(
            latitude: 1.5, longitude: 30.5, radiusKm: 10),
        0,
      );
    });

    test('returns null (unknown) on HTTP errors', () async {
      final service = serviceReturning(http.Response('boom', 500));
      expect(
        await service.countSitesWithin(
            latitude: 0.3, longitude: 32.5, radiusKm: 10),
        isNull,
      );
    });

    test('returns null (unknown) on validation failures', () async {
      final service = serviceReturning(http.Response(
        json.encode({'success': false, 'message': 'bad request errors'}),
        200,
      ));
      expect(
        await service.countSitesWithin(
            latitude: 0.3, longitude: 32.5, radiusKm: 10),
        isNull,
      );
    });

    test('caches results for nearby positions within the TTL', () async {
      final service = serviceReturning(sitesResponse(2));

      await service.countSitesWithin(
          latitude: 0.347101, longitude: 32.582501, radiusKm: 10);
      now = now.add(const Duration(minutes: 10));
      final second = await service.countSitesWithin(
          latitude: 0.347199, longitude: 32.582599, radiusKm: 10);

      expect(second, 2);
      expect(requests, hasLength(1));

      now = now.add(const Duration(minutes: 31));
      await service.countSitesWithin(
          latitude: 0.347101, longitude: 32.582501, radiusKm: 10);
      expect(requests, hasLength(2));
    });

    test('does not cache failures', () async {
      final service = serviceReturning(http.Response('boom', 503));
      await service.countSitesWithin(
          latitude: 0.3, longitude: 32.5, radiusKm: 10);
      await service.countSitesWithin(
          latitude: 0.3, longitude: 32.5, radiusKm: 10);
      expect(requests, hasLength(2));
    });
  });

  group('NearbySiteCoverageService.formatCoordinate', () {
    test('keeps six decimals', () {
      expect(NearbySiteCoverageService.formatCoordinate(32.5512349), '32.551235');
    });

    test('never ends in zero, so trailing-zero stripping keeps 6 decimals', () {
      expect(NearbySiteCoverageService.formatCoordinate(0.247), '0.247001');
      expect(NearbySiteCoverageService.formatCoordinate(32.0), '32.000001');
      expect(NearbySiteCoverageService.formatCoordinate(-1.28), '-1.280001');
    });
  });
}
