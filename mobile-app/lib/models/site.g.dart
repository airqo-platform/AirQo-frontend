// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'site.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

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

Site _$SiteFromJson(Map<String, dynamic> json) {
  $checkKeys(json, requiredKeys: const [
    'lat_long',
    'latitude',
    'longitude',
    'district',
    'country'
  ]);
  return Site(
    json['favourite'] as bool? ?? false,
    id: json['lat_long'] as String,
    latitude: (json['latitude'] as num).toDouble(),
    longitude: (json['longitude'] as num).toDouble(),
    district: json['district'] as String,
    country: json['country'] as String,
    description: json['description'] as String? ?? '',
    nickName: json['nickName'] as String? ?? '',
    distance: (json['distance'] as num?)?.toDouble() ?? 0.0,
  );
}

Map<String, dynamic> _$SiteToJson(Site instance) => <String, dynamic>{
      'lat_long': instance.id,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'district': instance.district,
      'country': instance.country,
      'description': instance.description,
      'nickName': instance.nickName,
      'favourite': instance.favourite,
      'distance': instance.distance,
    };
