// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AppNotification _$AppNotificationFromJson(Map<String, dynamic> json) =>
    AppNotification(
      id: json['id'] as String,
      title: json['title'] as String,
      subTitle: json['subTitle'] as String,
      link: json['link'] as String,
      icon: notificationIconFromJson(json['icon']),
      image: json['image'] as String,
      body: json['body'] as String,
      read: json['read'] as bool,
      type: $enumDecode(_$AppNotificationTypeEnumMap, json['type']),
      dateTime: json['dateTime'] == null
          ? null
          : DateTime.parse(json['dateTime'] as String),
    );

Map<String, dynamic> _$AppNotificationToJson(AppNotification instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'subTitle': instance.subTitle,
      'link': instance.link,
      'icon': notificationIconToJson(instance.icon),
      'image': instance.image,
      'body': instance.body,
      'dateTime': instance.dateTime.toIso8601String(),
      'read': instance.read,
      'type': _$AppNotificationTypeEnumMap[instance.type]!,
    };

const _$AppNotificationTypeEnumMap = {
  AppNotificationType.appUpdate: 'appUpdate',
  AppNotificationType.reminder: 'reminder',
  AppNotificationType.welcomeMessage: 'welcomeMessage',
};

AppNotificationList _$AppNotificationListFromJson(Map<String, dynamic> json) =>
    AppNotificationList(
      data: (json['data'] as List<dynamic>)
          .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AppNotificationListToJson(
        AppNotificationList instance) =>
    <String, dynamic>{
      'data': instance.data.map((e) => e.toJson()).toList(),
    };
