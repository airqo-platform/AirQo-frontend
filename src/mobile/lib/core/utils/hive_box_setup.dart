import 'package:hive_flutter/hive_flutter.dart';
import 'package:loggy/loggy.dart';

enum HiveBoxNames { authBox, cacheBox, preferencesBox }

class HiveBoxSetup {
  static final _logger = Loggy('HiveBoxSetup');

  static Future<void> initializeBoxes() async {
    _logger.info('Initializing Hive boxes');

    try {
      await Hive.initFlutter();

      await Hive.openBox('authBox');
      await Hive.openBox('preferencesBox');
      await Hive.openBox('cacheBox');

      _logger.info('All Hive boxes initialized successfully');
    } catch (e) {
      _logger.error('Error initializing Hive boxes: $e');
      rethrow;
    }
  }

  // Helper method to clean expired cache
  static Future<void> cleanExpiredCache({Duration? olderThan}) async {
    try {
      final cacheBox = await Hive.openBox('cacheBox');
      final now = DateTime.now();
      final cutoffDuration = olderThan ?? const Duration(days: 7);

      _logger.info(
          'Cleaning cache items older than ${cutoffDuration.inHours} hours');

      int cleanedCount = 0;
      for (var key in cacheBox.keys) {
        final cachedData = cacheBox.get(key);
        if (cachedData != null) {
          try {
            final data = Map<String, dynamic>.from(cachedData);
            if (data.containsKey('timestamp')) {
              final timestamp = data['timestamp'] as int;
              final cachedTime = DateTime.fromMillisecondsSinceEpoch(timestamp);

              if (now.difference(cachedTime) > cutoffDuration) {
                await cacheBox.delete(key);
                cleanedCount++;
              }
            }
          } catch (e) {
            _logger.warning('Error processing cache item $key: $e');
          }
        }
      }

      _logger.info('Cache cleanup completed: removed $cleanedCount items');
    } catch (e) {
      _logger.error('Error cleaning cache: $e');
    }
  }
}
