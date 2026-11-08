import 'dart:async';
import 'dart:convert';

import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

/// Answers "does AirQo have monitoring sites near this point?" independently
/// of whether those sites currently have fresh readings.
///
/// Near You builds its list from the latest-readings payload, which only
/// contains sites that reported within the backend's lookback window. When
/// hourly processing falls behind, every site in a city can drop out of that
/// payload at once even though the sites exist. This service lets the UI tell
/// "no coverage here" apart from "readings here are delayed".
///
/// Deliberately does not filter by `online_status`: online status is derived
/// from the same hourly readings, so during a processing delay every site is
/// reported offline and an online-only lookup would find nothing.
class NearbySiteCoverageService with NetworkLoggy {
  NearbySiteCoverageService({
    http.Client? httpClient,
    String? baseUrl,
    String? apiToken,
    DateTime Function()? clock,
  })  : _httpClient = httpClient ?? http.Client(),
        _baseUrlOverride = baseUrl,
        _apiTokenOverride = apiToken,
        _clock = clock ?? DateTime.now;

  final http.Client _httpClient;
  final String? _baseUrlOverride;
  final String? _apiTokenOverride;
  final DateTime Function() _clock;

  static const Duration _requestTimeout = Duration(seconds: 8);
  static const Duration _cacheTtl = Duration(minutes: 30);

  /// Only presence matters, so ask for a handful rather than the default 30
  /// heavily-populated site documents.
  static const int _lookupLimit = 5;

  final Map<String, _CachedCount> _cache = {};

  /// Number of sites within [radiusKm] of the point (capped at the lookup
  /// limit), or `null` when the lookup failed and coverage is unknown.
  Future<int?> countSitesWithin({
    required double latitude,
    required double longitude,
    required double radiusKm,
  }) async {
    final cacheKey = '${latitude.toStringAsFixed(3)},'
        '${longitude.toStringAsFixed(3)},$radiusKm';
    final cached = _cache[cacheKey];
    if (cached != null && _clock().difference(cached.at) < _cacheTtl) {
      return cached.count;
    }

    try {
      // dotenv throws if it was never loaded (e.g. in widget tests); treat
      // that like a missing token rather than failing the caller.
      final token = _apiTokenOverride ?? dotenv.env['AIRQO_API_TOKEN'];
      if (token == null || token.isEmpty) {
        loggy.warning('Nearby coverage check skipped: no API token configured');
        return null;
      }

      final uri = Uri.parse(
        '${_baseUrlOverride ?? ApiUtils.baseUrl}${ApiUtils.nearestSites}',
      ).replace(queryParameters: {
        'latitude': formatCoordinate(latitude),
        'longitude': formatCoordinate(longitude),
        'radius': radiusKm.toString(),
        'limit': _lookupLimit.toString(),
        'token': token,
      });

      final response = await _httpClient.get(uri, headers: {
        'Accept': 'application/json',
        'User-Agent': ApiUtils.mobileUserAgent,
      }).timeout(_requestTimeout);

      if (response.statusCode != 200) {
        loggy.warning(
            'Nearby coverage check failed with status ${response.statusCode}');
        return null;
      }

      final body = json.decode(response.body);
      if (body is! Map<String, dynamic> || body['success'] == false) {
        return null;
      }
      final sites = body['sites'];
      final count = sites is List ? sites.length : 0;
      _cache[cacheKey] = _CachedCount(count, _clock());
      return count;
    } catch (e) {
      loggy.warning('Nearby coverage check error: $e');
      return null;
    }
  }

  /// The nearest-sites endpoint rejects coordinates with fewer than 5 decimal
  /// places, counted after trailing zeros are stripped (so `0.247000` fails).
  /// Emit 6 decimals and, if the last one is a zero, bump it to 1 — a shift of
  /// at most 0.000001° (~0.1 m), irrelevant at a 10 km search radius.
  static String formatCoordinate(double value) {
    final fixed = value.toStringAsFixed(6);
    if (!fixed.endsWith('0')) return fixed;
    return '${fixed.substring(0, fixed.length - 1)}1';
  }

  void dispose() => _httpClient.close();
}

class _CachedCount {
  const _CachedCount(this.count, this.at);
  final int count;
  final DateTime at;
}
