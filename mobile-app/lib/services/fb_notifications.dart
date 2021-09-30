import 'package:app/constants/app_constants.dart';
import 'package:app/models/site.dart';
import 'package:app/models/topicData.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'local_notifications.dart';

Future<void> backgroundMessageHandler(RemoteMessage message) async {
  var notificationMessage = AppNotification().composeNotification(message);

  print(message.data);

  if (!notificationMessage.isEmpty()) {
    var notificationHandler = LocalNotifications()..initNotifications();
    await notificationHandler.showAlertNotification(notificationMessage);
  }
}

Future<void> foregroundMessageHandler(RemoteMessage message) async {
  var notificationMessage = AppNotification().composeNotification(message);

  print(message.data);

  if (!notificationMessage.isEmpty()) {
    var notificationHandler = LocalNotifications()..initNotifications();
    await notificationHandler.showAlertNotification(notificationMessage);
  }
}

class FbNotifications {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> backgroundMessageHandler(RemoteMessage message) async {
    var notificationMessage = AppNotification().composeNotification(message);

    print(message.data);

    if (!notificationMessage.isEmpty()) {
      var notificationHandler = LocalNotifications()..initNotifications();
      await notificationHandler.showAlertNotification(notificationMessage);
    }
  }

  Future<void> foregroundMessageHandler(RemoteMessage message) async {
    var notificationMessage = AppNotification().composeNotification(message);

    print(message.data);

    if (!notificationMessage.isEmpty()) {
      var notificationHandler = LocalNotifications()..initNotifications();
      await notificationHandler.showAlertNotification(notificationMessage);
    }
  }

  Future<void> init() async {
    var settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    print('User granted permission: ${settings.authorizationStatus}');
  }

  Future<void> subscribeToNewsFeed(
      Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging.subscribeToTopic(site.getTopic(pollutantLevel));
  }

  Future<void> subscribeToSite(Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging.subscribeToTopic(site.getTopic(pollutantLevel));
  }

  Future<void> subscribeToUpdates(
      Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging.subscribeToTopic(site.getTopic(pollutantLevel));
  }

  Future<void> unSubscribeFromSite(
      Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging
        .unsubscribeFromTopic(site.getTopic(pollutantLevel));
  }

  Future<void> unSubscribeFromSites(
      List<Site> sites, List<PollutantLevel> pollutantLevels) async {
    for (var site in sites) {
      for (var pollutantLevel in pollutantLevels) {
        await unSubscribeFromSite(site, pollutantLevel);
      }
    }
  }
}
