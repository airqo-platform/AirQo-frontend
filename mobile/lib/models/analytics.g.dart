// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'analytics.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AnalyticsAdapter extends TypeAdapter<Analytics> {
  @override
  final int typeId = 40;

  @override
  Analytics read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Analytics(
      id: fields[1] as String,
      site: fields[2] == null ? '' : fields[2] as String,
      name: fields[3] == null ? '' : fields[3] as String,
      location: fields[4] == null ? '' : fields[4] as String,
      createdAt: fields[7] as DateTime,
      longitude: fields[6] as double,
      latitude: fields[5] as double,
    );
  }

  @override
  void write(BinaryWriter writer, Analytics obj) {
    writer
      ..writeByte(7)
      ..writeByte(1)
      ..write(obj.id)
      ..writeByte(2)
      ..write(obj.site)
      ..writeByte(3)
      ..write(obj.name)
      ..writeByte(4)
      ..write(obj.location)
      ..writeByte(5)
      ..write(obj.latitude)
      ..writeByte(6)
      ..write(obj.longitude)
      ..writeByte(7)
      ..write(obj.createdAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AnalyticsAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Analytics _$AnalyticsFromJson(Map<String, dynamic> json) => Analytics(
      id: json['id'] as String,
      site: json['site'] as String,
      name: json['name'] as String,
      location: json['location'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      longitude: (json['longitude'] as num).toDouble(),
      latitude: (json['latitude'] as num).toDouble(),
    );

Map<String, dynamic> _$AnalyticsToJson(Analytics instance) => <String, dynamic>{
      'id': instance.id,
      'site': instance.site,
      'name': instance.name,
      'location': instance.location,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'createdAt': instance.createdAt.toIso8601String(),
    };
