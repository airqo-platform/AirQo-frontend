import 'package:hive/hive.dart';
import 'package:loggy/loggy.dart';

class HiveBoxNames {
  const HiveBoxNames._();
  static String authBox = "auth";
  static String cacheBox = "cache";
}

class HiveRepository {
  static final _logger = Loggy('HiveRepository');
  static final Map<String, Box> _boxes = {};

  HiveRepository._();

  static Future<Box> _openBox(String boxName) async {
    if (!_boxes.containsKey(boxName)) {
      _boxes[boxName] = await Hive.openBox(boxName);
    }
    return _boxes[boxName]!;
  }

  static Future<dynamic> saveData(String boxName, String key, dynamic value) async {
    try {
      var box = await _openBox(boxName);
      await box.put(key, value);
      _logger.info('Saved data to $boxName with key: $key');
      return value;
    } catch (e) {
      _logger.error('Error saving data to $boxName: $e');
      rethrow;
    }
  }

  static Future<T?> getData<T>(String key, String boxName) async {
    try {
      var box = await _openBox(boxName);
      var value = box.get(key);
      _logger.info('Retrieved data from $boxName with key: $key');
      return value as T?;
    } catch (e) {
      _logger.error('Error retrieving data from $boxName: $e');
      return null;
    }
  }

  static Future<void> deleteData(String boxName, String key) async {
    try {
      var box = await _openBox(boxName);
      await box.delete(key);
      _logger.info('Deleted data from $boxName with key: $key');
    } catch (e) {
      _logger.error('Error deleting data from $boxName: $e');
      rethrow;
    }
  }

  // Cache operations
  static Future<void> saveCache(String key, dynamic data, {Duration? expiry}) async {
    final cacheData = {
      'data': data,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'expiry': expiry?.inMilliseconds,
    };

    try {
      await saveData(HiveBoxNames.cacheBox, key, cacheData);
      _logger.info('Saved cache with key: $key' +
          (expiry != null ? ' (expires in ${expiry.inMinutes} minutes)' : ''));
    } catch (e) {
      _logger.error('Failed to save cache: $e');
    }
  }

  static Future<dynamic> getCache(String key) async {
    final cacheData = await getData<Map<String, dynamic>>(key, HiveBoxNames.cacheBox);
    if (cacheData == null) {
      _logger.info('Cache miss for key: $key');
      return null;
    }

    try {
      final timestamp = cacheData['timestamp'] as int;
      final expiry = cacheData['expiry'] as int?;

      final cachedTime = DateTime.fromMillisecondsSinceEpoch(timestamp);
      final now = DateTime.now();

      if (expiry != null) {
        final expiryDuration = Duration(milliseconds: expiry);
        if (now.difference(cachedTime) > expiryDuration) {
          _logger.info('Cache expired for key: $key');
          await deleteData(HiveBoxNames.cacheBox, key);
          return null;
        }
      }

      _logger.info('Cache hit for key: $key (age: ${now.difference(cachedTime).inMinutes} minutes)');
      return cacheData['data'];
    } catch (e) {
      _logger.warning('Error reading cache: $e');
      return null;
    }
  }

  static Future<void> clearCache(String key) async {
    try {
      await deleteData(HiveBoxNames.cacheBox, key);
      _logger.info('Cleared cache for key: $key');
    } catch (e) {
      _logger.error('Error clearing cache for key $key: $e');
    }
  }

  static Future<void> clearAllCache() async {
    try {
      final box = await _openBox(HiveBoxNames.cacheBox);
      await box.clear();
      _logger.info('Cleared all cached data');
    } catch (e) {
      _logger.error('Error clearing all cache: $e');
    }
  }
}