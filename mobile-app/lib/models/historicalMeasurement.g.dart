// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'historicalMeasurement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HistoricalMeasurement _$HistoricalMeasurementFromJson(
    Map<String, dynamic> json) {
  $checkKeys(json, requiredKeys: const ['time', 'pm2_5', 'device']);
  return HistoricalMeasurement(
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
    device: json['device'] as String,
  );
}

Map<String, dynamic> _$HistoricalMeasurementToJson(
        HistoricalMeasurement instance) =>
    <String, dynamic>{
      'time': instance.time,
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
      'altitude': instance.altitude,
      'speed': instance.speed,
      'externalTemperature': instance.temperature,
      'externalHumidity': instance.humidity,
      'device': instance.device,
    };

HistoricalMeasurements _$HistoricalMeasurementsFromJson(
    Map<String, dynamic> json) {
  return HistoricalMeasurements(
    measurements: (json['measurements'] as List<dynamic>)
        .map((e) => HistoricalMeasurement.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

Map<String, dynamic> _$HistoricalMeasurementsToJson(
        HistoricalMeasurements instance) =>
    <String, dynamic>{
      'measurements': instance.measurements,
    };
