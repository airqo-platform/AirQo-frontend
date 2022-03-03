// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'site.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Site _$SiteFromJson(Map<String, dynamic> json) {
  $checkKeys(
    json,
    requiredKeys: const [
      '_id',
      'latitude',
      'longitude',
      'country',
      'search_name',
      'location_name',
      'region'
    ],
  );
  return Site(
    id: json['_id'] as String,
    latitude: (json['latitude'] as num).toDouble(),
    longitude: (json['longitude'] as num).toDouble(),
    country: json['country'] as String,
    name: json['search_name'] as String,
    location: json['location_name'] as String,
    region: json['region'] == null ? '' : regionFromJson(json['region']),
    distance: (json['distance'] as num?)?.toDouble() ?? 0.0,
  );
}

Map<String, dynamic> _$SiteToJson(Site instance) => <String, dynamic>{
      '_id': instance.id,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'country': instance.country,
      'search_name': instance.name,
      'location_name': instance.location,
      'region': instance.region,
      'distance': instance.distance,
    };
