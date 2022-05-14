import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';

part 'notification.g.dart';
//
// class NotificationModel extends ChangeNotifier {
//   final List<AppNotification> _notifications = [];
//   bool _navBarNotification = true;
//   final DBHelper _dbHelper = DBHelper();
//
//   bool get navBarNotification {
//     return _navBarNotification && hasNotifications();
//   }
//
//   UnmodifiableListView<AppNotification> get notifications =>
//       UnmodifiableListView(_notifications);
//
//   void add(AppNotification notification) {
//     _notifications.add(notification);
//     notifyListeners();
//   }
//
//   void addAll(List<AppNotification> notifications) {
//     _notifications
//       ..clear()
//       ..addAll(notifications);
//     notifyListeners();
//   }
//
//   bool hasNotifications() {
//     return _notifications.where((element) => element.isNew).toList().isNotEmpty;
//   }
//
//   Future<void> loadNotifications() async {
//     var notifications = await _dbHelper.getAppNotifications();
//     _notifications
//       ..clear()
//       ..addAll(notifications);
//     notifyListeners();
//   }
//
//   void removeAll() {
//     _notifications.clear();
//     _navBarNotification = false;
//     notifyListeners();
//   }
//
//   void removeNavBarNotification() {
//     _navBarNotification = false;
//     notifyListeners();
//   }
// }

@JsonSerializable()
@HiveType(typeId: 10, adapterName: 'AppNotificationAdapter')
class AppNotification extends HiveObject {
  @HiveField(1)
  String id;

  @HiveField(2)
  String title;

  @HiveField(3)
  String subTitle;

  @HiveField(4)
  String link;

  @HiveField(5)
  String icon;

  @HiveField(6)
  String image;

  @HiveField(7)
  String body;

  @HiveField(8)
  DateTime dateTime;

  @HiveField(9)
  bool read;

  @HiveField(10)
  AppNotificationType type;

  AppNotification(this.id, this.title, this.subTitle, this.link, this.icon,
      this.image, this.body, this.dateTime, this.read, this.type);

  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      _$AppNotificationFromJson(json);

  void setHasNotification() {}

  Map<String, dynamic> toJson() => _$AppNotificationToJson(this);

  static AppNotification? composeAppNotification(RemoteMessage message) {
    debugPrint('Message data: ${message.data}');

    var data = message.data;

    if (data.isNotEmpty) {
      return null;
    }

    return null;
  }

  static AppNotification? parseAppNotification(dynamic jsonBody) {
    try {
      var notification = AppNotification.fromJson(jsonBody);
      return notification;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }

    return null;
  }

  static List<AppNotification> parseNotifications(dynamic jsonBody) {
    var notifications = <AppNotification>[];

    for (var jsonElement in jsonBody) {
      try {
        var measurement = AppNotification.fromJson(jsonElement);
        notifications.add(measurement);
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
      }
    }
    return notifications;
  }

  static List<AppNotification> reorderNotifications(
      List<AppNotification> notificationList) {
    notificationList.sort((x, y) {
      return -x.dateTime.compareTo(y.dateTime);
    });
    return notificationList;
  }
}
