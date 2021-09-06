import 'package:app/constants/app_constants.dart';
import 'package:app/models/site.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class FbNotifications {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> backgroundMessageHandler(RemoteMessage message) async {
    print('Handling a background message: ${message.messageId}');
  }

  Future<void> foregroundMessageHandler(RemoteMessage message) async {
    print('Message data: ${message.data}');
    if (message.notification != null) {
      print('Message also contained a notification: ${message.notification}');
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
    await _firebaseMessaging.subscribeToTopic(_getTopic(site, pollutantLevel));
  }

  Future<void> subscribeToSite(Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging.subscribeToTopic(_getTopic(site, pollutantLevel));
  }

  Future<void> subscribeToUpdates(
      Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging.subscribeToTopic(_getTopic(site, pollutantLevel));
  }

  Future<void> unSubscribeFromSites(
      List<Site> sites, List<PollutantLevel> pollutantLevels) async {
    for (var site in sites) {
      for (var pollutantLevel in pollutantLevels) {
        await unSubscribeToSite(site, pollutantLevel);
      }
    }
  }

  Future<void> unSubscribeToSite(
      Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging
        .unsubscribeFromTopic(_getTopic(site, pollutantLevel));
  }

  String _getTopic(Site site, PollutantLevel pollutantLevel) {
    return '${site.id}-${pollutantLevel.getString()}';
  }
}
