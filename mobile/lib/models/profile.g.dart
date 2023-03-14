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
      photoUrl: fields[8] == null ? '' : fields[8] as String,
      utcOffset: fields[7] == null ? 0 : fields[7] as int,
      notifications: fields[9] == null ? false : fields[9] as bool,
      location: fields[10] == null ? false : fields[10] as bool,
      aqShares: fields[11] == null ? 0 : fields[11] as int,
      isAnonymous: fields[12] == null ? false : fields[12] as bool,
      isSignedIn: fields[13] == null ? false : fields[13] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, Profile obj) {
    writer
      ..writeByte(14)
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
      ..write(obj.notifications)
      ..writeByte(10)
      ..write(obj.location)
      ..writeByte(11)
      ..write(obj.aqShares)
      ..writeByte(12)
      ..write(obj.isAnonymous)
      ..writeByte(13)
      ..write(obj.isSignedIn);
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
      photoUrl: json['photoUrl'] as String? ?? '',
      utcOffset: json['utcOffset'] as int? ?? 0,
      notifications: json['notifications'] as bool? ?? false,
      location: json['location'] as bool? ?? false,
      aqShares: json['aqShares'] as int? ?? 0,
      isAnonymous: json['isAnonymous'] as bool? ?? false,
      isSignedIn: json['isSignedIn'] as bool? ?? false,
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
      'notifications': instance.notifications,
      'location': instance.location,
      'aqShares': instance.aqShares,
      'isAnonymous': instance.isAnonymous,
      'isSignedIn': instance.isSignedIn,
    };
