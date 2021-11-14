// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserNotification _$UserNotificationFromJson(Map<String, dynamic> json) =>
    UserNotification(
      json['id'] as String,
      json['title'] as String,
      json['body'] as String,
      _isNewFromJson(json['isNew']),
      json['time'] as String,
    );

Map<String, dynamic> _$UserNotificationToJson(UserNotification instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'body': instance.body,
      'time': instance.time,
      'isNew': _isNewToJson(instance.isNew),
    };
