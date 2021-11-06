// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'historical_measurement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HistoricalMeasurement _$HistoricalMeasurementFromJson(
    Map<String, dynamic> json) {
  $checkKeys(
    json,
    requiredKeys: const [
      'time',
      'average_pm2_5',
      'average_pm10',
      'site_id',
      'device_number'
    ],
  );
  return HistoricalMeasurement(
    json['time'] as String,
    MeasurementValue.fromJson(json['average_pm2_5'] as Map<String, dynamic>),
    MeasurementValue.fromJson(json['average_pm10'] as Map<String, dynamic>),
    MeasurementValue.fromJson(json['altitude'] as Map<String, dynamic>),
    MeasurementValue.fromJson(json['speed'] as Map<String, dynamic>),
    MeasurementValue.fromJson(
        json['externalTemperature'] as Map<String, dynamic>),
    MeasurementValue.fromJson(json['externalHumidity'] as Map<String, dynamic>),
    json['site_id'] as String,
    json['device_number'] as int,
  );
}

Map<String, dynamic> _$HistoricalMeasurementToJson(
        HistoricalMeasurement instance) =>
    <String, dynamic>{
      'time': instance.time,
      'average_pm2_5': instance.pm2_5,
      'average_pm10': instance.pm10,
      'altitude': instance.altitude,
      'speed': instance.speed,
      'externalTemperature': instance.temperature,
      'externalHumidity': instance.humidity,
      'site_id': instance.siteId,
      'device_number': instance.deviceNumber,
    };
