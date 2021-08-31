import 'package:json_annotation/json_annotation.dart';

import 'measurementValue.dart';

part 'historicalMeasurement.g.dart';

@JsonSerializable()
class HistoricalMeasurement {
  @JsonKey(required: true)
  final String time;

  @JsonKey(required: true, name: 'pm2_5')
  final MeasurementValue pm2_5;

  @JsonKey(required: true, name: 'pm10')
  final MeasurementValue pm10;

  @JsonKey(required: false)
  final MeasurementValue altitude;

  @JsonKey(required: false)
  final MeasurementValue speed;

  @JsonKey(required: false, name: 'externalTemperature')
  final MeasurementValue temperature;

  @JsonKey(required: false, name: 'externalHumidity')
  final MeasurementValue humidity;

  @JsonKey(required: true, name: 'device')
  final String device;

  HistoricalMeasurement(
      {required this.time,
      required this.pm2_5,
      required this.pm10,
      required this.altitude,
      required this.speed,
      required this.temperature,
      required this.humidity,
      required this.device});

  factory HistoricalMeasurement.fromJson(Map<String, dynamic> json) =>
      _$HistoricalMeasurementFromJson(json);

  double getPm10Value() {
    if (pm10.calibratedValue == -0.1) {
      return pm10.value;
    }
    return pm10.calibratedValue;
  }

  double getPm2_5Value() {
    if (pm2_5.calibratedValue == -0.1) {
      return pm2_5.value;
    }
    return pm2_5.calibratedValue;
  }

  Map<String, dynamic> toJson() => _$HistoricalMeasurementToJson(this);

  static String dbAltitude() => 'altitude';

  static String dbDevice() => 'device';

  static String dbHumidity() => 'humidity';

  static String dbPm10() => 'pm10';

  static String dbPm25() => 'pm2_5';

  static String dbSpeed() => 'speed';

  static String dbTemperature() => 'temperature';

  static String dbTime() => 'time';

  static String historicalMeasurementsDb() => 'historical_measurements';

  static String historicalMeasurementsTableCreateStmt() =>
      'CREATE TABLE IF NOT EXISTS ${historicalMeasurementsDb()}('
      'id INTEGER PRIMARY KEY, ${dbDevice()} TEXT,'
      '${dbTime()} TEXT, ${dbPm25()} REAL, '
      '${dbPm10()} REAL, ${dbAltitude()} REAL, '
      '${dbSpeed()} REAL, ${dbTemperature()} REAL, '
      '${dbHumidity()} REAL)';

  static String historicalMeasurementsTableDropStmt() =>
      'DROP TABLE IF EXISTS ${historicalMeasurementsDb()}';

  static Map<String, dynamic> mapFromDb(Map<String, dynamic> json) {
    return {
      'device': json['${dbDevice()}'] as String,
      'time': json['${dbTime()}'] as String,
      'pm2_5': {'value': json['${dbPm25()}'] as double},
      'pm10': {'value': json['${dbPm10()}'] as double},
      'externalTemperature': {'value': json['${dbTemperature()}'] as double},
      'externalHumidity': {'value': json['${dbHumidity()}'] as double},
      'speed': {'value': json['${dbSpeed()}'] as double},
      'altitude': {'value': json['${dbAltitude()}'] as double},
    };
  }

  static Map<String, dynamic> mapToDb(HistoricalMeasurement measurement) {
    return {
      '${dbTime()}': measurement.time,
      '${dbPm25()}': measurement.getPm2_5Value(),
      '${dbPm10()}': measurement.pm10.value,
      '${dbAltitude()}': measurement.altitude.value,
      '${dbSpeed()}': measurement.speed.value,
      '${dbTemperature()}': measurement.temperature.value,
      '${dbHumidity()}': measurement.humidity.value,
      '${dbDevice()}': measurement.device
    };
  }

  static HistoricalMeasurement parseMeasurement(dynamic jsonBody) {
    var measurementsForActiveDevices = <HistoricalMeasurement>[];

    var jsonArray = jsonBody['measurements'];
    for (var jsonElement in jsonArray) {
      try {
        var measurement = HistoricalMeasurement.fromJson(jsonElement);
        if (measurement.getPm2_5Value() != -0.1 &&
            measurement.getPm2_5Value() >= 0 &&
            measurement.getPm2_5Value() <= 500.4) {
          measurementsForActiveDevices.add(measurement);
        }
      } catch (e) {
        print(e);
      }
    }
    return measurementsForActiveDevices.first;
  }

  static List<HistoricalMeasurement> parseMeasurements(dynamic jsonBody) {
    var measurementsForActiveDevices = <HistoricalMeasurement>[];

    var jsonArray = jsonBody['measurements'];
    for (var jsonElement in jsonArray) {
      try {
        var measurement = HistoricalMeasurement.fromJson(jsonElement);
        if (measurement.getPm2_5Value() != -0.1 &&
            measurement.getPm2_5Value() >= 0 &&
            measurement.getPm2_5Value() <= 500.4) {
          measurementsForActiveDevices.add(measurement);
        }
      } catch (e) {
        print(e);
      }
    }
    return measurementsForActiveDevices;
  }
}

@JsonSerializable()
class HistoricalMeasurements {
  final List<HistoricalMeasurement> measurements;

  HistoricalMeasurements({
    required this.measurements,
  });

  factory HistoricalMeasurements.fromJson(Map<String, dynamic> json) =>
      _$HistoricalMeasurementsFromJson(json);

  Map<String, dynamic> toJson() => _$HistoricalMeasurementsToJson(this);
}
