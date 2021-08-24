import 'dart:typed_data';

import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class Notifications {
  FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  void initNotifications() async {
    final initializationSettingsAndroid =
        const AndroidInitializationSettings('launcher_icon');
    final initializationSettingsIOS =
        const IOSInitializationSettings(onDidReceiveLocalNotification: null);
    final initializationSettingsMacOS = const MacOSInitializationSettings();
    final initializationSettings = InitializationSettings(
        android: initializationSettingsAndroid,
        iOS: initializationSettingsIOS,
        macOS: initializationSettingsMacOS);
    await flutterLocalNotificationsPlugin.initialize(initializationSettings,
        onSelectNotification: selectNotification);
  }

  void cancelNotifications(int id) async {
    await flutterLocalNotificationsPlugin.cancel(id);
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
      'push_messages: AirQo',
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
      'smart_messages: AirQo',
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

  Future selectNotification(String? payload) async {
    if (payload != null) {
      debugPrint('notification payload: $payload');
    }

    // await Navigator.push(
    //   context,
    //   MaterialPageRoute<void>(builder: (context) => MapPage()),
    // );
  }

  // Future onDidReceiveLocalNotification(
  //     int id, String title, String body, String payload) async {
  //   // display a dialog with the notification details, tap ok to go to another page
  //   showDialog(
  //     context: context,
  //     builder: (BuildContext context) => CupertinoAlertDialog(
  //       title: Text(title),
  //       content: Text(body),
  //       actions: [
  //         CupertinoDialogAction(
  //           isDefaultAction: true,
  //           child: Text('Ok'),
  //           onPressed: () async {
  //             Navigator.of(context, rootNavigator: true).pop();
  //             await Navigator.push(
  //               context,
  //               MaterialPageRoute(
  //                 builder: (context) => SecondScreen(payload),
  //               ),
  //             );
  //           },
  //         )
  //       ],
  //     ),
  //   );
  // }

  Future<void> showSimpleNotification() async {
    var androidDetails = const AndroidNotificationDetails(
        'id', 'channel ', 'description',
        priority: Priority.high, importance: Importance.max);
    var iOSDetails = const IOSNotificationDetails();
    var platformDetails =
        NotificationDetails(android: androidDetails, iOS: iOSDetails);
    await flutterLocalNotificationsPlugin.show(
        0, 'AirQo', 'Simple Notification', platformDetails,
        payload: 'Destination Screen (Simple Notification)');
  }

  Future<void> showScheduleNotification() async {
    var scheduledNotificationDateTime =
        DateTime.now().add(const Duration(seconds: 5));
    var androidDetails = const AndroidNotificationDetails(
      'channel_id',
      'Channel Name',
      'Channel Description',
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

  Future<void> showPeriodicNotification() async {
    const androidNotificationDetails = AndroidNotificationDetails(
        'channel_id', 'Channel Name', 'Channel Description');
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

  Future<void> showBigPictureNotification() async {
    var bigPictureStyleInformation = const BigPictureStyleInformation(
      DrawableResourceAndroidBitmap('launcher_icon'),
      largeIcon: DrawableResourceAndroidBitmap('launcher_icon'),
      contentTitle: 'Big Picture Notification Title',
      summaryText: 'Big Picture Notification Summary Text',
    );
    var androidDetails = AndroidNotificationDetails(
        'channel_id', 'Channel Name', 'Channel Description',
        styleInformation: bigPictureStyleInformation);
    var platformDetails =
        NotificationDetails(android: androidDetails, iOS: null);
    await flutterLocalNotificationsPlugin.show(
        0, 'AirQo', 'Flutter Big Picture Notification', platformDetails,
        payload: 'Destination Screen(Big Picture Notification)');
  }

  Future<void> showBigTextNotification() async {
    const bigTextStyleInformation = BigTextStyleInformation(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do '
      'eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      ' Ut enim ad minim veniam, quis nostrud exercitation ullamco '
      'laboris nisi ut aliquip ex ea commodo consequat. '
      'Duis aute irure dolor in reprehenderit in voluptate velit esse '
      'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat '
      'cupidatat non proident, sunt in culpa qui officia deserunt'
      ' mollit anim id est laborum.',
      htmlFormatBigText: true,
      contentTitle: 'Big Text Notification Title',
      htmlFormatContentTitle: true,
      summaryText: 'Big Text Notification Summary Text',
      htmlFormatSummaryText: true,
    );
    const androidNotificationDetails = AndroidNotificationDetails(
        'channel_id', 'Channel Name', 'Channel Description',
        styleInformation: bigTextStyleInformation);
    const notificationDetails =
        NotificationDetails(android: androidNotificationDetails, iOS: null);
    await flutterLocalNotificationsPlugin.show(
        0, 'AirQo', 'Big Text Notification', notificationDetails,
        payload: 'Destination Screen(Big Text Notification)');
  }

  Future<void> showInsistentNotification() async {
    const int insistentFlag = 4;
    final androidPlatformChannelSpecifics = AndroidNotificationDetails(
        'channel_id', 'Channel Name', 'Channel Description',
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
    const androidNotificationDetails = AndroidNotificationDetails(
        '$persistentNotificationId', 'Channel Name', 'Channel Description',
        importance: Importance.max,
        icon: 'launcher_icon',
        priority: Priority.high,
        ongoing: true,
        autoCancel: false);
    const notificationDetails =
        NotificationDetails(android: androidNotificationDetails, iOS: null);
    await flutterLocalNotificationsPlugin.show(persistentNotificationId,
        'AirQo', 'Ongoing Notification', notificationDetails,
        payload: 'Destination Screen(Ongoing Notification)');
  }

  Future<void> showProgressNotification() async {
    const int maxProgress = 5;
    for (int i = 0; i <= maxProgress; i++) {
      await Future<void>.delayed(const Duration(seconds: 1), () async {
        final androidNotificationDetails = AndroidNotificationDetails(
            'channel_id', 'Channel Name', 'Channel Description',
            channelShowBadge: false,
            importance: Importance.max,
            priority: Priority.high,
            onlyAlertOnce: true,
            showProgress: true,
            maxProgress: maxProgress,
            progress: i);
        final notificationDetails =
            NotificationDetails(android: androidNotificationDetails, iOS: null);
        await flutterLocalNotificationsPlugin.show(progressNotificationId,
            'AirQo', 'Progress Notification', notificationDetails,
            payload: 'Destination Screen(Progress Notification)');
      });
    }
  }
}
