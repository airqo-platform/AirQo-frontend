import 'dart:async';
import 'dart:convert';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';

abstract class KyaRepository extends BaseRepository {
  Future<LessonResponseModel> fetchLessons({bool forceRefresh = false});
  Future<void> clearCache();
}

class KyaImpl extends KyaRepository with UiLoggy {
  static final KyaImpl _instance = KyaImpl._internal();
  factory KyaImpl() => _instance;
  KyaImpl._internal();

  final CacheManager _cacheManager = CacheManager();
  static const String _lessonsCacheKey = 'kya_lessons';

  @override
  Future<LessonResponseModel> fetchLessons({bool forceRefresh = false}) async {
    loggy.info('Fetching KYA lessons (forceRefresh: $forceRefresh)');

    final cachedData = await _cacheManager.get<LessonResponseModel>(
      boxName: CacheBoxName.location,
      key: _lessonsCacheKey,
      fromJson: (json) => lessonResponseModelFromJson(jsonEncode(json)),
    );

    final refreshPolicy = RefreshPolicy(
      wifiInterval: const Duration(days: 7),
      mobileInterval: const Duration(days: 14),
    );

    final shouldRefresh = _cacheManager.shouldRefresh(
      boxName: CacheBoxName.location,
      key: _lessonsCacheKey,
      policy: refreshPolicy,
      cachedData: cachedData,
      forceRefresh: forceRefresh,
    );

    if (cachedData != null && !shouldRefresh) {
      loggy.info('Using cached lessons data (${cachedData.timestamp})');

      if (_cacheManager.isConnected && !forceRefresh) {
        _refreshInBackground();
      }

      return cachedData.data;
    }

    if (_cacheManager.isConnected) {
      try {
        loggy.info('Fetching fresh lessons data from API');

        Response response = await createGetRequest(ApiUtils.fetchLessons,
            {"token": dotenv.env['AIRQO_API_TOKEN']!}).timeout(
          const Duration(seconds: 15),
          onTimeout: () {
            loggy.warning('API request timed out after 15 seconds');
            throw TimeoutException('Request timed out');
          },
        );

        if (response.statusCode == 200) {
          try {
            final lessonResponseModel =
                lessonResponseModelFromJson(response.body);

            String? etag = response.headers['etag'];
            await _cacheManager.put<LessonResponseModel>(
              boxName: CacheBoxName.location,
              key: _lessonsCacheKey,
              data: lessonResponseModel,
              toJson: (data) => jsonDecode(lessonResponseModelToJson(data)),
              etag: etag,
            );

            loggy.info('Successfully fetched and cached lessons data');
            return lessonResponseModel;
          } catch (parseError) {
            loggy.error('Error parsing API response: $parseError');

            if (cachedData != null) {
              loggy.info('Using cached data due to parsing error');
              return cachedData.data;
            }

            throw Exception('Failed to parse API response: $parseError');
          }
        } else {
          loggy.warning(
              'API returned error status code: ${response.statusCode}');

          if (cachedData != null) {
            loggy.info(
                'Using cached data due to API error (status: ${response.statusCode})');
            return cachedData.data;
          }

          throw Exception(
              'Failed to fetch lessons data: ${response.statusCode}');
        }
      } catch (e) {
        loggy.error('Error fetching lessons data: $e');

        if (cachedData != null) {
          loggy.info('Using stale cached data due to error: $e');
          return cachedData.data;
        }

        rethrow;
      }
    } else {
      if (cachedData != null) {
        loggy.info('Using cached lessons data in offline mode');
        return cachedData.data;
      }

      throw Exception(
          'No internet connection and no cached lessons data available');
    }
  }

  Future<LessonResponseModel?> getCachedLessonsData() async {
    try {
      final cachedData = await _cacheManager.get<LessonResponseModel>(
        boxName: CacheBoxName.location,
        key: _lessonsCacheKey,
        fromJson: (json) => lessonResponseModelFromJson(jsonEncode(json)),
      );

      if (cachedData != null) {
        return cachedData.data;
      }
      return null;
    } catch (e) {
      loggy.error('Error retrieving cached lessons data: $e');
      return null;
    }
  }

  Future<void> _refreshInBackground() async {
    try {
      loggy.info('Starting background refresh of lessons data');

      Response response = await createGetRequest(
              ApiUtils.fetchLessons, {"token": dotenv.env['AIRQO_API_TOKEN']!})
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final lessonResponseModel = lessonResponseModelFromJson(response.body);

        String? etag = response.headers['etag'];
        await _cacheManager.put<LessonResponseModel>(
          boxName: CacheBoxName.location,
          key: _lessonsCacheKey,
          data: lessonResponseModel,
          toJson: (data) => jsonDecode(lessonResponseModelToJson(data)),
          etag: etag,
        );

        loggy.info('Background refresh of lessons data completed successfully');
      } else {
        loggy.warning('Background refresh failed: ${response.statusCode}');
      }
    } catch (e) {
      loggy.error('Error in background refresh: $e');
    }
  }

  @override
  Future<void> clearCache() async {
    try {
      await _cacheManager.delete(
        boxName: CacheBoxName.location,
        key: _lessonsCacheKey,
      );
      loggy.info('Lessons cache cleared');
    } catch (e) {
      loggy.error('Error clearing lessons cache: $e');
    }
  }
}
