// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'location_history.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

LocationHistory _$LocationHistoryFromJson(Map<String, dynamic> json) =>
    LocationHistory(
      placeId: json['place_id'] as String,
      site: json['site_id'] as String,
      name: json['name'] as String,
      location: json['location'] as String,
      dateTime: DateTime.parse(json['date_time'] as String),
      longitude: (json['longitude'] as num).toDouble(),
      latitude: (json['latitude'] as num).toDouble(),
    );

Map<String, dynamic> _$LocationHistoryToJson(LocationHistory instance) =>
    <String, dynamic>{
      'place_id': instance.placeId,
      'site_id': instance.site,
      'name': instance.name,
      'location': instance.location,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'date_time': instance.dateTime.toIso8601String(),
    };

LocationHistoryList _$LocationHistoryListFromJson(Map<String, dynamic> json) =>
    LocationHistoryList(
      data: (json['data'] as List<dynamic>)
          .map((e) => LocationHistory.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$LocationHistoryListToJson(
        LocationHistoryList instance) =>
    <String, dynamic>{
      'data': instance.data.map((e) => e.toJson()).toList(),
    };
