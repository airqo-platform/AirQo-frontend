// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'favourite_place.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class FavouritePlaceAdapter extends TypeAdapter<FavouritePlace> {
  @override
  final int typeId = 60;

  @override
  FavouritePlace read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return FavouritePlace(
      name: fields[0] as String,
      location: fields[1] as String,
      referenceSite: fields[2] as String,
      placeId: fields[3] as String,
      latitude: fields[4] as double,
      longitude: fields[5] as double,
    );
  }

  @override
  void write(BinaryWriter writer, FavouritePlace obj) {
    writer
      ..writeByte(6)
      ..writeByte(0)
      ..write(obj.name)
      ..writeByte(1)
      ..write(obj.location)
      ..writeByte(2)
      ..write(obj.referenceSite)
      ..writeByte(3)
      ..write(obj.placeId)
      ..writeByte(4)
      ..write(obj.latitude)
      ..writeByte(5)
      ..write(obj.longitude);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FavouritePlaceAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FavouritePlace _$FavouritePlaceFromJson(Map<String, dynamic> json) =>
    FavouritePlace(
      name: json['name'] as String? ?? '',
      location: json['location'] as String? ?? '',
      referenceSite: json['referenceSite'] as String? ?? '',
      placeId: json['placeId'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
    );

Map<String, dynamic> _$FavouritePlaceToJson(FavouritePlace instance) =>
    <String, dynamic>{
      'name': instance.name,
      'location': instance.location,
      'referenceSite': instance.referenceSite,
      'placeId': instance.placeId,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };
