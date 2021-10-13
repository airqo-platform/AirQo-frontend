import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/alert.dart';
import 'package:app/models/site.dart';
import 'package:app/models/topicData.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'local_notifications.dart';

class CloudStore {
  Future<bool> deleteAlert(Alert alert) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      await FirebaseFirestore.instance
          .collection(CloudStorage.alertsCollection)
          .doc(alert.getAlertDbId())
          .delete();

      return true;
    } else {
      return false;
    }
  }

  Future<bool> isConnected() async {
    try {
      final result = await InternetAddress.lookup('firebase.google.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        return true;
      }
      return false;
    } on SocketException catch (_) {
      return false;
    }
  }

  Future<bool> saveAlert(Alert alert) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      var alertJson = alert.toJson();
      alertJson['platform'] = Platform.isIOS ? 'ios' : 'android';
      await FirebaseFirestore.instance
          .collection(CloudStorage.alertsCollection)
          .doc(alert.getAlertDbId())
          .set(alertJson);
      return true;
    } else {
      return false;
    }
  }
}

class NotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<String?> getToken() async {
    var token = await _firebaseMessaging.getToken();
    return token;
  }

  Future<void> requestPermission() async {
    await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
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
