// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'measurement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Measurement _$MeasurementFromJson(Map<String, dynamic> json) {
  $checkKeys(json,
      requiredKeys: const ['time', 'pm2_5', 'pm10', 'siteDetails']);
  return Measurement(
    time: json['time'] as String,
    pm2_5: MeasurementValue.fromJson(json['pm2_5'] as Map<String, dynamic>),
    pm10: MeasurementValue.fromJson(json['pm10'] as Map<String, dynamic>),
    altitude:
        MeasurementValue.fromJson(json['altitude'] as Map<String, dynamic>),
    speed: MeasurementValue.fromJson(json['speed'] as Map<String, dynamic>),
    temperature: MeasurementValue.fromJson(
        json['externalTemperature'] as Map<String, dynamic>),
    humidity: MeasurementValue.fromJson(
        json['externalHumidity'] as Map<String, dynamic>),
    site: Site.fromJson(json['siteDetails'] as Map<String, dynamic>),
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
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
      'altitude': instance.altitude,
      'speed': instance.speed,
      'externalTemperature': instance.temperature,
      'externalHumidity': instance.humidity,
      'siteDetails': instance.site,
    };
