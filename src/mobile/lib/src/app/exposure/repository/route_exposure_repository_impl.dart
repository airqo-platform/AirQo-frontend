import 'dart:convert';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/models/route_exposure_summary.dart';
import 'package:airqo/src/app/exposure/repository/route_exposure_repository.dart';
import 'package:airqo/src/app/exposure/services/route_exposure_summary_builder.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class RouteExposureRepositoryImpl implements RouteExposureRepository {
  RouteExposureRepositoryImpl({
    http.Client? httpClient,
    RouteExposureSummaryBuilder? summaryBuilder,
  })  : _httpClient = httpClient ?? http.Client(),
        _summaryBuilder = summaryBuilder ?? const RouteExposureSummaryBuilder();

  final http.Client _httpClient;
  final RouteExposureSummaryBuilder _summaryBuilder;

  @override
  Future<RouteExposureSummary> buildTripExposure({
    required SelectedSite origin,
    required SelectedSite destination,
    double radiusKm = 2.5,
  }) async {
    final originLat = origin.latitude;
    final originLng = origin.longitude;
    final destinationLat = destination.latitude;
    final destinationLng = destination.longitude;

    if (originLat == null || originLng == null) {
      throw Exception('The origin location is missing coordinates.');
    }
    if (destinationLat == null || destinationLng == null) {
      throw Exception('The destination location is missing coordinates.');
    }

    final directions = await _fetchDirections(
      originName: origin.name,
      originLat: originLat,
      originLng: originLng,
      destinationName: destination.name,
      destinationLat: destinationLat,
      destinationLng: destinationLng,
    );
    final nearbySites = await _fetchNearbySites(
      routePoints: directions.routePoints,
      radiusKm: radiusKm,
    );
    final measurements = await _fetchMeasurements(nearbySites);

    return _summaryBuilder.build(
      origin: origin,
      destination: destination,
      distanceLabel: directions.distanceLabel,
      durationLabel: directions.durationLabel,
      radiusKm: radiusKm,
      sampledPointCount: directions.routePoints.length,
      nearbySites: nearbySites,
      measurements: measurements,
    );
  }

  Future<_DirectionsRoute> _fetchDirections({
    required String originName,
    required double originLat,
    required double originLng,
    required String destinationName,
    required double destinationLat,
    required double destinationLng,
  }) async {
    final apiKey = dotenv.env['GOOGLE_MAPS_API_KEY'];
    if (apiKey == null || apiKey.isEmpty) {
      throw Exception(
          'GOOGLE_MAPS_API_KEY is missing from the mobile environment.');
    }

    final uri = Uri.https('maps.googleapis.com', '/maps/api/directions/json', {
      'origin': '$originLat,$originLng',
      'destination': '$destinationLat,$destinationLng',
      'mode': 'driving',
      'key': apiKey,
    });

    final response = await _httpClient.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to fetch trip directions.');
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final status = (body['status'] ?? '').toString();
    final errorMessage = (body['error_message'] ?? '').toString();
    final routes = (body['routes'] as List<dynamic>? ?? const []);
    if (routes.isEmpty) {
      throw Exception(
        _directionsErrorMessage(
          originName: originName,
          destinationName: destinationName,
          status: status,
          errorMessage: errorMessage,
        ),
      );
    }

    final route = routes.first as Map<String, dynamic>;
    final legs = (route['legs'] as List<dynamic>? ?? const []);
    if (legs.isEmpty) {
      throw Exception('No trip leg details were returned for this route.');
    }

    final leg = legs.first as Map<String, dynamic>;
    final encodedPolyline = ((route['overview_polyline']
            as Map<String, dynamic>?)?['points'] as String?) ??
        '';
    final routePoints = _thinPolyline(_decodePolyline(encodedPolyline));
    if (routePoints.length < 2) {
      throw Exception('The route polyline was too short to analyze.');
    }

    return _DirectionsRoute(
      routePoints: routePoints,
      distanceLabel:
          ((leg['distance'] as Map<String, dynamic>?)?['text'] as String?) ??
              '--',
      durationLabel:
          ((leg['duration'] as Map<String, dynamic>?)?['text'] as String?) ??
              '--',
    );
  }

  Future<List<RouteMonitoringSite>> _fetchNearbySites({
    required List<_RoutePoint> routePoints,
    required double radiusKm,
  }) async {
    final response = await _httpClient.post(
      Uri.parse(
          '${ApiUtils.baseUrl}/api/v2/devices/metadata/routes/nearest-locations'),
      headers: await _getAuthHeaders(),
      body: jsonEncode({
        'polyline': routePoints
            .map((point) => {
                  'lat': point.lat,
                  'lng': point.lng,
                })
            .toList(),
        'radius': radiusKm,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to find monitoring locations near this route.');
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final data = body['data'] ?? body;
    final rawSites = data is Map<String, dynamic>
        ? data['sites'] ?? data['siteDetails']
        : data;
    if (rawSites is! List) {
      return const [];
    }

    final seenIds = <String>{};
    final sites = <RouteMonitoringSite>[];
    for (final item in rawSites.whereType<Map<String, dynamic>>()) {
      final id =
          (item['_id'] ?? item['id'] ?? item['site_id'] ?? '').toString();
      if (id.isEmpty || seenIds.contains(id)) {
        continue;
      }
      final name = (item['name'] ??
              item['site_name'] ??
              item['search_name'] ??
              'Unnamed site')
          .toString();
      seenIds.add(id);
      sites.add(RouteMonitoringSite(id: id, name: name));
    }
    return sites;
  }

  Future<List<Measurement>> _fetchMeasurements(
      List<RouteMonitoringSite> nearbySites) async {
    if (nearbySites.isEmpty) {
      return const [];
    }

    final uri =
        Uri.parse('${ApiUtils.baseUrl}/api/v2/devices/measurements').replace(
      queryParameters: {
        'site_id': nearbySites.map((site) => site.id).join(','),
        'recent': 'yes',
      },
    );

    final response =
        await _httpClient.get(uri, headers: await _getAuthHeaders());
    if (response.statusCode != 200) {
      throw Exception('Failed to fetch route measurements.');
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final rawMeasurements = body['measurements'] ??
        body['data'] ??
        body['readings'] ??
        ((body['data'] is Map<String, dynamic>)
            ? body['data']['measurements']
            : null);

    if (rawMeasurements is! List) {
      return const [];
    }

    return rawMeasurements
        .whereType<Map<String, dynamic>>()
        .map(Measurement.fromJson)
        .where((measurement) => measurement.pm25?.value != null)
        .toList();
  }

  Future<Map<String, String>> _getAuthHeaders() async {
    final headers = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': ApiUtils.mobileUserAgent,
    };

    final userToken = await SecureStorageRepository.instance
        .getSecureData(SecureStorageKeys.authToken);
    if (userToken != null && userToken.isNotEmpty) {
      headers['Authorization'] = 'JWT $userToken';
      return headers;
    }

    final appToken = dotenv.env['AIRQO_MOBILE_TOKEN'];
    if (appToken != null && appToken.isNotEmpty) {
      headers['Authorization'] = 'JWT $appToken';
    }
    return headers;
  }

  List<_RoutePoint> _decodePolyline(String encoded) {
    if (encoded.isEmpty) {
      return const [];
    }

    final points = <_RoutePoint>[];
    var index = 0;
    var lat = 0;
    var lng = 0;

    while (index < encoded.length) {
      var shift = 0;
      var result = 0;
      int byte;
      do {
        byte = encoded.codeUnitAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      final deltaLat = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        byte = encoded.codeUnitAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      final deltaLng = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
      lng += deltaLng;

      points.add(_RoutePoint(lat / 1E5, lng / 1E5));
    }

    return points;
  }

  List<_RoutePoint> _thinPolyline(List<_RoutePoint> points,
      {int maxPoints = 60}) {
    if (points.length <= maxPoints) {
      return points;
    }

    final stride = (points.length / maxPoints).ceil();
    final sampled = <_RoutePoint>[];
    for (var index = 0; index < points.length; index += stride) {
      sampled.add(points[index]);
    }
    if (sampled.last != points.last) {
      sampled.add(points.last);
    }
    return sampled;
  }

  String _directionsErrorMessage({
    required String originName,
    required String destinationName,
    required String status,
    required String errorMessage,
  }) {
    final statusText = status.isEmpty ? 'UNKNOWN' : status;
    final providerDetail = errorMessage.isEmpty ? '' : ' $errorMessage';

    switch (statusText) {
      case 'ZERO_RESULTS':
        return 'Google Maps could not find a drivable route between $originName and $destinationName using the saved place coordinates. Try a different pair of saved places or re-save one of them.';
      case 'NOT_FOUND':
        return 'Google Maps could not recognize the saved coordinates for $originName or $destinationName. Try re-saving the place.$providerDetail';
      case 'REQUEST_DENIED':
        return 'Google Maps rejected the route request.$providerDetail';
      case 'OVER_QUERY_LIMIT':
        return 'Google Maps rate-limited the route request. Please try again in a moment.';
      case 'INVALID_REQUEST':
        return 'The route request was incomplete. Please try a different trip.';
      default:
        return 'Google Maps did not return a usable route between $originName and $destinationName ($statusText).$providerDetail';
    }
  }
}

class _DirectionsRoute {
  final List<_RoutePoint> routePoints;
  final String distanceLabel;
  final String durationLabel;

  const _DirectionsRoute({
    required this.routePoints,
    required this.distanceLabel,
    required this.durationLabel,
  });
}

class _RoutePoint {
  final double lat;
  final double lng;

  const _RoutePoint(this.lat, this.lng);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is _RoutePoint &&
          runtimeType == other.runtimeType &&
          lat == other.lat &&
          lng == other.lng;

  @override
  int get hashCode => Object.hash(lat, lng);
}
