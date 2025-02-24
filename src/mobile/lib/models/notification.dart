import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';
import 'json_parsers.dart';

part 'notification.g.dart';

@JsonSerializable()
class AppNotification extends Equatable {
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

  final String id;

  final String title;

  final String subTitle;

  final String link;

  @JsonKey(fromJson: notificationIconFromJson, toJson: notificationIconToJson)
  final String icon;

  final String image;

  final String body;

  final DateTime dateTime;

  final bool read;

  final AppNotificationType type;

  Map<String, dynamic> toJson() => _$AppNotificationToJson(this);

  static List<AppNotification> sort(List<AppNotification> notifications) {
    notifications.sort(
      (x, y) {
        return -(x.dateTime.compareTo(y.dateTime));
      },
    );

    return notifications;
  }

  @override
  List<Object?> get props => [id];
}

@JsonSerializable(explicitToJson: true)
class AppNotificationList {
  factory AppNotificationList.fromJson(Map<String, dynamic> json) =>
      _$AppNotificationListFromJson(json);

  AppNotificationList({required this.data});

  List<AppNotification> data;

  Map<String, dynamic> toJson() => _$AppNotificationListToJson(this);
}
