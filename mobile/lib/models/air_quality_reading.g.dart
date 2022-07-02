// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'air_quality_reading.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AirQualityReadingAdapter extends TypeAdapter<AirQualityReading> {
  @override
  final int typeId = 50;

  @override
  AirQualityReading read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return AirQualityReading(
      referenceSite: fields[0] as String,
      source: fields[5] as String,
      latitude: fields[1] as double,
      longitude: fields[2] as double,
      country: fields[3] as String,
      name: fields[4] as String,
      location: fields[6] as String,
      region: fields[7] as Region,
      dateTime: fields[8] as DateTime,
      pm2_5: fields[9] as double,
      pm10: fields[10] as double,
      distanceToReferenceSite: fields[11] as double,
      placeId: fields[12] as String,
    );
  }

  @override
  void write(BinaryWriter writer, AirQualityReading obj) {
    writer
      ..writeByte(13)
      ..writeByte(0)
      ..write(obj.referenceSite)
      ..writeByte(1)
      ..write(obj.latitude)
      ..writeByte(2)
      ..write(obj.longitude)
      ..writeByte(3)
      ..write(obj.country)
      ..writeByte(4)
      ..write(obj.name)
      ..writeByte(5)
      ..write(obj.source)
      ..writeByte(6)
      ..write(obj.location)
      ..writeByte(7)
      ..write(obj.region)
      ..writeByte(8)
      ..write(obj.dateTime)
      ..writeByte(9)
      ..write(obj.pm2_5)
      ..writeByte(10)
      ..write(obj.pm10)
      ..writeByte(11)
      ..write(obj.distanceToReferenceSite)
      ..writeByte(12)
      ..write(obj.placeId);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AirQualityReadingAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AirQualityReading _$AirQualityReadingFromJson(Map<String, dynamic> json) =>
    AirQualityReading(
      referenceSite: json['referenceSite'] as String? ?? '',
      source: json['source'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      country: json['country'] as String? ?? '',
      name: json['name'] as String? ?? '',
      location: json['location'] as String? ?? '',
      region: const RegionConverter().fromJson(json['region'] as String),
      dateTime: DateTime.parse(json['dateTime'] as String),
      pm2_5: (json['pm2_5'] as num?)?.toDouble() ?? 0.0,
      pm10: (json['pm10'] as num?)?.toDouble() ?? 0.0,
      distanceToReferenceSite:
          (json['distanceToReferenceSite'] as num?)?.toDouble() ?? 0.0,
      placeId: json['placeId'] as String? ?? '',
    );

Map<String, dynamic> _$AirQualityReadingToJson(AirQualityReading instance) =>
    <String, dynamic>{
      'referenceSite': instance.referenceSite,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'country': instance.country,
      'name': instance.name,
      'source': instance.source,
      'location': instance.location,
      'region': const RegionConverter().toJson(instance.region),
      'dateTime': instance.dateTime.toIso8601String(),
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
      'distanceToReferenceSite': instance.distanceToReferenceSite,
      'placeId': instance.placeId,
    };
