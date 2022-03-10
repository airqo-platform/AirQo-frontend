// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'place_details.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PlaceDetails _$PlaceDetailsFromJson(Map<String, dynamic> json) => PlaceDetails(
      name: json['name'] as String,
      location: json['location'] as String,
      siteId: json['siteId'] as String,
      placeId: json['placeId'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
    );

Map<String, dynamic> _$PlaceDetailsToJson(PlaceDetails instance) =>
    <String, dynamic>{
      'name': instance.name,
      'location': instance.location,
      'siteId': instance.siteId,
      'placeId': instance.placeId,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };
