// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'favourite_place.dart';

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

FavouritePlaceList _$FavouritePlaceListFromJson(Map<String, dynamic> json) =>
    FavouritePlaceList(
      data: (json['data'] as List<dynamic>)
          .map((e) => FavouritePlace.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$FavouritePlaceListToJson(FavouritePlaceList instance) =>
    <String, dynamic>{
      'data': instance.data.map((e) => e.toJson()).toList(),
    };
