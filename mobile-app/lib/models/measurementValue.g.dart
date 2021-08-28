// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'measurementValue.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MeasurementValue _$MeasurementValueFromJson(Map<String, dynamic> json) {
  return MeasurementValue(
    value: (json['value'] as num?)?.toDouble() ?? -0.1,
    calibratedValue: (json['calibratedValue'] as num?)?.toDouble() ?? -0.1,
  );
}

Map<String, dynamic> _$MeasurementValueToJson(MeasurementValue instance) =>
    <String, dynamic>{
      'calibratedValue': instance.calibratedValue,
      'value': instance.value,
    };
