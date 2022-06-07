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
      id: fields[1] as String,
      title: fields[2] == null ? '' : fields[2] as String,
      subTitle: fields[3] == null ? '' : fields[3] as String,
      link: fields[4] == null ? '' : fields[4] as String,
      icon: fields[5] == null
          ? 'assets/icon/airqo_logo.svg'
          : fields[5] as String,
      image: fields[6] == null ? '' : fields[6] as String,
      body: fields[7] == null ? '' : fields[7] as String,
      read: fields[9] == null ? false : fields[9] as bool,
      type: fields[10] == null
          ? AppNotificationType.welcomeMessage
          : fields[10] as AppNotificationType,
      dateTime: fields[8] as DateTime?,
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
      id: json['id'] as String,
      title: json['title'] as String,
      subTitle: json['subTitle'] as String,
      link: json['link'] as String,
      icon: notificationIconFromJson(
        json['icon'],
      ),
      image: json['image'] as String,
      body: json['body'] as String,
      read: json['read'] as bool,
      type: $enumDecode(
        _$AppNotificationTypeEnumMap,
        json['type'],
      ),
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
      'type': _$AppNotificationTypeEnumMap[instance.type],
    };

const _$AppNotificationTypeEnumMap = {
  AppNotificationType.appUpdate: 'appUpdate',
  AppNotificationType.reminder: 'reminder',
  AppNotificationType.welcomeMessage: 'welcomeMessage',
};
