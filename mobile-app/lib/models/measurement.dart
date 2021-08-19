import 'dart:convert';

import 'package:app/constants/app_constants.dart';
import 'package:flutter/foundation.dart';
import 'package:json_annotation/json_annotation.dart';

import 'device.dart';

part 'measurement.g.dart';

@JsonSerializable()
class Measurements {
  Measurements({
    required this.measurements,
  });

  factory Measurements.fromJson(Map<String, dynamic> json) =>
      _$MeasurementsFromJson(json);

  Map<String, dynamic> toJson() => _$MeasurementsToJson(this);

  final List<Measurement> measurements;
}

@JsonSerializable()
class Measurement {
  Measurement({
    required this.device,
    required this.deviceNumber,
    required this.time,
    required this.pm2_5,
    required this.pm10,
    required this.s2Pm2_5,
    required this.s2Pm10,
    // required this.altitude,
    // required this.speed,
    required this.externalTemperature,
    required this.externalHumidity,
    // required this.frequency
  });

  factory Measurement.fromJson(Map<String, dynamic> json) =>
      _$MeasurementFromJson(json);

  Map<String, dynamic> toJson() => _$MeasurementToJson(this);

  static Map<String, dynamic> mapToDb(Measurement measurement) {
    var constants = DbConstants();

    var time = measurement.time.replaceAll('T', ' ');

    if (time.contains('.')) {
      time = time.substring(0, time.indexOf('.'));
    }

    return {
      constants.channelID: measurement.deviceNumber,
      constants.time: time,
      constants.pm2_5: measurement.pm2_5.value,
      constants.s2_pm2_5: measurement.s2Pm2_5.value,
      constants.s2_pm10: measurement.s2Pm10.value,
      constants.pm10: measurement.pm10.value,
      constants.locationDetails: measurement.device.channelID,
    };
  }

  static Map<String, dynamic> mapFromDb(Map<String, dynamic> json) {
    var constants = DbConstants();

    return {
      'deviceDetails': json[constants.locationDetails] as int,
      'channelID': json[constants.channelID] as int,
      'time': json[constants.time] as String,
      'pm2_5': {'value': json[constants.pm2_5]},
      's2_pm2_5': {'value': json[constants.s2_pm2_5]},
      's2_pm10': {'value': json[constants.s2_pm10]},
      'pm10': {'value': json[constants.pm10]},
    };
  }

  static Map<String, dynamic> mapFromApi(Map<String, dynamic> json) {
    var constants = DbConstants();

    var data = <String, dynamic>{
      'time': json['created_at'] as String,
      'pm2_5': {'value': double.parse(json[constants.pm2_5])},
      's2_pm2_5': {'value': double.parse(json[constants.s2_pm2_5])},
      's2_pm10': {'value': double.parse(json[constants.s2_pm10])},
      'pm10': {'value': double.parse(json[constants.pm10])},
    };

    print(data);
    return data;
  }

  static List<Measurement> parseMeasurements(dynamic jsonBody) {

    // var measurements = <Measurement>[];
    // for (var element in jsonBody) {
    //   var measurement = Measurement.fromJson(element);
    //   measurements.add(measurement);
    // }
    // return measurements;

    return jsonBody.map<Measurement>((json) =>
        Measurement.fromJson(json)).toList();
  }

  @JsonKey(required: false)
  int deviceNumber;

  // @JsonKey(required: false)
  // final String device;

  @JsonKey(required: true)
  final String time;

  @JsonKey(required: true)
  final MeasurementValue pm2_5;

  @JsonKey(required: false)
  final MeasurementValue pm10;

  @JsonKey(required: true, name: 's2_pm2_5')
  final MeasurementValue s2Pm2_5;

  @JsonKey(required: true, name: 's2_pm10')
  final MeasurementValue s2Pm10;

  @JsonKey(required: false)
  final MeasurementValue externalTemperature;

  @JsonKey(required: false)
  final MeasurementValue externalHumidity;

  @JsonKey(required: true, name: 'deviceDetails')
  Device device;

  void setChannelId(int id) {
    deviceNumber = id;
  }
}

@JsonSerializable()
class MeasurementValue {
  MeasurementValue(this.calibratedValue, {required this.value});

  factory MeasurementValue.fromJson(Map<String, dynamic> json) =>
      _$MeasurementValueFromJson(json);

  Map<String, dynamic> toJson() => _$MeasurementValueToJson(this);

  @JsonKey(required: false, defaultValue: 0.0)
  final double value;

  @JsonKey(required: false, defaultValue: 0.0)
  final double calibratedValue;
}

// @JsonSerializable()
// class Coordinates {
//   Coordinates({
//     required this.latitude,
//     required this.longitude
//   });
//
//
//   factory Coordinates.fromJson(Map<String, dynamic> json) =>
//       _$LocationFromJson(json);
//   Map<String, dynamic> toJson() => _$LocationToJson(this);
//
//
//   final Value latitude;
//   final Value longitude;
//
//
// }
