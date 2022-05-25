import 'package:app/models/site.dart';
import 'package:json_annotation/json_annotation.dart';

import 'json_parsers.dart';
import 'measurement_value.dart';

part 'measurement.g.dart';

@JsonSerializable()
class Measurement {
  factory Measurement.fromJson(Map<String, dynamic> json) =>
      _$MeasurementFromJson(json);

  Measurement(this.time, this.pm2_5, this.pm10, this.altitude, this.speed,
      this.temperature, this.humidity, this.site);
  @JsonKey(required: true)
  String time;

  @JsonKey(required: true)
  final MeasurementValue pm2_5;

  @JsonKey(required: true)
  final MeasurementValue pm10;

  @JsonKey(required: false, fromJson: measurementValueFromJson)
  final MeasurementValue altitude;

  @JsonKey(required: false, fromJson: measurementValueFromJson)
  final MeasurementValue speed;

  @JsonKey(
      required: false,
      name: 'externalTemperature',
      fromJson: measurementValueFromJson)
  final MeasurementValue temperature;

  @JsonKey(
      required: false,
      name: 'externalHumidity',
      fromJson: measurementValueFromJson)
  final MeasurementValue humidity;

  @JsonKey(required: true, name: 'siteDetails')
  final Site site;

  String getHumidityValue() {
    var humidityValue = humidity.value.round();
    if (humidity.value <= 0.99) {
      humidityValue = (humidity.value * 100).round();
    }
    return '$humidityValue%';
  }

  double getPm10Value() {
    if (pm10.calibratedValue == -0.1) {
      return double.parse(pm10.value.toStringAsFixed(2));
    }
    return double.parse(pm10.calibratedValue.toStringAsFixed(2));
  }

  double getPm2_5Value() {
    if (pm2_5.calibratedValue == -0.1) {
      return double.parse(pm2_5.value.toStringAsFixed(2));
    }
    return double.parse(pm2_5.calibratedValue.toStringAsFixed(2));
  }

  Map<String, dynamic> toJson() => _$MeasurementToJson(this);

  @override
  String toString() {
    return 'Measurement{time: $time, pm2_5: $pm2_5, pm10: $pm10,'
        ' site: $site';
  }

  static String createTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${measurementsDb()}('
      'id TEXT PRIMARY KEY, latitude REAL, '
      'name TEXT, longitude REAL, '
      'time TEXT, pm2_5 REAL, country TEXT, '
      'pm10 REAL, altitude REAL, '
      'speed REAL, temperature REAL, '
      'humidity REAL, location TEXT, '
      'region TEXT )';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${measurementsDb()}';

  static Map<String, dynamic> mapFromDb(Map<String, dynamic> json) {
    var siteDetails = Site.fromDbMap(json);

    return {
      'siteDetails': siteDetails,
      'time': json['time'] as String,
      'pm2_5': {'value': json['pm2_5'] as double},
      'pm10': {'value': json['pm10'] as double},
      'externalTemperature': {'value': json['temperature'] as double},
      'externalHumidity': {'value': json['humidity'] as double},
      'speed': {'value': json['speed'] as double},
      'altitude': {'value': json['altitude'] as double},
    };
  }

  static Map<String, dynamic> mapToDb(Measurement measurement) {
    var measurementMap = Site.toDbMap(measurement.site)
      ..addAll({
        'time': measurement.time,
        'pm2_5': measurement.getPm2_5Value(),
        'pm10': measurement.getPm10Value(),
        'altitude': measurement.altitude.value,
        'speed': measurement.speed.value,
        'temperature': measurement.temperature.value,
        'humidity': measurement.humidity.value,
      });

    return measurementMap;
  }

  static String measurementsDb() => 'measurements';
}

extension ParseMeasurement on Measurement {
  String getTempValue() {
    var tempValue = temperature.value.toStringAsFixed(2);

    return '$tempValue\u2103';
  }

  bool hasWeatherData() {
    if (humidity.value != -0.1 &&
        temperature.value != -0.1 &&
        humidity.value != 0.0 &&
        temperature.value != 0.0) {
      return true;
    }
    return false;
  }
}
