// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'measurement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

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

Measurement _$MeasurementFromJson(Map<String, dynamic> json) {
  $checkKeys(json, requiredKeys: const [
    'time',
    'pm2_5',
    's2_pm2_5',
    's2_pm10',
    'deviceDetails'
  ]);
  return Measurement(
    device: Device.fromJson(json['deviceDetails'] as Map<String, dynamic>),
    deviceNumber: json['deviceNumber'] as int,
    time: json['time'] as String,
    pm2_5: MeasurementValue.fromJson(json['pm2_5'] as Map<String, dynamic>),
    pm10: MeasurementValue.fromJson(json['pm10'] as Map<String, dynamic>),
    s2Pm2_5:
        MeasurementValue.fromJson(json['s2_pm2_5'] as Map<String, dynamic>),
    s2Pm10: MeasurementValue.fromJson(json['s2_pm10'] as Map<String, dynamic>),
    externalTemperature: MeasurementValue.fromJson(
        json['externalTemperature'] as Map<String, dynamic>),
    externalHumidity: MeasurementValue.fromJson(
        json['externalHumidity'] as Map<String, dynamic>),
  );
}

Map<String, dynamic> _$MeasurementToJson(Measurement instance) =>
    <String, dynamic>{
      'deviceNumber': instance.deviceNumber,
      'time': instance.time,
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
      's2_pm2_5': instance.s2Pm2_5,
      's2_pm10': instance.s2Pm10,
      'externalTemperature': instance.externalTemperature,
      'externalHumidity': instance.externalHumidity,
      'deviceDetails': instance.device,
    };

MeasurementValue _$MeasurementValueFromJson(Map<String, dynamic> json) {
  return MeasurementValue(
    (json['calibratedValue'] as num?)?.toDouble() ?? 0.0,
    value: (json['value'] as num?)?.toDouble() ?? 0.0,
  );
}

Map<String, dynamic> _$MeasurementValueToJson(MeasurementValue instance) =>
    <String, dynamic>{
      'value': instance.value,
      'calibratedValue': instance.calibratedValue,
    };
