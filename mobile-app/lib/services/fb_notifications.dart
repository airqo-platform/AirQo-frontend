
import 'package:app/constants/app_constants.dart';
import 'package:app/models/alert.dart';
import 'package:app/models/site.dart';
import 'package:app/models/topicData.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'local_notifications.dart';

class CloudStore {
  bool saveAlert(Alert alert) {
    FirebaseFirestore.instance
        .collection(CloudStorage.alertsCollection)
        .doc(alert.getAlertDbId())
        .set(alert.toJson());

    return true;
  }
}

class NotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<String?> getToken() async {
    var token = await _firebaseMessaging.getToken();
    return token;
  }

  Future<void> requestPermission() async {
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

  static Future<void> backgroundMessageHandler(RemoteMessage message) async {
    try {
      var notificationMessage = AppNotification().composeNotification(message);
      if (!notificationMessage.isEmpty()) {
        await LocalNotifications().showAlertNotification(notificationMessage);
      }
    } catch (e) {
      print(e);
    }
  }

  static Future<void> foregroundMessageHandler(RemoteMessage message) async {
    try {
      var notificationMessage = AppNotification().composeNotification(message);
      if (!notificationMessage.isEmpty()) {
        await LocalNotifications().showAlertNotification(notificationMessage);
      }
    } catch (e) {
      print(e);
    }
  }
}
