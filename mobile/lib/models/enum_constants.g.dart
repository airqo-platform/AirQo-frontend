// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'enum_constants.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AppNotificationTypeAdapter extends TypeAdapter<AppNotificationType> {
  @override
  final int typeId = 110;

  @override
  AppNotificationType read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return AppNotificationType.appUpdate;
      case 1:
        return AppNotificationType.reminder;
      case 2:
        return AppNotificationType.welcomeMessage;
      default:
        return AppNotificationType.appUpdate;
    }
  }

  @override
  void write(BinaryWriter writer, AppNotificationType obj) {
    switch (obj) {
      case AppNotificationType.appUpdate:
        writer.writeByte(0);
        break;
      case AppNotificationType.reminder:
        writer.writeByte(1);
        break;
      case AppNotificationType.welcomeMessage:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AppNotificationTypeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
