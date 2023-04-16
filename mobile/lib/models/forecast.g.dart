// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'forecast.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ForecastAdapter extends TypeAdapter<Forecast> {
  @override
  final int typeId = 80;

  @override
  Forecast read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Forecast(
      siteId: fields[2] as String,
      pm2_5: fields[1] as double,
      time: fields[0] as DateTime,
      healthTips:
          fields[3] == null ? [] : (fields[3] as List).cast<HealthTip>(),
    );
  }

  @override
  void write(BinaryWriter writer, Forecast obj) {
    writer
      ..writeByte(4)
      ..writeByte(0)
      ..write(obj.time)
      ..writeByte(1)
      ..write(obj.pm2_5)
      ..writeByte(2)
      ..write(obj.siteId)
      ..writeByte(3)
      ..write(obj.healthTips);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ForecastAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Forecast _$ForecastFromJson(Map<String, dynamic> json) => Forecast(
      siteId: json['siteId'] as String? ?? '',
      pm2_5: (json['pm2_5'] as num).toDouble(),
      time: DateTime.parse(json['time'] as String),
      healthTips: (json['healthTips'] as List<dynamic>)
          .map((e) => HealthTip.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
