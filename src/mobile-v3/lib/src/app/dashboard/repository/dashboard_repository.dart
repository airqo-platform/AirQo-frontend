import 'dart:async';
import 'dart:convert';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';


abstract class DashboardRepository extends BaseRepository {
  Future<AirQualityResponse> fetchAirQualityReadings({bool forceRefresh = false});
  
  Future<void> clearCache();
  
  Stream<AirQualityResponse> get airQualityStream;
}

class DashboardImpl extends DashboardRepository with UiLoggy {
  static final DashboardImpl _instance = DashboardImpl._internal();
  factory DashboardImpl() => _instance;
  DashboardImpl._internal();

  final CacheManager _cacheManager = CacheManager();

  final _airQualityController = StreamController<AirQualityResponse>.broadcast();
  
  static const String _airQualityCacheKey = 'air_quality_readings';
  
  @override
  Stream<AirQualityResponse> get airQualityStream => _airQualityController.stream;

  @override
  Future<AirQualityResponse> fetchAirQualityReadings({bool forceRefresh = false}) async {
    loggy.info('Fetching air quality readings (forceRefresh: $forceRefresh)');
    
    final cachedData = await _cacheManager.get<AirQualityResponse>(
      boxName: CacheBoxName.airQuality,
      key: _airQualityCacheKey,
      fromJson: (json) => AirQualityResponse.fromJson(json),
    );

    final shouldRefresh = _cacheManager.shouldRefresh(
      boxName: CacheBoxName.airQuality,
      key: _airQualityCacheKey,
      policy: RefreshPolicy.airQuality,
      cachedData: cachedData,
      forceRefresh: forceRefresh,
    );
    
    if (cachedData != null && !shouldRefresh) {
      loggy.info('Using cached air quality data (${cachedData.timestamp})');
      
      if (_cacheManager.isConnected) {
        _refreshInBackground();
      }
      
      return cachedData.data;
    }

    if (_cacheManager.isConnected) {
      try {
        loggy.info('Fetching fresh air quality data from network');
        
        Response response = await createGetRequest(
          ApiUtils.map, 
          {"token": dotenv.env['AIRQO_API_TOKEN']!}
        );
        
        if (response.statusCode == 200) {
          final responseBody = response.body;
          final AirQualityResponse dashboardResponse = 
              AirQualityResponse.fromJson(jsonDecode(responseBody));
          
          String? etag = response.headers['etag'];
          
          await _cacheManager.put<AirQualityResponse>(
            boxName: CacheBoxName.airQuality,
            key: _airQualityCacheKey,
            data: dashboardResponse,
            toJson: (data) => AirQualityResponse.fromJson(jsonDecode(responseBody)).toJson(),
            etag: etag,
          );
          
          _airQualityController.add(dashboardResponse);
          
          loggy.info('Successfully fetched and cached air quality data');
          return dashboardResponse;
        } else {
          loggy.warning('API error response: ${response.statusCode}');

          if (cachedData != null) {
            loggy.info('Using stale cached data due to API error');
            return cachedData.data;
          }
          
          throw Exception('Failed to fetch air quality data: ${response.statusCode}');
        }
      } catch (e) {
        loggy.error('Error fetching air quality data: $e');
        
        if (cachedData != null) {
          loggy.info('Using stale cached data due to error');
          return cachedData.data;
        }
        
        rethrow;
      }
    } else {
      if (cachedData != null) {
        loggy.info('Using cached data in offline mode');
        return cachedData.data;
      }

      throw Exception('No internet connection and no cached data available');
    }
  }
  
  Future<void> _refreshInBackground() async {
    try {
      loggy.info('Starting background refresh of air quality data');
      
      Response response = await createGetRequest(
        ApiUtils.map, 
        {"token": dotenv.env['AIRQO_API_TOKEN']!}
      );
      
      if (response.statusCode == 200) {
        final responseBody = response.body;
        final AirQualityResponse dashboardResponse = 
            AirQualityResponse.fromJson(jsonDecode(responseBody));
        
        String? etag = response.headers['etag'];
        
        await _cacheManager.put<AirQualityResponse>(
          boxName: CacheBoxName.airQuality,
          key: _airQualityCacheKey,
          data: dashboardResponse,
          toJson: (data) => AirQualityResponse.fromJson(jsonDecode(responseBody)).toJson(),
          etag: etag,
        );
        
        _airQualityController.add(dashboardResponse);
        
        loggy.info('Background refresh completed successfully');
      } else {
        loggy.warning('Background refresh API error: ${response.statusCode}');
      }
    } catch (e) {
      loggy.error('Error in background refresh: $e');
    }
  }

  @override
  Future<void> clearCache() async {
    try {
      await _cacheManager.delete(
        boxName: CacheBoxName.airQuality,
        key: _airQualityCacheKey,
      );
      loggy.info('Air quality cache cleared');
    } catch (e) {
      loggy.error('Error clearing air quality cache: $e');
      rethrow;
    }
  }
  
  void dispose() {
    _airQualityController.close();
  }
}