// GENERATED CODE - DO NOT MODIFY BY HAND

// ignore_for_file: implicit_dynamic_parameter

part of 'measurement_value.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MeasurementValue _$MeasurementValueFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'MeasurementValue',
      json,
      ($checkedConvert) {
        final val = MeasurementValue(
          value: $checkedConvert('value', (v) => (v as num).toDouble()),
          calibratedValue: $checkedConvert(
              'calibratedValue', (v) => (v as num?)?.toDouble()),
        );
        return val;
      },
    );
