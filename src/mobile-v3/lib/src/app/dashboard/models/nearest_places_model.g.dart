// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'nearest_places_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

NearestSiteModel _$NearestSiteModelFromJson(Map<String, dynamic> json) =>
    NearestSiteModel(
      id: json['_id'] as String,
      name: json['name'] as String,
      longitude: (json['longitude'] as num).toDouble(),
      latitude: (json['latitude'] as num).toDouble(),
      distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? 0.0,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$NearestSiteModelToJson(NearestSiteModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'longitude': instance.longitude,
      'latitude': instance.latitude,
      'distanceKm': instance.distanceKm,
      'metadata': instance.metadata,
    };

RecentMeasurementModel _$RecentMeasurementModelFromJson(
        Map<String, dynamic> json) =>
    RecentMeasurementModel(
      siteId: json['site_id'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      readings: json['readings'] as Map<String, dynamic>,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$RecentMeasurementModelToJson(
        RecentMeasurementModel instance) =>
    <String, dynamic>{
      'site_id': instance.siteId,
      'timestamp': instance.timestamp.toIso8601String(),
      'readings': instance.readings,
      'metadata': instance.metadata,
    };

NearestPlacesResponseModel _$NearestPlacesResponseModelFromJson(
        Map<String, dynamic> json) =>
    NearestPlacesResponseModel(
      sites: (json['sites'] as List<dynamic>)
          .map((e) => NearestSiteModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      measurements: (json['measurements'] as List<dynamic>)
          .map(
              (e) => RecentMeasurementModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$NearestPlacesResponseModelToJson(
        NearestPlacesResponseModel instance) =>
    <String, dynamic>{
      'sites': instance.sites,
      'measurements': instance.measurements,
      'metadata': instance.metadata,
    };
