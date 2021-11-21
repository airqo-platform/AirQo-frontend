// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'insights_chart_data.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InsightsChartData _$InsightsChartDataFromJson(Map<String, dynamic> json) =>
    InsightsChartData(
      timeFromJson(json['time']),
      (json['value'] as num).toDouble(),
      json['pollutant'] as String,
      boolFromJson(json['available']),
      json['name'] as String,
      json['location'] as String,
      json['day'] as String,
      json['frequency'] as String,
    );

Map<String, dynamic> _$InsightsChartDataToJson(InsightsChartData instance) =>
    <String, dynamic>{
      'time': timeToJson(instance.time),
      'value': instance.value,
      'pollutant': instance.pollutant,
      'available': boolToJson(instance.available),
      'name': instance.name,
      'location': instance.location,
      'day': instance.day,
      'frequency': instance.frequency,
    };
