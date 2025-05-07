import 'dart:convert';
import 'package:airqo/src/app/dashboard/models/health_tips_model.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:loggy/loggy.dart';

abstract class HealthTipsRepository extends BaseRepository {
  Future<HealthTipsResponse> fetchHealthTips();
  Future<HealthTipModel?> getHealthTipForAqi(double aqiValue);
  Future<void> clearCache();
}

class HealthTipsImpl extends HealthTipsRepository with UiLoggy {
  static const String _cacheKey = 'health_tips_cache';
  static const Duration _cacheDuration = Duration(days: 7);

  @override
  Future<HealthTipsResponse> fetchHealthTips() async {
    try {
      final cachedData = await _getCachedHealthTips();
      if (cachedData != null) {
        loggy.info('Using cached health tips data');
        return cachedData;
      }

      loggy.info('Fetching health tips from API');
      
      Response response = await createGetRequest(
        ApiUtils.fetchHealthTips,
        {"token": dotenv.env['AIRQO_API_TOKEN']!}
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to load health tips: ${response.statusCode}');
      }

      HealthTipsResponse healthTipsResponse = HealthTipsResponse.fromJson(jsonDecode(response.body));
      
      // Cache the result
      _cacheHealthTips(jsonDecode(response.body));
      
      return healthTipsResponse;
    } catch (e) {
      loggy.error('Error fetching health tips: $e');
      
      // Try to return cached data even if it's expired
      final cachedData = await _getCachedHealthTips(ignoreExpiry: true);
      if (cachedData != null) {
        loggy.info('Using expired cached health tips data due to fetch error');
        return cachedData;
      }
      
      // If all else fails, return an empty response
      throw Exception('Failed to fetch health tips: $e');
    }
  }

  @override
  Future<HealthTipModel?> getHealthTipForAqi(double aqiValue) async {
    try {
      final response = await fetchHealthTips();
      
      if (!response.success || response.data.healthTips.isEmpty) {
        return null;
      }
      
      // Find matching health tip based on AQI value
      for (final tip in response.data.healthTips) {
        if (tip.aqiCategory.isInRange(aqiValue)) {
          return tip;
        }
      }
      
      // If no exact match, return the first one (or null if list is empty)
      return response.data.healthTips.isNotEmpty ? response.data.healthTips.first : null;
    } catch (e) {
      loggy.error('Error getting health tip for AQI $aqiValue: $e');
      return null;
    }
  }

  @override
  Future<void> clearCache() async {
    try {
      await HiveRepository.deleteData(_cacheKey, HiveBoxNames.cacheBox);
      loggy.info('Health tips cache cleared');
    } catch (e) {
      loggy.error('Error clearing health tips cache: $e');
    }
  }

  // Private helper to cache health tips
  Future<void> _cacheHealthTips(Map<String, dynamic> data) async {
    try {
      final cacheData = {
        'data': data,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      };
      
      await HiveRepository.saveData(
        HiveBoxNames.cacheBox,
        _cacheKey,
        json.encode(cacheData),
      );
      
      loggy.info('Health tips data cached successfully');
    } catch (e) {
      loggy.warning('Failed to cache health tips data: $e');
    }
  }

  // Private helper to get cached health tips
  Future<HealthTipsResponse?> _getCachedHealthTips({bool ignoreExpiry = false}) async {
    try {
      final cachedJson = await HiveRepository.getData(
        HiveBoxNames.cacheBox,
        _cacheKey,
      );

      if (cachedJson == null) {
        return null;
      }

      final cacheData = json.decode(cachedJson);
      final timestamp = cacheData['timestamp'] as int;
      final cachedTime = DateTime.fromMillisecondsSinceEpoch(timestamp);
      final now = DateTime.now();

      if (!ignoreExpiry && now.difference(cachedTime) > _cacheDuration) {
        loggy.info('Cached health tips data has expired');
        return null;
      }

      final healthTipsJson = cacheData['data'];
      return HealthTipsResponse.fromJson(healthTipsJson);
    } catch (e) {
      loggy.warning('Error reading health tips cache: $e');
      return null;
    }
  }
}