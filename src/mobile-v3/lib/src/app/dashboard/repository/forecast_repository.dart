import 'dart:convert';
import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:loggy/loggy.dart';

class ForecastException implements Exception {
  final String message;
  final bool isNetworkError;
  
  ForecastException(this.message, {this.isNetworkError = false});
  
  @override
  String toString() => message;
}

abstract class ForecastRepository extends BaseRepository {
  Future<ForecastResponse> loadForecasts(String siteId);
  Future<void> clearCache(String siteId);
}

class ForecastImpl extends ForecastRepository with UiLoggy {
  static const cacheDuration = Duration(hours: 2);
  final Connectivity _connectivity = Connectivity();

  @override
  Future<ForecastResponse> loadForecasts(String siteId) async {
    try {

      var connectivityResult = await _connectivity.checkConnectivity();
      bool hasConnection = connectivityResult != ConnectivityResult.none;
      
      final cachedData = await _getCachedForecast(siteId);
      
      if (!hasConnection && cachedData != null) {
        loggy.info('Using cached forecast data for site: $siteId (offline mode)');
        return cachedData;
      }
      
      // If offline and no cache, throw a specific error
      if (!hasConnection) {
        throw ForecastException(
          'No internet connection. Please check your network settings.',
          isNetworkError: true
        );
      }
      
      // Online - try to fetch new data
      loggy.info('Fetching fresh forecast data for site: $siteId');
      try {
        Response forecastResponse = await createGetRequest(
          ApiUtils.fetchForecasts,
          {"token": dotenv.env['AIRQO_API_TOKEN']!, "site_id": siteId}
        ).timeout(
          const Duration(seconds: 15),
          onTimeout: () {
            throw ForecastException(
              'Request timed out. Server might be slow or unreachable.',
              isNetworkError: true
            );
          }
        );
        
        // Handle HTTP error responses
        if (forecastResponse.statusCode != 200) {
          if (cachedData != null && forecastResponse.statusCode >= 500) {
            loggy.warning('Server error ${forecastResponse.statusCode}, using cached data');
            return cachedData;
          }
          
          if (forecastResponse.statusCode == 404) {
            throw ForecastException('Forecast data not found for this location');
          } else if (forecastResponse.statusCode == 401 || forecastResponse.statusCode == 403) {
            throw ForecastException('Authentication error. Please try again later.');
          } else {
            throw ForecastException(
              'Server error (${forecastResponse.statusCode}). Please try again later.'
            );
          }
        }
        
        final responseBody = forecastResponse.body;
        final ForecastResponse response = ForecastResponse.fromJson(json.decode(responseBody));
        
        _cacheForecasts(siteId, responseBody);
        
        return response;
      } on ForecastException {
        rethrow; 
      } catch (e) {

        if (cachedData != null) {
          loggy.warning('Error fetching forecast: $e. Using cached data instead.');
          return cachedData;
        }
        
        // No cache, determine if it's a network error
        bool isNetworkError = e.toString().toLowerCase().contains('socket') || 
                              e.toString().toLowerCase().contains('network') ||
                              e.toString().toLowerCase().contains('connection');
        
        throw ForecastException(
          'Failed to load forecast data: ${e.toString()}',
          isNetworkError: isNetworkError
        );
      }
    } catch (e) {
      if (e is ForecastException) {
        rethrow;
      }
      throw ForecastException('Unexpected error: ${e.toString()}');
    }
  }
  
  // Cache the forecast data using Hive
  Future<void> _cacheForecasts(String siteId, String jsonData) async {
    try {
      final cacheKey = 'forecast_$siteId';
      final cacheData = {
        'data': jsonData,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      };
      await HiveRepository.saveData(
        HiveBoxNames.cacheBox, 
        cacheKey, 
        json.encode(cacheData)
      );
      loggy.info('Cached forecast data for site: $siteId');
    } catch (e) {
      loggy.warning('Failed to cache forecast data: $e');
    }
  }
  

  Future<ForecastResponse?> _getCachedForecast(String siteId) async {
    try {
      final cacheKey = 'forecast_$siteId';
      final cachedJson = await HiveRepository.getData(cacheKey, HiveBoxNames.cacheBox);
      
      if (cachedJson == null) {
        return null;
      }
      
      final cacheData = json.decode(cachedJson);
      final timestamp = cacheData['timestamp'] as int;
      final cachedTime = DateTime.fromMillisecondsSinceEpoch(timestamp);
      final now = DateTime.now();
      
      if (now.difference(cachedTime) > cacheDuration) {
        loggy.info('Cached forecast data has expired for site: $siteId');
        return null;
      }
      
      final forecastJson = cacheData['data'] as String;
      return ForecastResponse.fromJson(json.decode(forecastJson));
    } catch (e) {
      loggy.warning('Error reading forecast cache: $e');
      return null;
    }
  }

  @override
  Future<void> clearCache(String siteId) async {
    try {
      final cacheKey = 'forecast_$siteId';
      await HiveRepository.deleteData(cacheKey, HiveBoxNames.cacheBox);
      loggy.info('Cleared forecast cache for site: $siteId');
    } catch (e) {
      loggy.warning('Failed to clear forecast cache: $e');
    }
  }
}