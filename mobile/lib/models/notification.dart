import 'dart:collection';

import 'package:app/services/local_storage.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:json_annotation/json_annotation.dart';

import 'json_parsers.dart';

part 'notification.g.dart';

class NotificationModel extends ChangeNotifier {
  final List<UserNotification> _notifications = [];
  bool _navBarNotification = true;
  final DBHelper _dbHelper = DBHelper();

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
    _notifications
      ..clear()
      ..addAll(notifications);
    notifyListeners();
  }

  bool hasNotifications() {
    return _notifications.where((element) => element.isNew).toList().isNotEmpty;
  }

  Future<void> loadNotifications() async {
    var notifications = await _dbHelper.getUserNotifications();
    _notifications
      ..clear()
      ..addAll(notifications);
    notifyListeners();
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
  String id;
  String title;
  String body;
  String time;

  @JsonKey(fromJson: boolFromJson, toJson: boolToJson)
  bool isNew = true;

  UserNotification(this.id, this.title, this.body, this.isNew, this.time);

  factory UserNotification.fromJson(Map<String, dynamic> json) =>
      _$UserNotificationFromJson(json);

  void setHasNotification() {}

  Map<String, dynamic> toJson() => _$UserNotificationToJson(this);

  static UserNotification? composeNotification(RemoteMessage message) {
    debugPrint('Message data: ${message.data}');

    var data = message.data;

    if (data.isNotEmpty) {
      return UserNotification(message.hashCode.toString(), data['message'],
          data['message'], true, DateTime.now().toUtc().toString());
    }

    return null;
  }

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      'id TEXT PRIMARY KEY, '
      'title TEXT, '
      'body TEXT, '
      'time TEXT, '
      'isNew TEXT )';

  static String dbName() => 'notifications_table';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

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

  static List<UserNotification> reorderNotifications(
      List<UserNotification> notificationList) {
    notificationList.sort((x, y) {
      return -(DateTime.parse(x.time).compareTo(DateTime.parse(y.time)));
    });
    return notificationList;
  }
}
