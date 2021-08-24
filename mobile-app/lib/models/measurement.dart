import 'package:app/constants/app_constants.dart';
import 'package:app/models/site.dart';
import 'package:json_annotation/json_annotation.dart';

import 'device.dart';

part 'measurement.g.dart';

@JsonSerializable()
// @JsonSerializable(explicitToJson: true)
class Measurement {

  Measurement({required this.time, required this.pm2_5, required this.pm10,
    required this.altitude, required this.speed,
      required this.temperature, required this.humidity, required this.device});

  factory Measurement.fromJson(Map<String, dynamic> json) =>
      _$MeasurementFromJson(json);

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
  final Device device;

  Map<String, dynamic> toJson() => _$MeasurementToJson(this);

  static String dbAltitude() => 'altitude';

  static String dbDevice() => 'device';

  static String dbHumidity() => 'humidity';

  static String dbNameHistoricalMeasurements() => 'historical_measurements';

  static String dbNameLatestMeasurements() => 'latest_measurements';

  static String dbPm10() => 'pm10';

  static String dbPm25() => 'pm2_5';

  static String dbSpeed() => 'speed';

  static String dbTemperature() => 'temperature';

  static String dbTime() => 'time';

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

  static String latestMeasurementsTableDropStmt() =>
      'DROP TABLE IF EXISTS ${dbNameLatestMeasurements()}';

  static String latestMeasurementsTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${dbNameLatestMeasurements()}('
      '${dbDevice()} TEXT PRIMARY KEY, '
      '${dbTime()} TEXT, '
      '${dbPm25()} REAL, '
      '${dbPm10()} REAL, '
      '${dbAltitude()} REAL, '
      '${dbSpeed()} REAL, '
      '${dbTemperature()} REAL, '
      '${dbHumidity()} REAL)';

  static Map<String, dynamic> mapFromApi(Map<String, dynamic> json) {
    var constants = DbConstants();

    var data = <String, dynamic>{
      'time': json['created_at'] as String,
      'pm2_5': {'value': double.parse(json[constants.pm2_5])},
      'altitude': {'value': double.parse(json['altitude'])},
      'speed': {'value': double.parse(json['speed'])},
      'pm10': {'value': double.parse(json[constants.pm10])},
    };

    print(data);
    return data;
  }

  static Map<String, dynamic> mapFromDb(Map<String, dynamic> json) {
    return {
      'device': json['${dbDevice()}'] as String,
      'time': json['${dbTime()}'] as String,
      'pm2_5': {'calibratedValue': json['${dbPm25()}'] as int},
      'pm10': {'value': json['${dbPm10()}'] as int},
      'temperature': {'value': json['${dbTemperature()}'] as int},
      'humidity': {'value': json['${dbHumidity()}'] as int},
      'speed': {'value': json['${dbSpeed()}'] as int},
      'altitude': {'value': json['${dbAltitude()}'] as int},
    };
  }

  static Map<String, dynamic> mapToDb(Measurement measurement) {
    var time = measurement.time.replaceAll('T', ' ');

    if (time.contains('.')) {
      time = time.substring(0, time.indexOf('.'));
    }

    return {
      '${dbTime()}': '$time',
      '${dbDevice()}': measurement.device.name.toString(),
      '${dbPm25()}': measurement.pm2_5.calibratedValue,
      '${dbPm10()}': measurement.pm10.value,
      '${dbAltitude()}': measurement.altitude.value,
      '${dbSpeed()}': measurement.speed.value,
      '${dbTemperature()}': measurement.temperature.value,
      '${dbHumidity()}': measurement.humidity.value,
    };
  }

  static List<Measurement> parseMeasurements(dynamic jsonBody) {

    // return jsonBody
    //     .map<Measurement>((json) => Measurement.fromJson(json))
    //     .toList();

    return Measurements.fromJson(jsonBody).measurements;

  }
}

@JsonSerializable()
class Measurements {

  Measurements({
    required this.measurements,
  });

  factory Measurements.fromJson(Map<String, dynamic> json) =>
      _$MeasurementsFromJson(json);


  final List<Measurement> measurements;
  Map<String, dynamic> toJson() => _$MeasurementsToJson(this);
}

@JsonSerializable()
class MeasurementValue {

  MeasurementValue({required this.value, required this.calibratedValue});

  factory MeasurementValue.fromJson(Map<String, dynamic> json) =>
      _$MeasurementValueFromJson(json);

  @JsonKey(required: false, defaultValue: 0.1, name: 'calibratedValue')
  final double calibratedValue;

  @JsonKey(required: false, defaultValue: 0.2, name: 'value')
  final double value;

  Map<String, dynamic> toJson() => _$MeasurementValueToJson(this);
}

// @JsonSerializable()
// class MeasurementValue2 {
//   MeasurementValue2({required this.value});
//
//   factory MeasurementValue2.fromJson(Map<String, dynamic> json) =>
//       _$MeasurementValue2FromJson(json);
//
//   Map<String, dynamic> toJson() => _$MeasurementValue2ToJson(this);
//
//   @JsonKey(required: false, defaultValue: 0.0, name: 'value')
//   final double value;
// }

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
