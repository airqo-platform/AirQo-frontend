// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'air_quality_reading.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AirQualityReadingAdapter extends TypeAdapter<AirQualityReading> {
  @override
  final int typeId = 52;

  @override
  AirQualityReading read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return AirQualityReading(
      referenceSite: fields[0] == null ? '' : fields[0] as String,
      source: fields[5] == null ? '' : fields[5] as String,
      latitude: fields[1] as double,
      longitude: fields[2] as double,
      country: fields[3] == null ? '' : fields[3] as String,
      name: fields[4] == null ? '' : fields[4] as String,
      location: fields[6] == null ? '' : fields[6] as String,
      region: fields[13] == null ? '' : fields[13] as String,
      dateTime: fields[8] as DateTime,
      pm2_5: fields[9] == null ? 0.0 : fields[9] as double,
      pm10: fields[10] == null ? 0.0 : fields[10] as double,
      distanceToReferenceSite: fields[11] == null ? 0.0 : fields[11] as double,
      placeId: fields[12] == null ? '' : fields[12] as String,
      shareLink: fields[14] == null ? '' : fields[14] as String,
    );
  }

  @override
  void write(BinaryWriter writer, AirQualityReading obj) {
    writer
      ..writeByte(14)
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
      ..writeByte(8)
      ..write(obj.dateTime)
      ..writeByte(9)
      ..write(obj.pm2_5)
      ..writeByte(10)
      ..write(obj.pm10)
      ..writeByte(11)
      ..write(obj.distanceToReferenceSite)
      ..writeByte(12)
      ..write(obj.placeId)
      ..writeByte(13)
      ..write(obj.region)
      ..writeByte(14)
      ..write(obj.shareLink);
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

PollutantValue _$PollutantValueFromJson(Map<String, dynamic> json) =>
    PollutantValue(
      value: PollutantValue._valueFromJson(json['value'] as double),
      calibratedValue:
          PollutantValue._valueFromJson(json['calibratedValue'] as double),
    );
