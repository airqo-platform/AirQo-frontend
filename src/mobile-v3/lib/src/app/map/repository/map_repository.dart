import 'dart:async';
import 'dart:convert';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';

abstract class MapRepository extends BaseRepository {
  Future<AirQualityResponse> fetchAirQualityReadings({bool forceRefresh = false});
}

class MapImpl extends MapRepository with UiLoggy {
  static final MapImpl _instance = MapImpl._internal();
  factory MapImpl() => _instance;
  MapImpl._internal();

  final CacheManager _cacheManager = CacheManager();
  static const String _mapCacheKey = 'map_air_quality_readings';

  @override
  Future<AirQualityResponse> fetchAirQualityReadings({bool forceRefresh = false}) async {
    loggy.info('Fetching map air quality readings (forceRefresh: $forceRefresh)');
    
    // First try to get cached data
    final cachedData = await _cacheManager.get<AirQualityResponse>(
      boxName: CacheBoxName.airQuality,
      key: _mapCacheKey,
      fromJson: (json) => AirQualityResponse.fromJson(json),
    );

    // Check if we should refresh based on policy
    final shouldRefresh = _cacheManager.shouldRefresh(
      boxName: CacheBoxName.airQuality,
      key: _mapCacheKey,
      policy: RefreshPolicy.airQuality,
      cachedData: cachedData,
      forceRefresh: forceRefresh,
    );
    
    // If cached data is available and valid, return it immediately
    if (cachedData != null && !shouldRefresh) {
      loggy.info('Using cached map data (${cachedData.timestamp})');
      
      // If connected, trigger background refresh
      if (_cacheManager.isConnected && !forceRefresh) {
        _refreshInBackground();
      }
      
      return cachedData.data;
    }

    // If we're online, try to fetch fresh data
    if (_cacheManager.isConnected) {
      try {
        loggy.info('Fetching fresh map data from API');
        
        Response response = await createGetRequest(
          ApiUtils.map, 
          {"token": dotenv.env['AIRQO_API_TOKEN']!}
        ).timeout(
          const Duration(seconds: 15),
          onTimeout: () {
            loggy.warning('API request timed out after 15 seconds');
            throw TimeoutException('Request timed out');
          },
        );
        
        if (response.statusCode == 200) {
          try {
            final jsonData = jsonDecode(response.body);
            final airQualityResponse = AirQualityResponse.fromJson(jsonData);
            
            // If successful, cache the result
            String? etag = response.headers['etag'];
            await _cacheManager.put<AirQualityResponse>(
              boxName: CacheBoxName.airQuality,
              key: _mapCacheKey,
              data: airQualityResponse,
              toJson: (data) => data.toJson(),
              etag: etag,
            );
            
            loggy.info('Successfully fetched and cached map data');
            return airQualityResponse;
          } catch (parseError) {
            loggy.error('Error parsing API response: $parseError');
            throw Exception('Failed to parse API response: $parseError');
          }
        } else {
          loggy.warning('API returned error status code: ${response.statusCode}');
          
          // If API returns error status but we have cache, use it
          if (cachedData != null) {
            loggy.info('Using cached data due to API error (status: ${response.statusCode})');
            return cachedData.data;
          }
          
          throw Exception('Failed to fetch map data: ${response.statusCode}');
        }
      } catch (e) {
        loggy.error('Error fetching map data: $e');
        
        // For any error, try to use cache before giving up
        if (cachedData != null) {
          loggy.info('Using stale cached data due to error: $e');
          return cachedData.data;
        }
        
        // If no cache is available, rethrow the exception
        rethrow;
      }
    } else {
      // We're offline - use cache if available
      if (cachedData != null) {
        loggy.info('Using cached map data in offline mode');
        return cachedData.data;
      }
      
      // No cache and offline
      throw Exception('No internet connection and no cached map data available');
    }
  }
  
  Future<void> _refreshInBackground() async {
    try {
      loggy.info('Starting background refresh of map data');
      
      Response response = await createGetRequest(
        ApiUtils.map, 
        {"token": dotenv.env['AIRQO_API_TOKEN']!}
      ).timeout(const Duration(seconds: 30));
      
      if (response.statusCode == 200) {
        final airQualityResponse = AirQualityResponse.fromJson(jsonDecode(response.body));
        
        String? etag = response.headers['etag'];
        await _cacheManager.put<AirQualityResponse>(
          boxName: CacheBoxName.airQuality,
          key: _mapCacheKey,
          data: airQualityResponse,
          toJson: (data) => data.toJson(),
          etag: etag,
        );
        
        loggy.info('Background refresh of map data completed successfully');
      } else {
        loggy.warning('Background refresh failed: ${response.statusCode}');
      }
    } catch (e) {
      // Just log background refresh errors, don't propagate
      loggy.error('Error in background refresh: $e');
    }
  }
  
  Future<void> clearCache() async {
    try {
      await _cacheManager.delete(
        boxName: CacheBoxName.airQuality,
        key: _mapCacheKey,
      );
      loggy.info('Map cache cleared');
    } catch (e) {
      loggy.error('Error clearing map cache: $e');
    }
  }
}