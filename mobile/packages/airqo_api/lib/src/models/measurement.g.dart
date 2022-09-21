// GENERATED CODE - DO NOT MODIFY BY HAND

// ignore_for_file: implicit_dynamic_parameter

part of 'measurement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Measurement _$MeasurementFromJson(Map<String, dynamic> json) => $checkedCreate(
      'Measurement',
      json,
      ($checkedConvert) {
        final val = Measurement(
          dateTime: $checkedConvert('time', (v) => DateTime.parse(v as String)),
          pm2_5: $checkedConvert('pm2_5',
              (v) => MeasurementValue.fromJson(v as Map<String, dynamic>)),
          pm10: $checkedConvert('pm10',
              (v) => MeasurementValue.fromJson(v as Map<String, dynamic>)),
          site: $checkedConvert(
              'siteDetails', (v) => Site.fromJson(v as Map<String, dynamic>)),
        );
        return val;
      },
      fieldKeyMap: const {'dateTime': 'time', 'site': 'siteDetails'},
    );
