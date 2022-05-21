import 'package:app/utils/extensions.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../models/enum_constants.dart';
import '../models/profile.dart';
import '../utils/exception.dart';
import 'firebase_service.dart';

class NotificationService {
  static Future<bool> checkPermission() async {
    try {
      var settings = await FirebaseMessaging.instance.getNotificationSettings();

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        return true;
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }

    return false;
  }

  static Future<void> updateNotificationSettings({String? token}) async {
    try {
      var user = CustomAuth.getUser();
      if (user == null) {
        return;
      }
      var device = token ?? await FirebaseMessaging.instance.getToken();
      var utcOffset = DateTime.now().getUtcOffset();
      debugPrint('deice token : $device');

      if (device != null) {
        await CloudStore.updateProfileFields(
            user.uid, {'device': device, 'utcOffset': utcOffset});
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  static Future<bool> requestPermission() async {
    try {
      var settings = await FirebaseMessaging.instance.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
      var status =
          settings.authorizationStatus == AuthorizationStatus.authorized;

      var id = CustomAuth.getUserId();

      if (id != '') {
        await CloudStore.updatePreferenceFields(
            id, 'notifications', status, 'bool');
      }
      if (status) {
        await CloudAnalytics.logEvent(AnalyticsEvent.allowNotification, true);
      }
      return status;
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return false;
  }

  static Future<bool> revokePermission() async {
    // TODO: implement revoke permission
    var id = CustomAuth.getUserId();

    if (id != '') {
      await CloudStore.updatePreferenceFields(
          id, 'notifications', false, 'bool');
    }
    return false;
  }

  static Future<void> initNotifications(RemoteMessage message) async {
    await requestPermission();
    await FirebaseMessaging.instance
        .setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );
    await NotificationService.notificationHandler(message);
    FirebaseMessaging.instance.onTokenRefresh.listen((fcmToken) {
      updateNotificationSettings(token: fcmToken);
    }).onError((err) {
      logException(err, '');
    });
  }

  static Future<void> notificationHandler(RemoteMessage message) async {
    // TODO: LOG EVENT
    try {
      const channel = AndroidNotificationChannel(
        'high_importance_channel',
        'High Importance Notifications',
        description: 'This channel is used for important notifications.',
        importance: Importance.max,
      );

      final flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

      await flutterLocalNotificationsPlugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);

      var notification = message.notification;

      if (notification != null) {
        await flutterLocalNotificationsPlugin.show(
            notification.hashCode,
            notification.title,
            notification.body,
            NotificationDetails(
                android: AndroidNotificationDetails(channel.id, channel.name,
                    channelDescription: channel.description,
                    icon: 'notification_icon'),
                iOS: const IOSNotificationDetails(
                    presentAlert: true,
                    presentSound: true,
                    presentBadge: true)));
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<bool> allowNotifications() async {
    var enabled = await requestPermission();
    if (enabled) {
      await Future.wait([
        CloudAnalytics.logEvent(AnalyticsEvent.allowNotification, true),
        Profile.getProfile().then((profile) => profile.saveProfile())
      ]);
    }
    return enabled;
  }
}
