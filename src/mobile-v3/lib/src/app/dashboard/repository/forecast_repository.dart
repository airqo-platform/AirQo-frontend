import 'dart:async';
import 'dart:convert';
import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
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
        _httpClient = httpClient ?? http.Client() {
    loggy.debug('Initialized ForecastImpl with httpClient: $_httpClient');
  }

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

  String _getForecastCacheKey(String siteId) => 'forecast_$siteId';

  @override
  Future<ForecastResponse> loadForecasts(String siteId,
      {bool forceRefresh = false}) async {
    loggy.info(
        'Loading forecasts for site $siteId (forceRefresh: $forceRefresh)');

    final cacheKey = _getForecastCacheKey(siteId);

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
      loggy.info(
          'Using cached forecast data for site $siteId (${cachedData.timestamp})');

      if (_cacheManager.isConnected) {
        _refreshInBackground(siteId);
      }

      return cachedData.data;
    }

    if (_cacheManager.isConnected) {
      try {
        loggy
            .info('Fetching fresh forecast data for site $siteId from network');

        Response forecastResponse = await _httpClient.get(
          Uri.parse('${ApiUtils.baseUrl}${ApiUtils.fetchForecasts}').replace(
              queryParameters: {
                "token": dotenv.env['AIRQO_API_TOKEN']!,
                "site_id": siteId
              }),
          headers: {
            'Content-Type': 'application/json',
          },
        ).timeout(const Duration(seconds: 15), onTimeout: () {
          throw ForecastException(
              'Request timed out. Server might be slow or unreachable.',
              isNetworkError: true);
        });

        if (forecastResponse.statusCode != 200) {
          if (cachedData != null && forecastResponse.statusCode >= 500) {
            loggy.warning(
                'Server error ${forecastResponse.statusCode}, using cached data');
            return cachedData.data;
          }

          if (forecastResponse.statusCode == 404) {
            throw ForecastException(
                'Forecast data not found for this location');
          } else if (forecastResponse.statusCode == 401 ||
              forecastResponse.statusCode == 403) {
            throw ForecastException(
                'Authentication error. Please try again later.');
          } else {
            throw ForecastException(
                'Server error (${forecastResponse.statusCode}). Please try again later.');
          }
        }

        final responseBody = forecastResponse.body;
        final ForecastResponse response =
            ForecastResponse.fromJson(json.decode(responseBody));

        String? etag = forecastResponse.headers['etag'];

        await _cacheManager.put<ForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: cacheKey,
          data: response,
          toJson: (data) => response.toJson(),
          etag: etag,
        );

        _notifyListeners(siteId, response);

        loggy.info(
            'Successfully fetched and cached forecast data for site $siteId');
        return response;
      } catch (e) {
        loggy.error('Error fetching forecast data: $e');

        bool isNetworkError = e.toString().toLowerCase().contains('socket') ||
            e.toString().toLowerCase().contains('network') ||
            e.toString().toLowerCase().contains('connection') ||
            (e is ForecastException && e.isNetworkError);

        if (cachedData != null) {
          loggy.info('Using stale cached data due to error');
          return cachedData.data;
        }

        if (e is ForecastException) {
          rethrow;
        }
        throw ForecastException('Failed to load forecast data: ${e.toString()}',
            isNetworkError: isNetworkError);
      }
    } else {
      if (cachedData != null) {
        loggy.info('Using cached forecast data in offline mode');
        return cachedData.data;
      }

      throw ForecastException(
          'No internet connection and no cached forecast data available',
          isNetworkError: true);
    }
  }

  Future<void> _refreshInBackground(String siteId) async {
    try {
      loggy.info(
          'Starting background refresh of forecast data for site $siteId');

      Response forecastResponse = await _httpClient.get(
        Uri.parse('${ApiUtils.baseUrl}${ApiUtils.fetchForecasts}').replace(
            queryParameters: {
              "token": dotenv.env['AIRQO_API_TOKEN']!,
              "site_id": siteId
            }),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (forecastResponse.statusCode == 200) {
        final responseBody = forecastResponse.body;
        final ForecastResponse response =
            ForecastResponse.fromJson(json.decode(responseBody));

        String? etag = forecastResponse.headers['etag'];

        final cacheKey = _getForecastCacheKey(siteId);

        await _cacheManager.put<ForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: cacheKey,
          data: response,
          toJson: (data) => response.toJson(),
          etag: etag,
        );

        _notifyListeners(siteId, response);

        loggy
            .info('Background refresh of forecast data completed successfully');
      } else {
        loggy.warning(
            'Background refresh API error: ${forecastResponse.statusCode}');
      }
    } catch (e) {
      loggy.error('Error in background refresh: $e');
    }
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
      final cacheKey = _getForecastCacheKey(siteId);
      await _cacheManager.delete(
        boxName: CacheBoxName.forecast,
        key: cacheKey,
      );
      loggy.info('Forecast cache cleared for site $siteId');
    } catch (e) {
      loggy.warning('Failed to clear forecast cache: $e');
    }
  }

  @override
  Future<void> clearAllCaches() async {
    try {
      await _cacheManager.clearBox(CacheBoxName.forecast);
      loggy.info('All forecast caches cleared');
    } catch (e) {
      loggy.warning('Failed to clear all forecast caches: $e');
    }
  }

  void dispose() {
    for (final controller in _forecastControllers.values) {
      if (!controller.isClosed) {
        controller.close();
      }
    }
    _forecastControllers.clear();
    _httpClient.close();
  }
}
