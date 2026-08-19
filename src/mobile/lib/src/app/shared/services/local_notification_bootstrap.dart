import 'package:airqo/src/app/shared/navigation/app_navigator.dart';
import 'package:airqo/src/app/shared/services/air_quality_background_task.dart';
import 'package:airqo/src/app/shared/services/notification_helper.dart';
import 'package:airqo/src/app/shared/services/navigation_service.dart';
import 'package:airqo/src/app/shared/services/push_notification_service.dart';
import 'package:loggy/loggy.dart';

/// Phase 0/1 entry point: local notifications only (no FCM).
class LocalNotificationBootstrap with UiLoggy {
  LocalNotificationBootstrap._();
  static final LocalNotificationBootstrap instance = LocalNotificationBootstrap._();

  static bool _initialized = false;

  Future<void> ensureInitialized() async {
    if (_initialized) return;

    NavigationService.setNavigatorKey(appNavigatorKey);
    NotificationHelper().configureTapHandling();
    await PushNotificationService().initializeLocalOnly();
    await PushNotificationService().processLaunchNotification();
    await AirQualityBackgroundTask.schedule();
    await AirQualityBackgroundTask.scheduleInitialCheck();

    _initialized = true;
    loggy.info('Local notification bootstrap complete');
  }
}
