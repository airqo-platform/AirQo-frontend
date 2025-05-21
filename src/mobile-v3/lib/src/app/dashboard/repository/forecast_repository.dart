import 'dart:async';
import 'dart:convert';
import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';


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

  /// Clears the forecast cache for a specific site
  Future<void> clearCache(String siteId);

  /// Clears all forecast caches
  Future<void> clearAllCaches();

  /// Gets a stream of forecast updates for a site
  Stream<ForecastResponse> getForecastStream(String siteId);
}

/// Implementation of the forecast repository with caching
class ForecastImpl extends ForecastRepository with UiLoggy {
  // Cache manager instance
  final CacheManager _cacheManager = CacheManager();

  // Stream controllers for forecast updates, keyed by site ID
  final Map<String, StreamController<ForecastResponse>> _forecastControllers =
      {};

  // Get the cache key for a site's forecast
  String _getForecastCacheKey(String siteId) => 'forecast_$siteId';

  @override
  Future<ForecastResponse> loadForecasts(String siteId,
      {bool forceRefresh = false}) async {
    loggy.info(
        'Loading forecasts for site $siteId (forceRefresh: $forceRefresh)');

    final cacheKey = _getForecastCacheKey(siteId);

    // First, try to get data from cache
    final cachedData = await _cacheManager.get<ForecastResponse>(
      boxName: CacheBoxName.forecast,
      key: cacheKey,
      fromJson: (json) => ForecastResponse.fromJson(json),
    );

    // Check if we should use the cached data or refresh from network
    final shouldRefresh = _cacheManager.shouldRefresh(
      boxName: CacheBoxName.forecast,
      key: cacheKey,
      policy: RefreshPolicy.forecast,
      cachedData: cachedData,
      forceRefresh: forceRefresh,
    );

    // If we have cached data and don't need to refresh, use the cache
    if (cachedData != null && !shouldRefresh) {
      loggy.info(
          'Using cached forecast data for site $siteId (${cachedData.timestamp})');

      // Start a background refresh if we're connected but using cached data
      if (_cacheManager.isConnected) {
        _refreshInBackground(siteId);
      }

      return cachedData.data;
    }

    // If we need fresh data and we're online, fetch from network
    if (_cacheManager.isConnected) {
      try {
        loggy
            .info('Fetching fresh forecast data for site $siteId from network');

        // Get the data from the API
        Response forecastResponse = await createGetRequest(
                ApiUtils.fetchForecasts,
                {"token": dotenv.env['AIRQO_API_TOKEN']!, "site_id": siteId})
            .timeout(const Duration(seconds: 15), onTimeout: () {
          throw ForecastException(
              'Request timed out. Server might be slow or unreachable.',
              isNetworkError: true);
        });

        // Handle HTTP error responses
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

        // Get the ETag if available for future conditional requests
        String? etag = forecastResponse.headers['etag'];

        // Cache the response
        await _cacheManager.put<ForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: cacheKey,
          data: response,
          toJson: (data) => response.toJson(),
          etag: etag,
        );

        // Notify any listeners about the new data
        _notifyListeners(siteId, response);

        loggy.info(
            'Successfully fetched and cached forecast data for site $siteId');
        return response;
      } catch (e) {
        loggy.error('Error fetching forecast data: $e');

        // Determine if it's a network error
        bool isNetworkError = e.toString().toLowerCase().contains('socket') ||
            e.toString().toLowerCase().contains('network') ||
            e.toString().toLowerCase().contains('connection') ||
            (e is ForecastException && e.isNetworkError);

        // If we have cached data, use it even if it's stale
        if (cachedData != null) {
          loggy.info('Using stale cached data due to error');
          return cachedData.data;
        }

        // No cached data available, rethrow the error
        if (e is ForecastException) {
          rethrow;
        }
        throw ForecastException('Failed to load forecast data: ${e.toString()}',
            isNetworkError: isNetworkError);
      }
    } else {
      // Offline mode - use cached data if available
      if (cachedData != null) {
        loggy.info('Using cached forecast data in offline mode');
        return cachedData.data;
      }

      // No cached data and offline
      throw ForecastException(
          'No internet connection and no cached forecast data available',
          isNetworkError: true);
    }
  }

  /// Refresh the forecast data in the background without blocking the UI
  Future<void> _refreshInBackground(String siteId) async {
    try {
      loggy.info(
          'Starting background refresh of forecast data for site $siteId');

      // Get the data from the API
      Response forecastResponse = await createGetRequest(
          ApiUtils.fetchForecasts,
          {"token": dotenv.env['AIRQO_API_TOKEN']!, "site_id": siteId});

      // Check if the request was successful
      if (forecastResponse.statusCode == 200) {
        final responseBody = forecastResponse.body;
        final ForecastResponse response =
            ForecastResponse.fromJson(json.decode(responseBody));

        // Get the ETag if available for future conditional requests
        String? etag = forecastResponse.headers['etag'];

        final cacheKey = _getForecastCacheKey(siteId);

        // Cache the response
        await _cacheManager.put<ForecastResponse>(
          boxName: CacheBoxName.forecast,
          key: cacheKey,
          data: response,
          toJson: (data) => response.toJson(),
          etag: etag,
        );

        // Notify any listeners about the new data
        _notifyListeners(siteId, response);

        loggy
            .info('Background refresh of forecast data completed successfully');
      } else {
        loggy.warning(
            'Background refresh API error: ${forecastResponse.statusCode}');
      }
    } catch (e) {
      loggy.error('Error in background refresh: $e');
      // Don't rethrow - background refreshes should fail silently
    }
  }

  /// Notify listeners about forecast updates for a site
  void _notifyListeners(String siteId, ForecastResponse forecast) {
    final controller = _forecastControllers[siteId];
    if (controller != null && !controller.isClosed) {
      controller.add(forecast);
    }
  }

  @override
  Stream<ForecastResponse> getForecastStream(String siteId) {
    // Create a controller if it doesn't exist for this site
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
  }
}
