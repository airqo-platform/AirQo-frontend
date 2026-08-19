import 'package:airqo/core/utils/hive_box_setup.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:airqo/src/app/shared/services/notification_helper.dart';
import 'package:airqo/src/app/shared/services/push_notification_service.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:loggy/loggy.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:workmanager/workmanager.dart';

/// Periodic on-device AQ checks when the app is not in the foreground.
///
/// Timing is platform-dependent:
/// - **Android:** WorkManager generally runs near the requested [checkInterval]
///   when network and battery constraints are met.
/// - **iOS:** [checkInterval] and [initialCheckDelay] are best-effort hints to
///   BGTaskScheduler. The system may defer or skip runs — do not treat these
///   as guaranteed delivery times in acceptance tests.
class AirQualityBackgroundTask with UiLoggy {
  AirQualityBackgroundTask._();

  static const uniqueName = 'airqo-aq-background-check';
  static const initialCheckUniqueName = 'airqo-aq-initial-check';
  static const taskName = 'com.airqo.net.aqBackgroundCheck';
  static const initialCheckScheduledKey = 'aq_background_initial_check_scheduled';
  static const checkInterval = Duration(hours: 3);
  static const initialCheckDelay = Duration(seconds: 15);

  static Future<void> schedule() async {
    await Workmanager().registerPeriodicTask(
      uniqueName,
      taskName,
      frequency: checkInterval,
      constraints: Constraints(
        networkType: NetworkType.connected,
        requiresBatteryNotLow: true,
      ),
      existingWorkPolicy: ExistingPeriodicWorkPolicy.keep,
    );
    Loggy('AirQualityBackgroundTask').info(
      'Scheduled periodic AQ background check (requested every ${checkInterval.inHours}h; iOS timing is best-effort)',
    );
  }

  /// One-time check shortly after first NavPage load — validates the background
  /// path on device without waiting for the 3-hour periodic schedule.
  static Future<void> scheduleInitialCheck() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool(initialCheckScheduledKey) ?? false) {
      return;
    }

    await Workmanager().registerOneOffTask(
      initialCheckUniqueName,
      taskName,
      initialDelay: initialCheckDelay,
      constraints: Constraints(
        networkType: NetworkType.connected,
      ),
    );

    await prefs.setBool(initialCheckScheduledKey, true);
    Loggy('AirQualityBackgroundTask').info(
      'Scheduled initial AQ background check (requested in ${initialCheckDelay.inSeconds}s; iOS timing is best-effort)',
    );
  }

  /// Runs in a background isolate — AQ OS alerts only (no survey UI).
  static Future<bool> run() async {
    try {
      WidgetsFlutterBinding.ensureInitialized();

      await HiveBoxSetup.initializeBoxes();
      await CacheManager().initialize();
      await dotenv.load(fileName: '.env.prod');
      await PushNotificationService().initializeLocalOnly();

      final response = await DashboardImpl().fetchAirQualityReadings(
        forceRefresh: true,
      );

      await NotificationHelper().checkNearbyAirQuality(response.measurements);
      return true;
    } catch (e, stackTrace) {
      Loggy('AirQualityBackgroundTask')
          .error('Background AQ check failed', e, stackTrace);
      return false;
    }
  }
}

@pragma('vm:entry-point')
void airQualityBackgroundCallbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    switch (task) {
      case AirQualityBackgroundTask.taskName:
      case Workmanager.iOSBackgroundTask:
        return AirQualityBackgroundTask.run();
      default:
        return false;
    }
  });
}
