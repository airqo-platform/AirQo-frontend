import 'dart:async';
import 'dart:convert';
import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:http/http.dart' as http;

class ForecastException implements Exception {
  final String message;
  final bool isNetworkError;

  ForecastException(this.message, {this.isNetworkError = false});

  @override
  String toString() => message;
}

abstract class ForecastRepository extends BaseRepository {
  Future<ForecastResponse> loadForecasts(String siteId,
      {bool forceRefresh = false});

  Future<HourlyForecastResponse> loadHourlyForecasts(String siteId,
      {bool forceRefresh = false});

  Future<void> clearCache(String siteId);

  Future<void> clearAllCaches();

  Stream<ForecastResponse> getForecastStream(String siteId);
}

class ForecastImpl extends ForecastRepository with UiLoggy {
  static ForecastImpl? _instance;

  final CacheManager _cacheManager;
  final http.Client _httpClient;

  ForecastImpl._internal({
    CacheManager? cacheManager,
    http.Client? httpClient,
  })  : _cacheManager = cacheManager ?? CacheManager(),
        _httpClient = httpClient ?? http.Client();

  factory ForecastImpl({
    CacheManager? cacheManager,
    http.Client? httpClient,
  }) {
    if (cacheManager != null || httpClient != null) {
      return ForecastImpl._internal(
        cacheManager: cacheManager,
        httpClient: httpClient,
      );
    }
    return _instance ??= ForecastImpl._internal();
  }

  static void resetInstance() {
    _instance = null;
  }

  final Map<String, StreamController<ForecastResponse>> _forecastControllers =
      {};

  String _getDailyCacheKey(String siteId) => 'daily_forecast_$siteId';
  String _getHourlyCacheKey(String siteId) => 'hourly_forecast_$siteId';

  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'User-Agent': ApiUtils.mobileUserAgent,
  };

  Map<String, String> _baseParams(String siteId) => {
        'token': dotenv.env['AIRQO_API_TOKEN'] ?? '',
        'site_id': siteId,
      };

  Map<String, String> _hourlyQueryParams(String siteId) => {
        ..._baseParams(siteId),
        'limit': '240',
      };

  @override
  Future<ForecastResponse> loadForecasts(String siteId,
      {bool forceRefresh = false}) async {
    loggy.info('Loading daily forecasts for site $siteId');

    final cacheKey = _getDailyCacheKey(siteId);

    final cachedData = await _cacheManager.get<ForecastResponse>(
      boxName: CacheBoxName.forecast,
      key: cacheKey,
      fromJson: (json) => ForecastResponse.fromJson(json),
    );

    final shouldRefresh = _cacheManager.shouldRefresh(
      boxName: CacheBoxName.forecast,
      key: cacheKey,
      policy: RefreshPolicy.forecast,
      cachedData: cachedData,
      forceRefresh: forceRefresh,
    );

    if (cachedData != null && !shouldRefresh) {
      if (_cacheManager.isConnected) _refreshDailyInBackground(siteId);
      return cachedData.data;
    }

    if (_cacheManager.isConnected) {
      try {
        final url = Uri.parse(
            '${ApiUtils.baseUrl}${ApiUtils.fetchDailyForecasts}').replace(
          queryParameters: _baseParams(siteId),
        );

        loggy.info('Fetching daily forecast: $url');
        final response = await _httpClient
            .get(url, headers: _headers)
            .timeout(const Duration(seconds: 15), onTimeout: () {
          throw ForecastException('Request timed out.', isNetworkError: true);
        });

        loggy.info('Daily forecast response: ${response.statusCode} — ${response.body.length > 200 ? response.body.substring(0, 200) : response.body}');

        if (response.statusCode != 200) {
          if (cachedData != null && response.statusCode >= 500) {
            return cachedData.data;
          }
          _throwHttpError(response.statusCode);
        }

        final decoded = json.decode(response.body) as Map<String, dynamic>;
        if (decoded['success'] == false) {
          loggy.warning('API returned success=false: ${decoded['message']}');
          if (cachedData != null) return cachedData.data;
          throw ForecastException(
              decoded['message'] ?? 'Forecast unavailable for this site.');
        }

        final parsed = ForecastResponse.fromJson(decoded);

        await _cacheManager.put<ForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: cacheKey,
          data: parsed,
          toJson: (d) => parsed.toJson(),
          etag: response.headers['etag'],
        );

        _notifyListeners(siteId, parsed);
        return parsed;
      } catch (e) {
        loggy.error('Error fetching daily forecast: $e');
        if (cachedData != null) return cachedData.data;
        if (e is ForecastException) rethrow;
        throw ForecastException('Failed to load forecast: ${e.toString()}',
            isNetworkError: _isNetworkError(e));
      }
    } else {
      if (cachedData != null) return cachedData.data;
      throw ForecastException(
          'No connection. Please check your network.',
          isNetworkError: true);
    }
  }

  @override
  Future<HourlyForecastResponse> loadHourlyForecasts(String siteId,
      {bool forceRefresh = false}) async {
    loggy.info('Loading hourly forecasts for site $siteId');

    final cacheKey = _getHourlyCacheKey(siteId);

    final cachedData = await _cacheManager.get<HourlyForecastResponse>(
      boxName: CacheBoxName.forecast,
      key: cacheKey,
      fromJson: (json) => HourlyForecastResponse.fromJson(json),
    );

    final shouldRefresh = _cacheManager.shouldRefresh(
      boxName: CacheBoxName.forecast,
      key: cacheKey,
      policy: RefreshPolicy.forecast,
      cachedData: cachedData,
      forceRefresh: forceRefresh,
    );

    if (cachedData != null && !shouldRefresh) return cachedData.data;

    if (_cacheManager.isConnected) {
      try {
        final url = Uri.parse(
            '${ApiUtils.baseUrl}${ApiUtils.fetchHourlyForecasts}').replace(
          queryParameters: _hourlyQueryParams(siteId),
        );

        final response = await _httpClient
            .get(url, headers: _headers)
            .timeout(const Duration(seconds: 15), onTimeout: () {
          throw ForecastException('Request timed out.', isNetworkError: true);
        });

        if (response.statusCode != 200) {
          if (cachedData != null && response.statusCode >= 500) {
            return cachedData.data;
          }
          _throwHttpError(response.statusCode);
        }

        final parsed =
            HourlyForecastResponse.fromJson(json.decode(response.body));

        await _cacheManager.put<HourlyForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: cacheKey,
          data: parsed,
          toJson: (d) => parsed.toJson(),
          etag: response.headers['etag'],
        );

        return parsed;
      } catch (e) {
        loggy.error('Error fetching hourly forecast: $e');
        if (cachedData != null) return cachedData.data;
        if (e is ForecastException) rethrow;
        throw ForecastException('Failed to load hourly forecast: ${e.toString()}',
            isNetworkError: _isNetworkError(e));
      }
    } else {
      if (cachedData != null) return cachedData.data;
      throw ForecastException('No connection.', isNetworkError: true);
    }
  }

  Future<void> _refreshDailyInBackground(String siteId) async {
    try {
      final url = Uri.parse(
          '${ApiUtils.baseUrl}${ApiUtils.fetchDailyForecasts}').replace(
        queryParameters: _baseParams(siteId),
      );

      final response = await _httpClient.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final parsed =
            ForecastResponse.fromJson(json.decode(response.body));
        await _cacheManager.put<ForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: _getDailyCacheKey(siteId),
          data: parsed,
          toJson: (d) => parsed.toJson(),
          etag: response.headers['etag'],
        );
        _notifyListeners(siteId, parsed);
      }
    } catch (e) {
      loggy.warning('Background refresh failed: $e');
    }
  }

  void _throwHttpError(int statusCode) {
    if (statusCode == 404) {
      throw ForecastException('Forecast not found for this location.');
    } else if (statusCode == 401 || statusCode == 403) {
      throw ForecastException('Authentication error.');
    } else {
      throw ForecastException('Server error ($statusCode). Try again later.');
    }
  }

  bool _isNetworkError(Object e) {
    final msg = e.toString().toLowerCase();
    return msg.contains('socket') ||
        msg.contains('network') ||
        msg.contains('connection') ||
        msg.contains('handshake') ||
        msg.contains('dns') ||
        msg.contains('host') ||
        (e is ForecastException && e.isNetworkError);
  }

  void _notifyListeners(String siteId, ForecastResponse forecast) {
    final controller = _forecastControllers[siteId];
    if (controller != null && !controller.isClosed) {
      controller.add(forecast);
    }
  }

  @override
  Stream<ForecastResponse> getForecastStream(String siteId) {
    if (!_forecastControllers.containsKey(siteId) ||
        _forecastControllers[siteId]!.isClosed) {
      _forecastControllers[siteId] =
          StreamController<ForecastResponse>.broadcast();
    }
    return _forecastControllers[siteId]!.stream;
  }

  @override
  Future<void> clearCache(String siteId) async {
    try {
      await _cacheManager.delete(
          boxName: CacheBoxName.forecast, key: _getDailyCacheKey(siteId));
      await _cacheManager.delete(
          boxName: CacheBoxName.forecast, key: _getHourlyCacheKey(siteId));
    } catch (e) {
      loggy.warning('Failed to clear forecast cache: $e');
    }
  }

  @override
  Future<void> clearAllCaches() async {
    try {
      await _cacheManager.clearBox(CacheBoxName.forecast);
    } catch (e) {
      loggy.warning('Failed to clear all forecast caches: $e');
    }
  }

  void dispose() {
    for (final controller in _forecastControllers.values) {
      if (!controller.isClosed) controller.close();
    }
    _forecastControllers.clear();
    _httpClient.close();
  }
}
