// GENERATED CODE - DO NOT MODIFY BY HAND

// ignore_for_file: implicit_dynamic_parameter

part of 'place.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Geometry _$GeometryFromJson(Map<String, dynamic> json) => $checkedCreate(
      'Geometry',
      json,
      ($checkedConvert) {
        final val = Geometry(
          location: $checkedConvert(
              'location', (v) => Location.fromJson(v as Map<String, dynamic>)),
        );
        return val;
      },
    );

Location _$LocationFromJson(Map<String, dynamic> json) => $checkedCreate(
      'Location',
      json,
      ($checkedConvert) {
        final val = Location(
          lat: $checkedConvert('lat', (v) => (v as num).toDouble()),
          lng: $checkedConvert('lng', (v) => (v as num).toDouble()),
        );
        return val;
      },
    );

Place _$PlaceFromJson(Map<String, dynamic> json) => $checkedCreate(
      'Place',
      json,
      ($checkedConvert) {
        final val = Place(
          $checkedConvert(
              'geometry', (v) => Geometry.fromJson(v as Map<String, dynamic>)),
          $checkedConvert('name', (v) => v as String),
        );
        return val;
      },
    );
