import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../models/enum_constants.dart';
import '../models/profile.dart';
import '../utils/exception.dart';
import 'firebase_service.dart';
import 'native_api.dart';

class NotificationService {
  static Future<bool> revokePermission() async {
    final profile = await Profile.getProfile();
    await profile.update(enableNotification: false);

    return false;
  }

  static Future<void> initNotifications() async {
    await PermissionService.checkPermission(
      AppPermission.notification,
      request: true,
    );
    await FirebaseMessaging.instance
        .setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );
  }

  static Future<void> listenToNotifications() async {
    FirebaseMessaging.onBackgroundMessage(
      NotificationService.notificationHandler,
    );
    FirebaseMessaging.onMessage.listen(NotificationService.notificationHandler);
    FirebaseMessaging.onMessageOpenedApp.listen(
      (_) {
        CloudAnalytics.logEvent(
          AnalyticsEvent.notificationOpen,
        );
      },
    );
    FirebaseMessaging.instance.onTokenRefresh.listen((fcmToken) async {
      final profile = await Profile.getProfile();
      await profile.update();
    }).onError(
      (err) {
        logException(err, '');
      },
    );
  }

  static Future<void> notificationHandler(RemoteMessage message) async {
    try {
      final notification = message.notification;

      if (notification != null) {
        const channel = AndroidNotificationChannel(
          'high_importance_channel',
          'High Importance Notifications',
          description: 'This channel is used for important notifications.',
          importance: Importance.max,
        );

        final flutterLocalNotificationsPlugin =
            FlutterLocalNotificationsPlugin();

        await flutterLocalNotificationsPlugin
            .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin>()
            ?.createNotificationChannel(channel);

        await Future.wait(
          [
            flutterLocalNotificationsPlugin.show(
              notification.hashCode,
              notification.title,
              notification.body,
              NotificationDetails(
                android: AndroidNotificationDetails(
                  channel.id,
                  channel.name,
                  channelDescription: channel.description,
                  icon: 'notification_icon',
                ),
                iOS: const IOSNotificationDetails(
                  presentAlert: true,
                  presentSound: true,
                  presentBadge: true,
                ),
              ),
            ),
            CloudAnalytics.logEvent(
              AnalyticsEvent.notificationReceive,
            ),
          ],
        );
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  static Future<bool> allowNotifications() async {
    final enabled = await PermissionService.checkPermission(
      AppPermission.notification,
      request: true,
    );
    if (enabled) {
      await Future.wait([
        CloudAnalytics.logEvent(AnalyticsEvent.allowNotification),
        Profile.getProfile().then((profile) => profile.update()),
      ]);
    }

    return enabled;
  }
}
