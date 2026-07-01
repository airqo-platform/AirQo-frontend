import 'dart:convert';
import 'package:airqo/src/app/learn/models/learn_v2_catalog.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:loggy/loggy.dart';

abstract class LearnRepository extends BaseRepository {
  Future<LearnV2CatalogResponse> fetchCatalog({bool forceRefresh = false});
  Future<LearnV2CatalogResponse?> getCachedCatalog();
  Future<void> clearCache();
}

class LearnRepositoryImpl extends LearnRepository with UiLoggy {
  static final LearnRepositoryImpl _instance = LearnRepositoryImpl._internal();
  factory LearnRepositoryImpl() => _instance;
  LearnRepositoryImpl._internal();

  final CacheManager _cacheManager = CacheManager();
  static const String _catalogCacheKey = 'learn_v2_catalog';

  @override
  Future<LearnV2CatalogResponse> fetchCatalog(
      {bool forceRefresh = false}) async {
    loggy.info('Fetching Learn v2 catalog (forceRefresh: $forceRefresh)');

    final cachedData = await _cacheManager.get<LearnV2CatalogResponse>(
      boxName: CacheBoxName.location,
      key: _catalogCacheKey,
      fromJson: (json) => learnV2CatalogResponseFromJson(jsonEncode(json)),
    );

    final refreshPolicy = RefreshPolicy(
      wifiInterval: const Duration(days: 1),
      mobileInterval: const Duration(days: 3),
    );

    final shouldRefresh = _cacheManager.shouldRefresh(
      boxName: CacheBoxName.location,
      key: _catalogCacheKey,
      policy: refreshPolicy,
      cachedData: cachedData,
      forceRefresh: forceRefresh,
    );

    if (cachedData != null && !shouldRefresh) {
      loggy.info('Using cached Learn v2 catalog');
      if (_cacheManager.isConnected && !forceRefresh) {
        _refreshInBackground();
      }
      return cachedData.data;
    }

    if (_cacheManager.isConnected) {
      try {
        loggy.info('Fetching fresh Learn v2 catalog from API');

        final token = dotenv.env['AIRQO_API_TOKEN'];
        if (token == null) {
          loggy.error('AIRQO_API_TOKEN is not configured');
          if (cachedData != null) return cachedData.data;
          throw StateError('AIRQO_API_TOKEN is not configured');
        }
        final queryParams = {'token': token};

        final response =
            await createGetRequest(ApiUtils.learnCatalog, queryParams)
                .timeout(const Duration(seconds: 20));

        if (response.statusCode == 200) {
          final catalog = learnV2CatalogResponseFromJson(response.body);
          await _cacheManager.put<LearnV2CatalogResponse>(
            boxName: CacheBoxName.location,
            key: _catalogCacheKey,
            data: catalog,
            toJson: (data) => jsonDecode(learnV2CatalogResponseToJson(data)),
            etag: response.headers['etag'],
          );
          loggy.info(
              'Learn v2 catalog cached (${catalog.courses.length} courses)');
          return catalog;
        } else {
          loggy.warning(
              'Learn catalog API returned ${response.statusCode}');
          if (cachedData != null) return cachedData.data;
          throw Exception(
              'Failed to fetch Learn catalog: ${response.statusCode}');
        }
      } catch (e) {
        loggy.error('Error fetching Learn catalog: $e');
        if (cachedData != null) {
          loggy.info('Using stale cached Learn catalog due to error');
          return cachedData.data;
        }
        rethrow;
      }
    } else {
      if (cachedData != null) {
        loggy.info('Using cached Learn catalog in offline mode');
        return cachedData.data;
      }
      throw Exception(
          'Unable to load Learn catalog. Please check your connection.');
    }
  }

  @override
  Future<LearnV2CatalogResponse?> getCachedCatalog() async {
    try {
      final cached = await _cacheManager.get<LearnV2CatalogResponse>(
        boxName: CacheBoxName.location,
        key: _catalogCacheKey,
        fromJson: (json) => learnV2CatalogResponseFromJson(jsonEncode(json)),
      );
      return cached?.data;
    } catch (e) {
      loggy.error('Error retrieving cached Learn catalog: $e');
      return null;
    }
  }

  Future<void> _refreshInBackground() async {
    try {
      loggy.info('Background refresh of Learn v2 catalog');
      final token = dotenv.env['AIRQO_API_TOKEN'];
      if (token == null) {
        loggy.error('AIRQO_API_TOKEN is not configured for background refresh');
        return;
      }
      final queryParams = {'token': token};
      final response =
          await createGetRequest(ApiUtils.learnCatalog, queryParams)
              .timeout(const Duration(seconds: 30));
      if (response.statusCode == 200) {
        final catalog = learnV2CatalogResponseFromJson(response.body);
        await _cacheManager.put<LearnV2CatalogResponse>(
          boxName: CacheBoxName.location,
          key: _catalogCacheKey,
          data: catalog,
          toJson: (data) => jsonDecode(learnV2CatalogResponseToJson(data)),
          etag: response.headers['etag'],
        );
        loggy.info('Background Learn catalog refresh done');
      }
    } catch (e) {
      loggy.error('Background Learn catalog refresh failed: $e');
    }
  }

  @override
  Future<void> clearCache() async {
    await _cacheManager.delete(
      boxName: CacheBoxName.location,
      key: _catalogCacheKey,
    );
  }
}
