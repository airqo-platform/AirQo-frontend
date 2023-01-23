import 'package:app/utils/utils.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import '../services/firebase_service.dart';
import 'enum_constants.dart';
import 'json_parsers.dart';

part 'notification.g.dart';

@JsonSerializable()
@HiveType(typeId: 10, adapterName: 'AppNotificationAdapter')
class AppNotification extends HiveObject {
  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      _$AppNotificationFromJson(json);

  AppNotification({
    required this.id,
    required this.title,
    required this.subTitle,
    required this.link,
    required this.icon,
    required this.image,
    required this.body,
    required this.read,
    required this.type,
    DateTime? dateTime,
  }) : dateTime = dateTime ?? DateTime.now();
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

  Future<void> saveNotification() async {
    await Future.wait([save(), CloudStore.updateCloudNotification(this)]);
  }

  Map<String, dynamic> toJson() => _$AppNotificationToJson(this);

  static AppNotification? parseAppNotification(Map<String, dynamic> jsonBody) {
    try {
      return AppNotification.fromJson(jsonBody);
    } catch (exception, stackTrace) {
      logException(exception, stackTrace);

      return null;
    }
  }

  static List<AppNotification> sort(List<AppNotification> notifications) {
    notifications.sort(
      (x, y) {
        return -(x.dateTime.compareTo(y.dateTime));
      },
    );

    return notifications;
  }
}
