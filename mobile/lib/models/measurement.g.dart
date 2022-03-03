// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'measurement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Measurement _$MeasurementFromJson(Map<String, dynamic> json) {
  $checkKeys(
    json,
    requiredKeys: const ['time', 'pm2_5', 'pm10', 'siteDetails'],
  );
  return Measurement(
    json['time'] as String,
    MeasurementValue.fromJson(json['pm2_5'] as Map<String, dynamic>),
    MeasurementValue.fromJson(json['pm10'] as Map<String, dynamic>),
    measurementValueFromJson(json['altitude']),
    measurementValueFromJson(json['speed']),
    measurementValueFromJson(json['externalTemperature']),
    measurementValueFromJson(json['externalHumidity']),
    Site.fromJson(json['siteDetails'] as Map<String, dynamic>),
  );
}

Map<String, dynamic> _$MeasurementToJson(Measurement instance) =>
    <String, dynamic>{
      'time': instance.time,
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
      'altitude': instance.altitude,
      'speed': instance.speed,
      'externalTemperature': instance.temperature,
      'externalHumidity': instance.humidity,
      'siteDetails': instance.site,
    };
