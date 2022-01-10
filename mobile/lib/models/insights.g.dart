// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'insights.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Insights _$InsightsFromJson(Map<String, dynamic> json) => Insights(
      timeFromJson(json['time']),
      (json['pm2_5'] as num).toDouble(),
      (json['pm10'] as num).toDouble(),
      boolFromJson(json['empty']),
      boolFromJson(json['forecast']),
      json['siteId'] as String,
      frequencyFromJson(json['frequency'] as String),
    );

Map<String, dynamic> _$InsightsToJson(Insights instance) => <String, dynamic>{
      'time': timeToJson(instance.time),
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
      'empty': boolToJson(instance.empty),
      'forecast': boolToJson(instance.forecast),
      'siteId': instance.siteId,
      'frequency': instance.frequency,
    };
