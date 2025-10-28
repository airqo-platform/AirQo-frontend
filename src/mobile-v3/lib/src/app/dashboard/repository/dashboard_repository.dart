import 'dart:async';
import 'dart:convert';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:airqo/src/app/surveys/services/survey_trigger_service.dart';
import 'package:http/http.dart' as http;

abstract class DashboardRepository extends BaseRepository {
  Future<AirQualityResponse> fetchAirQualityReadings({bool forceRefresh = false});
  
  Future<HistoricalAirQualityResponse> fetchHistoricalReadings({
    required String siteId,
    required DateTime startTime,
    required DateTime endTime,
  });
  
  Future<void> clearCache();
  
  Stream<AirQualityResponse> get airQualityStream;
}

class DashboardImpl extends DashboardRepository with UiLoggy {
  static DashboardImpl? _instance;
  
  final CacheManager _cacheManager;
  final http.Client _httpClient;
  
  // Cache for historical data to avoid repeated API calls
  static final Map<String, Map<String, dynamic>> _historicalCache = {};

  DashboardImpl._internal({
    CacheManager? cacheManager,
    http.Client? httpClient,
  }) : _cacheManager = cacheManager ?? CacheManager(),
       _httpClient = httpClient ?? http.Client();

  factory DashboardImpl({
    CacheManager? cacheManager,
    http.Client? httpClient,
  }) {

    if (cacheManager != null || httpClient != null) {
      return DashboardImpl._internal(
        cacheManager: cacheManager,
        httpClient: httpClient,
      );
    }
    
    return _instance ??= DashboardImpl._internal();
  }

  static void resetInstance() {
    _instance = null;
  }

  final _airQualityController = StreamController<AirQualityResponse>.broadcast();
  
  // Survey trigger service for air quality-based surveys  
  final SurveyTriggerService _surveyTriggerService = SurveyTriggerService();
  
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
        
        Response response = await _httpClient.get(
          Uri.parse('${ApiUtils.baseUrl}${ApiUtils.map}').replace(
            queryParameters: {
              "token": dotenv.env['AIRQO_API_TOKEN']!
            }
          ),
          headers: {
            'Content-Type': 'application/json',
          },
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
          
          // Notify survey trigger service about air quality update
          _notifySurveyTriggerService(dashboardResponse);
          
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
      
      Response response = await _httpClient.get(
        Uri.parse('${ApiUtils.baseUrl}${ApiUtils.map}').replace(
          queryParameters: {"token": dotenv.env['AIRQO_API_TOKEN']!}
        ),
        headers: {
          'Content-Type': 'application/json',
        },
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
  Future<HistoricalAirQualityResponse> fetchHistoricalReadings({
    required String siteId,
    required DateTime startTime,
    required DateTime endTime,
  }) async {
    try {
      // Create cache key for this request
      final cacheKey = '${siteId}_${startTime.toIso8601String()}_${endTime.toIso8601String()}';
      
      // Check cache first (valid for 10 minutes)
      final cachedData = _historicalCache[cacheKey];
      if (cachedData != null) {
        final cacheTime = cachedData['timestamp'] as DateTime;
        if (DateTime.now().difference(cacheTime).inMinutes < 10) {
          loggy.info('Using cached historical data for site $siteId');
          return cachedData['response'] as HistoricalAirQualityResponse;
        } else {
          // Remove expired cache
          _historicalCache.remove(cacheKey);
        }
      }
      
      // Validate date range following best practices (limit to 7-30 days)
      final daysDifference = endTime.difference(startTime).inDays;
      if (daysDifference > 7) {
        loggy.warning('Date range too large ($daysDifference days), limiting to today only');
        final today = DateTime.now();
        final todayStart = DateTime(today.year, today.month, today.day);
        final todayEnd = today;
        
        // Update the date range to today only to avoid timeouts
        startTime = todayStart;
        endTime = todayEnd;
      }
      
      loggy.info('Fetching historical readings for site $siteId from ${startTime.toIso8601String()} to ${endTime.toIso8601String()}');
      
      // Optimize query parameters following best practices
      final queryParams = {
        'token': dotenv.env['AIRQO_API_TOKEN']!,
        'startTime': startTime.toIso8601String(),
        'endTime': endTime.toIso8601String(),
        'pollutant': 'pm2_5', // Only request PM2.5 to reduce response size
        'frequency': 'hourly', // Explicitly specify hourly data
      };
      
      final uri = Uri.parse('${ApiUtils.baseUrl}/api/v2/devices/measurements/sites/$siteId/historical')
          .replace(queryParameters: queryParams);
      
      Response response = await _httpClient.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
        },
      );
      
      if (response.statusCode == 200) {
        final responseBody = response.body;
        final historicalResponse = HistoricalAirQualityResponse.fromJson(jsonDecode(responseBody));
        
        // Cache the successful response
        _historicalCache[cacheKey] = {
          'response': historicalResponse,
          'timestamp': DateTime.now(),
        };
        
        loggy.info('Successfully fetched ${historicalResponse.measurements?.length ?? 0} historical measurements');
        return historicalResponse;
      } else {
        loggy.warning('Historical API error response: ${response.statusCode}');
        
        // For rate limiting (429), throw a specific exception to trigger fallback
        if (response.statusCode == 429) {
          throw Exception('Rate limited: ${response.statusCode}');
        }
        
        throw Exception('Failed to fetch historical data: ${response.statusCode}');
      }
    } catch (e) {
      loggy.error('Error fetching historical readings: $e');
      // Return empty response so exposure calculation can gracefully handle the error
      return HistoricalAirQualityResponse(
        success: false,
        message: 'Error fetching historical data: $e',
        measurements: [],
      );
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
  
  /// Helper method to notify survey trigger service about air quality updates
  void _notifySurveyTriggerService(AirQualityResponse response) {
    try {
      // Extract relevant air quality data for survey triggers
      if (response.measurements != null && response.measurements!.isNotEmpty) {
        final measurement = response.measurements!.first; // Use first available measurement
        
        final airQualityData = {
          'pm2_5': measurement.pm25?.value,
          'category': measurement.aqiCategory,
          'timestamp': measurement.time,
          'site_name': measurement.siteDetails?.name ?? measurement.siteDetails?.formattedName,
          'location': {
            'latitude': measurement.siteDetails?.approximateLatitude,
            'longitude': measurement.siteDetails?.approximateLongitude,
          }
        };
        
        _surveyTriggerService.updateAirQuality(airQualityData);
        loggy.debug('Notified survey trigger service with air quality data: PM2.5=${measurement.pm25?.value}');
      }
    } catch (e) {
      loggy.error('Error notifying survey trigger service: $e');
    }
  }

  void dispose() {
    _airQualityController.close();
    _httpClient.close();
  }
}