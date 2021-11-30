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
      'district',
      'country',
      'name',
      'region'
    ],
  );
  return Site(
    json['_id'] as String,
    (json['latitude'] as num).toDouble(),
    (json['longitude'] as num).toDouble(),
    json['district'] as String,
    json['country'] as String,
    json['name'] as String,
    json['description'] as String? ?? '',
    json['region'] as String? ?? '',
    (json['distance'] as num?)?.toDouble() ?? 0.0,
  );
}

Sites _$SitesFromJson(Map<String, dynamic> json) => Sites(
      sites: (json['sites'] as List<dynamic>)
          .map((e) => Site.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

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
      'region': instance.region,
      'distance': instance.distance,
    };
