// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'measurement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Measurement _$MeasurementFromJson(Map<String, dynamic> json) {
  $checkKeys(json, requiredKeys: const [
    'time',
    'average_pm2_5',
    'average_pm10',
    'siteDetails',
    'device_number'
  ]);
  return Measurement(
    json['time'] as String,
    MeasurementValue.fromJson(json['average_pm2_5'] as Map<String, dynamic>),
    MeasurementValue.fromJson(json['average_pm10'] as Map<String, dynamic>),
    MeasurementValue.fromJson(json['altitude'] as Map<String, dynamic>),
    MeasurementValue.fromJson(json['speed'] as Map<String, dynamic>),
    MeasurementValue.fromJson(
        json['externalTemperature'] as Map<String, dynamic>),
    MeasurementValue.fromJson(json['externalHumidity'] as Map<String, dynamic>),
    Site.fromJson(json['siteDetails'] as Map<String, dynamic>),
    json['device_number'] as int,
  );
}

Measurements _$MeasurementsFromJson(Map<String, dynamic> json) {
  return Measurements(
    measurements: (json['measurements'] as List<dynamic>)
        .map((e) => Measurement.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

Map<String, dynamic> _$MeasurementsToJson(Measurements instance) =>
    <String, dynamic>{
      'measurements': instance.measurements,
    };

Map<String, dynamic> _$MeasurementToJson(Measurement instance) =>
    <String, dynamic>{
      'time': instance.time,
      'average_pm2_5': instance.pm2_5,
      'average_pm10': instance.pm10,
      'altitude': instance.altitude,
      'speed': instance.speed,
      'externalTemperature': instance.temperature,
      'externalHumidity': instance.humidity,
      'siteDetails': instance.site,
      'device_number': instance.deviceNumber,
    };
