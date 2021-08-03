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
  $checkKeys(json, requiredKeys: const ['time', 'pm2_5', 'deviceDetails']);
  return Measurement(
    locationDetails:
        Device.fromJson(json['deviceDetails'] as Map<String, dynamic>),
    channelID: json['channelID'] as int,
    time: json['time'] as String,
    pm2_5: Value.fromJson(json['pm2_5'] as Map<String, dynamic>),
    pm10: Value.fromJson(json['pm10'] as Map<String, dynamic>),
    s2_pm2_5: Value.fromJson(json['s2_pm2_5'] as Map<String, dynamic>),
    s2_pm10: Value.fromJson(json['s2_pm10'] as Map<String, dynamic>),
  );
}

Map<String, dynamic> _$MeasurementToJson(Measurement instance) =>
    <String, dynamic>{
      'channelID': instance.channelID,
      'time': instance.time,
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
      's2_pm2_5': instance.s2_pm2_5,
      's2_pm10': instance.s2_pm10,
      'deviceDetails': instance.locationDetails,
    };

Value _$ValueFromJson(Map<String, dynamic> json) {
  return Value(
    value: (json['value'] as num).toDouble(),
  );
}

Map<String, dynamic> _$ValueToJson(Value instance) => <String, dynamic>{
      'value': instance.value,
    };
