import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';

import 'firebase_service.dart';
import 'native_api.dart';

class NotificationService {
  static Future<void> notificationRequestDialog(BuildContext context) async {
    Profile profile = context.read<ProfileBloc>().state;
    await Permission.notification.request().then((status) {
      switch (status) {
        case PermissionStatus.granted:
        case PermissionStatus.limited:
          context
              .read<ProfileBloc>()
              .add(UpdateProfile(profile.copyWith(notifications: true)));
          break;
        case PermissionStatus.restricted:
        case PermissionStatus.denied:
        case PermissionStatus.permanentlyDenied:
          context
              .read<ProfileBloc>()
              .add(UpdateProfile(profile.copyWith(notifications: false)));
          break;
      }
    });
  }

  static Future<void> requestNotification(
    BuildContext context,
    bool value,
  ) async {
    Profile profile = context.read<ProfileBloc>().state;
    late String enableNotificationsMessage;
    late String disableNotificationsMessage;

    if (Platform.isAndroid) {
      enableNotificationsMessage =
          'To turn on notifications, go to\nApp Info > Notifications';

      disableNotificationsMessage =
          'To turn off notifications, go to\nApp Info > Notifications';
    } else {
      enableNotificationsMessage =
          'To turn on notifications, go to\nSettings > AirQo > Notifications';

      disableNotificationsMessage =
          'To turn off notifications, go to\nSettings > AirQo > Notifications';
    }

    if (value) {
      await Permission.notification.status.then((status) async {
        switch (status) {
          case PermissionStatus.permanentlyDenied:
            await openPhoneSettings(context, enableNotificationsMessage);
            break;
          case PermissionStatus.denied:
            if (Platform.isAndroid) {
              await openPhoneSettings(context, enableNotificationsMessage);
            } else {
              await notificationRequestDialog(context);
            }
            break;
          case PermissionStatus.restricted:
          case PermissionStatus.limited:
            await notificationRequestDialog(context);
            break;
          case PermissionStatus.granted:
            context
                .read<ProfileBloc>()
                .add(UpdateProfile(profile.copyWith(notifications: true)));
            break;
        }
      });
    } else {
      await openPhoneSettings(context, disableNotificationsMessage);
    }
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
      }).onError(
        (exception) {
          logException(exception, null);
        },
      );
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
}
