// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AppNotificationAdapter extends TypeAdapter<AppNotification> {
  @override
  final int typeId = 10;

  @override
  AppNotification read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return AppNotification(
      fields[1] as String,
      fields[2] as String,
      fields[3] as String,
      fields[4] as String,
      fields[5] as String,
      fields[6] as String,
      fields[7] as String,
      fields[8] as DateTime,
      fields[9] as bool,
      fields[10] as AppNotificationType,
    );
  }

  @override
  void write(BinaryWriter writer, AppNotification obj) {
    writer
      ..writeByte(10)
      ..writeByte(1)
      ..write(obj.id)
      ..writeByte(2)
      ..write(obj.title)
      ..writeByte(3)
      ..write(obj.subTitle)
      ..writeByte(4)
      ..write(obj.link)
      ..writeByte(5)
      ..write(obj.icon)
      ..writeByte(6)
      ..write(obj.image)
      ..writeByte(7)
      ..write(obj.body)
      ..writeByte(8)
      ..write(obj.dateTime)
      ..writeByte(9)
      ..write(obj.read)
      ..writeByte(10)
      ..write(obj.type);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AppNotificationAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AppNotification _$AppNotificationFromJson(Map<String, dynamic> json) =>
    AppNotification(
      json['id'] as String,
      json['title'] as String,
      json['subTitle'] as String,
      json['link'] as String,
      json['icon'] as String,
      json['image'] as String,
      json['body'] as String,
      DateTime.parse(json['dateTime'] as String),
      json['read'] as bool,
      $enumDecode(_$AppNotificationTypeEnumMap, json['type']),
    );

Map<String, dynamic> _$AppNotificationToJson(AppNotification instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'subTitle': instance.subTitle,
      'link': instance.link,
      'icon': instance.icon,
      'image': instance.image,
      'body': instance.body,
      'dateTime': instance.dateTime.toIso8601String(),
      'read': instance.read,
      'type': _$AppNotificationTypeEnumMap[instance.type],
    };

const _$AppNotificationTypeEnumMap = {
  AppNotificationType.appUpdate: 'appUpdate',
  AppNotificationType.reminder: 'reminder',
  AppNotificationType.welcomeMessage: 'welcomeMessage',
};
