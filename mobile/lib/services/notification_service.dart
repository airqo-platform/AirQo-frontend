import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class NotificationService {
  static Future<void> updateNotificationStatus(BuildContext context) async {
    Profile profile = context.read<ProfileBloc>().state;
    await Permission.notification.request().then((status) {
      switch (status) {
        case PermissionStatus.granted:
        case PermissionStatus.provisional:
        case PermissionStatus.limited:
          context
              .read<ProfileBloc>()
              .add(UpdateProfile(profile.copyWith(notifications: true)));
          FirebaseMessaging.instance
              .subscribeToTopic(Config.notificationsTopic);
          CloudAnalytics.logAllowNotification();
          break;
        case PermissionStatus.restricted:
        case PermissionStatus.denied:
        case PermissionStatus.permanentlyDenied:
          context
              .read<ProfileBloc>()
              .add(UpdateProfile(profile.copyWith(notifications: false)));
          FirebaseMessaging.instance
              .unsubscribeFromTopic(Config.notificationsTopic);
          break;
      }
    });
  }

  static Future<void> requestNotification(
    BuildContext context,
    String source,
  ) async {
    bool notificationStatus = await Permission.notification.status.isGranted;
    late String enableNotificationsMessage;
    late String disableNotificationsMessage;

    if (Platform.isAndroid) {
      enableNotificationsMessage = AppLocalizations.of(context)!
          .toTurnOnNotificationsGoToAppInfoNotifications;
      disableNotificationsMessage = AppLocalizations.of(context)!
          .toTurnOffNotificationsGoToAppInfoNotifications;
    } else {
      enableNotificationsMessage = AppLocalizations.of(context)!
          .toTurnOnNotificationsGoToSettingsAirQoNotifications;

      disableNotificationsMessage = AppLocalizations.of(context)!
          .toTurnOffNotificationsGoToSettingsAirQoNotifications;
    }

    if (source == "settings" && notificationStatus) {
      await openPhoneSettings(context, disableNotificationsMessage);
    }

    if (source == "dashboard") {
      enableNotificationsMessage =
          "Turn on notifications to get the best AirQo experience";
    }

    await Permission.notification.status.then((status) async {
      switch (status) {
        case PermissionStatus.permanentlyDenied:
        case PermissionStatus.provisional:
        case PermissionStatus.denied:
        case PermissionStatus.restricted:
        case PermissionStatus.limited:
          final bool canNotify = await showRequestNotification();

          if (source != "dashboard" || canNotify) {
            await openPhoneSettings(context, enableNotificationsMessage);
          }
          break;
        case PermissionStatus.granted:
          break;
      }

      await updateNotificationStatus(context);
    });
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
    try {
      FirebaseMessaging.onBackgroundMessage(
        NotificationService.notificationHandler,
      );
      // Temporarily disabling on notification listeners
      // FirebaseMessaging.onMessage
      // .listen(NotificationService.notificationHandler);
      FirebaseMessaging.onMessageOpenedApp.listen(
        (_) {
          CloudAnalytics.logEvent(
            CloudAnalyticsEvent.notificationOpen,
          );
        },
      );
      FirebaseMessaging.instance.onTokenRefresh.listen((fcmToken) {
        // TODO update cloud store
      });
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
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
                iOS: const DarwinNotificationDetails(
                  presentAlert: true,
                  presentSound: true,
                  presentBadge: true,
                ),
              ),
            ),
            CloudAnalytics.logEvent(
              CloudAnalyticsEvent.notificationReceive,
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

  static Future<bool> showRequestNotification() async {
    final prefs = await SharedPreferencesHelper.instance;
    final int count = prefs.getInt("requestNotificationCount") ?? 0;
    await prefs.setInt("requestNotificationCount", count + 1);
    if (count % 5 == 0 && count < 25) {
      return true;
    }
    return false;
  }

  static Future<void> handleNotifications(RemoteMessage message) async {
    final notificationTarget = message.data['subject'] as String;
    final prefs = await SharedPreferencesHelper.instance;
    await prefs.setString("pushNotificationTarget", notificationTarget);
    CloudAnalytics.logNotificationReceive();
  }
}
