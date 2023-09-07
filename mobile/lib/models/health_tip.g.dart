// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'health_tip.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class HealthTipAdapter extends TypeAdapter<HealthTip> {
  @override
  final int typeId = 60;

  @override
  HealthTip read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return HealthTip(
      title: fields[0] as String,
      description: fields[1] as String,
      image: fields[2] as String,
    );
  }

  @override
  void write(BinaryWriter writer, HealthTip obj) {
    writer
      ..writeByte(3)
      ..writeByte(0)
      ..write(obj.title)
      ..writeByte(1)
      ..write(obj.description)
      ..writeByte(2)
      ..write(obj.image);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HealthTipAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HealthTip _$HealthTipFromJson(Map<String, dynamic> json) => HealthTip(
      title: json['title'] as String,
      description: json['description'] as String,
      image: json['image'] as String,
    );

Map<String, dynamic> _$HealthTipToJson(HealthTip instance) => <String, dynamic>{
      'title': instance.title,
      'description': instance.description,
      'image': instance.image,
    };
