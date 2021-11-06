import 'dart:collection';

import 'package:flutter/material.dart';
import 'package:json_annotation/json_annotation.dart';

part 'notification.g.dart';

class NotificationModel extends ChangeNotifier {
  final List<UserNotification> _notifications = [];
  bool _navBarNotification = true;

  bool get navBarNotification {
    return _navBarNotification && hasNotifications();
  }

  UnmodifiableListView<UserNotification> get notifications =>
      UnmodifiableListView(_notifications);

  void add(UserNotification notification) {
    _notifications.add(notification);
    notifyListeners();
  }

  void addAll(List<UserNotification> notifications) {
    _notifications.addAll(notifications);
    notifyListeners();
  }

  bool hasNotifications() {
    return _notifications.where((element) => element.isNew).toList().isNotEmpty;
  }

  void removeAll() {
    _notifications.clear();
    _navBarNotification = false;
    notifyListeners();
  }

  void removeNavBarNotification() {
    _navBarNotification = false;
    notifyListeners();
  }
}

@JsonSerializable()
class UserNotification {
  final String id;
  final String title;
  final String message;
  bool isNew = true;

  UserNotification(this.id, this.title, this.message, this.isNew);

  factory UserNotification.fromJson(Map<String, dynamic> json) =>
      _$UserNotificationFromJson(json);

  void setHasNotification() {}

  Map<String, dynamic> toJson() => _$UserNotificationToJson(this);

  static String alertDbName() => 'alerts_table';

  static String createTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${alertDbName()}('
      '${dbSiteId()} TEXT PRIMARY KEY, '
      '${dbReceiver()} TEXT, '
      '${dbSiteName()} TEXT, '
      '${dbType()} TEXT, '
      '${dbHour()} INT, '
      '${dbAirQuality()} TEXT )';

  static String dbAirQuality() => 'airQuality';

  static String dbHour() => 'hour';

  static String dbReceiver() => 'receiver';

  static String dbSiteId() => 'siteId';

  static String dbSiteName() => 'siteName';

  static String dbType() => 'type';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${alertDbName()}';

  static UserNotification? parseNotification(dynamic jsonBody) {
    try {
      var notification = UserNotification.fromJson(jsonBody);
      return notification;
    } catch (e) {
      debugPrint(e.toString());
    }

    return null;
  }

  static List<UserNotification> parseNotifications(dynamic jsonBody) {
    var notifications = <UserNotification>[];

    for (var jsonElement in jsonBody) {
      try {
        var measurement = UserNotification.fromJson(jsonElement);
        notifications.add(measurement);
      } catch (e) {
        debugPrint(e.toString());
      }
    }

    return notifications;
  }
}
