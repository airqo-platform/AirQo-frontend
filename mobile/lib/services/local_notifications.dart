import 'dart:typed_data';

import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class LocalNotifications {
  FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  void cancelNotifications(int id) async {
    await flutterLocalNotificationsPlugin.cancel(id);
  }

  void initNotifications() async {
    const initializationSettingsAndroid =
        AndroidInitializationSettings('launcher_icon');
    const initializationSettingsIOS =
        IOSInitializationSettings(onDidReceiveLocalNotification: null);
    const initializationSettingsMacOS = MacOSInitializationSettings();
    const initializationSettings = InitializationSettings(
        android: initializationSettingsAndroid,
        iOS: initializationSettingsIOS,
        macOS: initializationSettingsMacOS);
    await flutterLocalNotificationsPlugin.initialize(initializationSettings,
        onSelectNotification: selectNotification);
  }

  Future onDidReceiveLocalNotification(
      int? id, String? title, String? body, String? payload) async {
    debugPrint('Notification paylosd$payload');
  }

  Future selectNotification(String? payload) async {
    if (payload != null) {
      debugPrint('notification payload: $payload');
    }

    // await Navigator.push(
    //   context,
    //   MaterialPageRoute<void>(builder: (context) => MapPage()),
    // );
  }

  Future<void> showAlertNotification(AppNotification notification) async {
    var bigTextStyleInformation = BigTextStyleInformation(
      notification.body,
      htmlFormatBigText: true,
      contentTitle: 'AirQo',
      htmlFormatContentTitle: true,
      summaryText: 'AirQo',
      htmlFormatSummaryText: true,
    );

    var androidPlatformChannelSpecifics = AndroidNotificationDetails(
      'push_messages: 0',
      'push_messages: push_messages',
      styleInformation: bigTextStyleInformation,
      importance: Importance.max,
      priority: Priority.high,
      showWhen: false,
      enableVibration: true,
    );

    var iosPlatformChannelSpecifics = const IOSNotificationDetails(
      presentSound: true,
      presentBadge: true,
      presentAlert: true,
    );

    var platformChannelSpecifics = NotificationDetails(
        android: androidPlatformChannelSpecifics,
        iOS: iosPlatformChannelSpecifics);

    await flutterLocalNotificationsPlugin.show(
        1, 'AirQo', 'Air Quality Alert', platformChannelSpecifics,
        payload: 'load');
  }

  Future<void> showBigPictureNotification() async {
    var bigPictureStyleInformation = const BigPictureStyleInformation(
      DrawableResourceAndroidBitmap('launcher_icon'),
      largeIcon: DrawableResourceAndroidBitmap('launcher_icon'),
      contentTitle: 'Big Picture Notification Title',
      summaryText: 'Big Picture Notification Summary Text',
    );
    var androidDetails = AndroidNotificationDetails(
        'channel_id', 'Channel Name',
        styleInformation: bigPictureStyleInformation);
    var platformDetails =
        NotificationDetails(android: androidDetails, iOS: null);
    await flutterLocalNotificationsPlugin.show(
        0, 'AirQo', 'Flutter Big Picture Notification', platformDetails,
        payload: 'Destination Screen(Big Picture Notification)');
  }

  Future<void> showBigTextNotification() async {
    const bigTextStyleInformation = BigTextStyleInformation(
      'You will be receiving notifications on air pollution alerts and '
      'recommendations for your saved places',
      htmlFormatBigText: true,
      contentTitle: 'Big Text Notification Title',
      htmlFormatContentTitle: true,
      summaryText: 'Big Text Notification Summary Text',
      htmlFormatSummaryText: true,
    );
    const androidNotificationDetails = AndroidNotificationDetails(
        'channel_id', 'Channel Name',
        styleInformation: bigTextStyleInformation);
    const notificationDetails =
        NotificationDetails(android: androidNotificationDetails, iOS: null);
    await flutterLocalNotificationsPlugin.show(
        0, 'AirQo', 'Big Text Notification', notificationDetails,
        payload: 'Destination Screen(Big Text Notification)');
  }

  Future<void> showInsistentNotification() async {
    const insistentFlag = 4;
    final androidPlatformChannelSpecifics = AndroidNotificationDetails(
        'channel_id', 'Channel Name',
        importance: Importance.max,
        priority: Priority.high,
        ticker: 'ticker',
        additionalFlags: Int32List.fromList(<int>[insistentFlag]));
    final notificationDetails = NotificationDetails(
        android: androidPlatformChannelSpecifics, iOS: null);
    await flutterLocalNotificationsPlugin.show(
        0, 'AirQo', 'Insistent Notification', notificationDetails,
        payload: 'Destination Screen(Insistent Notification)');
  }

  Future<void> showOngoingNotification() async {
    var androidNotificationDetails = AndroidNotificationDetails(
        '${Config.persistentNotificationId}', 'Channel Name',
        importance: Importance.max,
        icon: 'launcher_icon',
        priority: Priority.high,
        ongoing: true,
        autoCancel: false);
    var notificationDetails =
        NotificationDetails(android: androidNotificationDetails, iOS: null);
    await flutterLocalNotificationsPlugin.show(Config.persistentNotificationId,
        'AirQo', 'Ongoing Notification', notificationDetails,
        payload: 'Destination Screen(Ongoing Notification)');
  }

  Future<void> showPeriodicNotification() async {
    const androidNotificationDetails =
        AndroidNotificationDetails('channel_id', 'Channel Name');
    var notificationDetails = const NotificationDetails(
        android: androidNotificationDetails, iOS: null);
    await flutterLocalNotificationsPlugin.periodicallyShow(
        0,
        'AirQo',
        'Periodic Notification',
        RepeatInterval.everyMinute,
        notificationDetails,
        payload: 'Destination Screen(Periodic Notification)');
  }

  Future<void> showProgressNotification() async {
    const maxProgress = 5;
    for (var i = 0; i <= maxProgress; i++) {
      await Future<void>.delayed(const Duration(seconds: 1), () async {
        final androidNotificationDetails = AndroidNotificationDetails(
            'channel_id', 'Channel Name',
            channelShowBadge: false,
            importance: Importance.max,
            priority: Priority.high,
            onlyAlertOnce: true,
            showProgress: true,
            maxProgress: maxProgress,
            progress: i);
        final notificationDetails =
            NotificationDetails(android: androidNotificationDetails, iOS: null);
        await flutterLocalNotificationsPlugin.show(
            Config.progressNotificationId,
            'AirQo',
            'Progress Notification',
            notificationDetails,
            payload: 'Destination Screen(Progress Notification)');
      });
    }
  }

  Future<void> showPushNotification() async {
    const bigTextStyleInformation = BigTextStyleInformation(
      'You will be receiving push notifications from the AirQo team about'
      ' new features and blog posts',
      htmlFormatBigText: true,
      contentTitle: 'AirQo',
      htmlFormatContentTitle: true,
      summaryText: 'Push Notifications',
      htmlFormatSummaryText: true,
    );

    const androidPlatformChannelSpecifics = AndroidNotificationDetails(
      'push_messages: 0',
      'push_messages: push_messages',
      styleInformation: bigTextStyleInformation,
      importance: Importance.max,
      priority: Priority.high,
      showWhen: false,
      enableVibration: true,
    );
    const platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);
    await flutterLocalNotificationsPlugin.show(
        0, 'AirQo', 'Push Notifications', platformChannelSpecifics,
        payload: 'load');
  }

  Future<void> showScheduleNotification() async {
    var scheduledNotificationDateTime =
        DateTime.now().add(const Duration(seconds: 5));
    var androidDetails = const AndroidNotificationDetails(
      'channel_id',
      'Channel Name',
      icon: 'launcher_icon',
      largeIcon: DrawableResourceAndroidBitmap('launcher_icon'),
    );
    var iOSDetails = const IOSNotificationDetails();
    var platformDetails =
        NotificationDetails(android: androidDetails, iOS: iOSDetails);
    await flutterLocalNotificationsPlugin.schedule(
        0,
        'AirQo',
        'Scheduled Notification',
        scheduledNotificationDateTime,
        platformDetails,
        payload: 'Destination Screen(Schedule Notification)');
  }

  // TODO - fix functionality
  // Future<void> showSimpleNotification(NotificationModel notification) async {
  //   var androidDetails = const AndroidNotificationDetails('id', 'channel ',
  //       priority: Priority.high, importance: Importance.max);
  //   var iOSDetails = const IOSNotificationDetails();
  //   var platformDetails =
  //       NotificationDetails(android: androidDetails, iOS: iOSDetails);
  //   await flutterLocalNotificationsPlugin.show(
  //       1, 'notification.title', 'notification.body', platformDetails,
  //       payload: 'Destination Screen (Simple Notification)');
  // }

  Future<void> showSmartNotification() async {
    const bigTextStyleInformation = BigTextStyleInformation(
      'You will be receiving notifications on air pollution alerts and '
      'recommendations for your saved places',
      htmlFormatBigText: true,
      contentTitle: 'AirQo',
      htmlFormatContentTitle: true,
      summaryText: 'AirQo Smart Notifications',
      htmlFormatSummaryText: true,
    );

    const androidPlatformChannelSpecifics = AndroidNotificationDetails(
      'smart_messages: 0',
      'smart_messages: smart_messages',
      styleInformation: bigTextStyleInformation,
      importance: Importance.max,
      priority: Priority.high,
      showWhen: false,
      enableVibration: true,
    );
    const platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);
    await flutterLocalNotificationsPlugin.show(
        0, 'AirQo', 'Smart Notifications', platformChannelSpecifics,
        payload: 'load');
  }
}
