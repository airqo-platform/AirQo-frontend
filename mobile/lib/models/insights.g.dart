// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'insights.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Insights _$InsightsFromJson(Map<String, dynamic> json) => Insights(
      DateTime.parse(json['time'] as String),
      (json['pm2_5'] as num).toDouble(),
      (json['pm10'] as num).toDouble(),
      boolFromJson(json['empty']),
      boolFromJson(json['forecast']),
      json['siteId'] as String,
      frequencyFromJson(json['frequency'] as String),
    );

Map<String, dynamic> _$InsightsToJson(Insights instance) => <String, dynamic>{
      'time': instance.time.toIso8601String(),
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
      'empty': boolToJson(instance.empty),
      'forecast': boolToJson(instance.forecast),
      'siteId': instance.siteId,
      'frequency': instance.frequency,
    };
