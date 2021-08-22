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

@JsonSerializable(explicitToJson: true)
class Measurement {
  Measurement({
    required this.device,
    required this.time,
    required this.pm2_5,
    required this.pm10,
    required this.altitude,
    required this.speed,
    required this.temperature,
    required this.humidity,
  });

  static String dbNameLatestMeasurements() => 'latest_measurements';
  static String dbNameHistoricalMeasurements() => 'historical_measurements';

  static String dbDevice() => 'device';
  static String dbPm25() => 'pm2_5';
  static String dbTime() => 'time';
  static String dbPm10() => 'pm10';
  static String dbAltitude() => 'altitude';
  static String dbSpeed() => 'speed';
  static String dbTemperature() => 'temperature';
  static String dbHumidity() => 'humidity';


  static String latestMeasurementsTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${dbNameLatestMeasurements()}('
          '${dbDevice()} TEXT PRIMARY KEY, '
          '${dbTime()} TEXT, '
          '${dbPm25()} TEXT, '
          '${dbPm10()} TEXT, '
          '${dbAltitude()} TEXT, '
          '${dbSpeed()} TEXT, '
          '${dbTemperature()} TEXT, '
          '${dbHumidity()} TEXT)';

  static String latestMeasurementsTableDropStmt() =>
      'DROP TABLE IF EXISTS ${dbNameLatestMeasurements()}';

  static String historicalMeasurementsTableStmt() =>
      'CREATE TABLE IF NOT EXISTS historical_measurements ('
          'id INTEGER PRIMARY KEY, '
          'device_name not null,'
          'time not null, '
          'pm2_5 not null, '
          'pm10 not null, '
          'altitude not null, '
          'speed not null, '
          'temperature not null, '
          'humidity not null)';

  static String forecastDataTableStmt() =>
      'CREATE TABLE IF NOT EXISTS forecast_data ('
          'id INTEGER PRIMARY KEY, '
          'device_name not null,'
          'time not null, '
          'pm2_5 not null, '
          'pm10 null, '
          'altitude null, '
          'speed null, '
          'temperature null, '
          'humidity null)';

  factory Measurement.fromJson(Map<String, dynamic> json) =>
      _$MeasurementFromJson(json);

  Map<String, dynamic> toJson() => _$MeasurementToJson(this);

  static Map<String, dynamic> mapToDb(Measurement measurement) {
    var time = measurement.time.replaceAll('T', ' ');

    if (time.contains('.')) {
      time = time.substring(0, time.indexOf('.'));
    }

    return {
      '${dbTime()}': '$time',
      '${dbDevice()}': measurement.device.name.toString(),
      '${dbPm25()}': measurement.pm2_5.value.toString(),
      '${dbPm10()}': measurement.pm10.value.toString(),
      '${dbAltitude()}': measurement.altitude.value.toString(),
      '${dbSpeed()}': measurement.speed.value.toString(),
      '${dbTemperature()}': measurement.temperature.value.toString(),
      '${dbHumidity()}': measurement.humidity.value.toString(),
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

  @JsonKey(required: true)
  final String time;

  @JsonKey(required: true)
  final MeasurementValue pm2_5;

  @JsonKey(required: false)
  final MeasurementValue pm10;

  @JsonKey(required: false)
  final MeasurementValue altitude;

  @JsonKey(required: false)
  final MeasurementValue speed;

  @JsonKey(required: false, name: 'externalTemperature')
  final MeasurementValue temperature;

  @JsonKey(required: false, name: 'externalHumidity')
  final MeasurementValue humidity;

  @JsonKey(required: true, name: 'deviceDetails')
  Device device;

}

@JsonSerializable(explicitToJson: true)
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
