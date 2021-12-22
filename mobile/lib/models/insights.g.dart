// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'insights.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Insights _$InsightsFromJson(Map<String, dynamic> json) => Insights(
      timeFromJson(json['time']),
      (json['pm2_5'] as num).toDouble(),
      (json['pm10'] as num).toDouble(),
      boolFromJson(json['isEmpty']),
      boolFromJson(json['isForecast']),
      json['name'] as String,
      json['siteId'] as String,
      json['location'] as String,
      json['frequency'] as String,
    );

Map<String, dynamic> _$InsightsToJson(Insights instance) => <String, dynamic>{
      'time': timeToJson(instance.time),
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
      'isEmpty': boolToJson(instance.isEmpty),
      'isForecast': boolToJson(instance.isForecast),
      'name': instance.name,
      'siteId': instance.siteId,
      'location': instance.location,
      'frequency': instance.frequency,
    };
