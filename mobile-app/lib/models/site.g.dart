// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'site.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Site _$SiteFromJson(Map<String, dynamic> json) {
  $checkKeys(json, requiredKeys: const [
    '_id',
    'latitude',
    'longitude',
    'district',
    'country',
    'name'
  ]);
  return Site(
    json['name'] as String,
    id: json['_id'] as String,
    latitude: (json['latitude'] as num).toDouble(),
    longitude: (json['longitude'] as num).toDouble(),
    district: json['district'] as String,
    country: json['country'] as String,
    description: json['description'] as String? ?? '',
    distance: (json['distance'] as num?)?.toDouble() ?? 0.0,
  );
}

Sites _$SitesFromJson(Map<String, dynamic> json) {
  return Sites(
    sites: (json['sites'] as List<dynamic>)
        .map((e) => Site.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

Map<String, dynamic> _$SitesToJson(Sites instance) => <String, dynamic>{
      'sites': instance.sites,
    };

Map<String, dynamic> _$SiteToJson(Site instance) => <String, dynamic>{
      '_id': instance.id,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'district': instance.district,
      'country': instance.country,
      'name': instance.name,
      'description': instance.description,
      'distance': instance.distance,
    };
