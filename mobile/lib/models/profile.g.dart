// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ProfileAdapter extends TypeAdapter<Profile> {
  @override
  final int typeId = 20;

  @override
  Profile read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Profile(
      title: fields[0] as String,
      firstName: fields[1] as String,
      lastName: fields[3] == null ? '' : fields[3] as String,
      userId: fields[2] as String,
      emailAddress: fields[4] == null ? '' : fields[4] as String,
      phoneNumber: fields[5] == null ? '' : fields[5] as String,
      device: fields[6] == null ? '' : fields[6] as String,
      preferences: fields[9] as UserPreferences,
      photoUrl: fields[8] == null ? '' : fields[8] as String,
      utcOffset: fields[7] == null ? 0 : fields[7] as int,
    );
  }

  @override
  void write(BinaryWriter writer, Profile obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.title)
      ..writeByte(1)
      ..write(obj.firstName)
      ..writeByte(2)
      ..write(obj.userId)
      ..writeByte(3)
      ..write(obj.lastName)
      ..writeByte(4)
      ..write(obj.emailAddress)
      ..writeByte(5)
      ..write(obj.phoneNumber)
      ..writeByte(6)
      ..write(obj.device)
      ..writeByte(7)
      ..write(obj.utcOffset)
      ..writeByte(8)
      ..write(obj.photoUrl)
      ..writeByte(9)
      ..write(obj.preferences);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ProfileAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class UserPreferencesTypeAdapter extends TypeAdapter<UserPreferences> {
  @override
  final int typeId = 120;

  @override
  UserPreferences read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return UserPreferences(
      notifications: fields[0] == null ? false : fields[0] as bool,
      location: fields[1] == null ? false : fields[1] as bool,
      aqShares: fields[2] == null ? 0 : fields[2] as int,
    );
  }

  @override
  void write(BinaryWriter writer, UserPreferences obj) {
    writer
      ..writeByte(3)
      ..writeByte(0)
      ..write(obj.notifications)
      ..writeByte(1)
      ..write(obj.location)
      ..writeByte(2)
      ..write(obj.aqShares);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserPreferencesTypeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Profile _$ProfileFromJson(Map<String, dynamic> json) => Profile(
      title: json['title'] as String? ?? '',
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      emailAddress: json['emailAddress'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      device: json['device'] as String? ?? '',
      preferences:
          UserPreferences.fromJson(json['preferences'] as Map<String, dynamic>),
      photoUrl: json['photoUrl'] as String? ?? '',
      utcOffset: json['utcOffset'] as int? ?? 0,
    );

Map<String, dynamic> _$ProfileToJson(Profile instance) => <String, dynamic>{
      'title': instance.title,
      'firstName': instance.firstName,
      'userId': instance.userId,
      'lastName': instance.lastName,
      'emailAddress': instance.emailAddress,
      'phoneNumber': instance.phoneNumber,
      'device': instance.device,
      'utcOffset': instance.utcOffset,
      'photoUrl': instance.photoUrl,
      'preferences': instance.preferences.toJson(),
    };

UserPreferences _$UserPreferencesFromJson(Map<String, dynamic> json) =>
    UserPreferences(
      notifications: json['notifications'] as bool? ?? false,
      location: json['location'] as bool? ?? false,
      aqShares: json['aqShares'] as int? ?? 0,
    );

Map<String, dynamic> _$UserPreferencesToJson(UserPreferences instance) =>
    <String, dynamic>{
      'notifications': instance.notifications,
      'location': instance.location,
      'aqShares': instance.aqShares,
    };
