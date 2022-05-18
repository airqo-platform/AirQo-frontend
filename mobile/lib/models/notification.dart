import 'package:app/utils/exception.dart';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

import '../constants/config.dart';
import 'enum_constants.dart';
import 'json_parsers.dart';

part 'notification.g.dart';

@JsonSerializable()
@HiveType(typeId: 10, adapterName: 'AppNotificationAdapter')
class AppNotification extends HiveObject {
  @HiveField(1)
  String id;

  @HiveField(2, defaultValue: '')
  String title;

  @HiveField(3, defaultValue: '')
  String subTitle;

  @HiveField(4, defaultValue: '')
  String link;

  @JsonKey(fromJson: notificationIconFromJson, toJson: notificationIconToJson)
  @HiveField(5, defaultValue: 'assets/icon/airqo_logo.svg')
  String icon;

  @HiveField(6, defaultValue: '')
  String image;

  @HiveField(7, defaultValue: '')
  String body;

  @HiveField(8)
  DateTime dateTime;

  @HiveField(9, defaultValue: false)
  bool read;

  @HiveField(10, defaultValue: AppNotificationType.welcomeMessage)
  AppNotificationType type;

  AppNotification(
      {required this.id,
      required this.title,
      required this.subTitle,
      required this.link,
      required this.icon,
      required this.image,
      required this.body,
      required this.read,
      required this.type,
      DateTime? dateTime})
      : dateTime = dateTime ?? DateTime.now();

  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      _$AppNotificationFromJson(json);

  Map<String, dynamic> toJson() => _$AppNotificationToJson(this);

  static AppNotification? parseAppNotification(dynamic jsonBody) {
    try {
      var notification = AppNotification.fromJson(jsonBody);
      return notification;
    } catch (exception, stackTrace) {
      logException(exception, stackTrace);
      return null;
    }
  }

  static List<AppNotification> sort(List<AppNotification> notifications) {
    notifications.sort((x, y) {
      return -(x.dateTime.compareTo(y.dateTime));
    });
    return notifications;
  }

  static Future<void> load(List<AppNotification> notifications) async {
    final newNotifications = <dynamic, AppNotification>{};

    for (var notification in notifications) {
      newNotifications[notification.id] = notification;
    }

    await Hive.box<AppNotification>(HiveBox.appNotifications)
        .putAll(newNotifications);
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
