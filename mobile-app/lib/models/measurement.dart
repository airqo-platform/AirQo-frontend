import 'package:json_annotation/json_annotation.dart';

import 'device.dart';
import 'measurementValue.dart';

part 'measurement.g.dart';

@JsonSerializable()
class Measurement {
  Measurement(
      {required this.time,
      required this.pm2_5,
      required this.pm10,
      required this.altitude,
      required this.speed,
      required this.temperature,
      required this.humidity,
      required this.device});

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

  static String dbDeviceName() => 'device_name';

  static String dbHumidity() => 'humidity';

  static String dbNameHistoricalMeasurements() => 'historical_measurements';

  static String latestMeasurementsDb() => 'latest_measurements';

  static String dbPm10() => 'pm10';

  static String dbPm25() => 'pm2_5';

  static String dbSpeed() => 'speed';

  static String dbTemperature() => 'temperature';

  static String dbTime() => 'time';

  static String dbDistance() => 'distance';

  static String dbNickName() => 'nickname';

  static String dbDescription() => 'description';

  static String dbLatitude() => 'latitude';

  static String dbLongitude() => 'longitude';

  static String dbSiteName() => 'site_name';

  static String dbLocationName() => 'location_name';

  static String latestMeasurementsTableDropStmt() =>
      'DROP TABLE IF EXISTS ${latestMeasurementsDb()}';

  static String latestMeasurementsTableCreateStmt() =>
      'CREATE TABLE IF NOT EXISTS ${latestMeasurementsDb()}('
      '${dbDeviceName()} TEXT PRIMARY KEY, ${dbLatitude()} REAL, '
      '${dbTime()} TEXT, ${dbPm25()} REAL, '
      '${dbPm10()} REAL, ${dbAltitude()} REAL, '
      '${dbSpeed()} REAL, ${dbTemperature()} REAL, '
      '${dbHumidity()} REAL, ${dbLocationName()} TEXT, '
      '${dbSiteName()} TEXT, ${dbLongitude()} REAL, '
      '${dbDescription()} TEXT, ${dbNickName()} TEXT )';

  static Map<String, dynamic> mapFromDb(Map<String, dynamic> json) {
    var deviceDetails = {
      'nickName': json['${dbNickName()}'] as String,
      'description': json['${dbDescription()}'] as String,
      'name': json['${dbDeviceName()}'] as String,
      'siteName': json['${dbSiteName()}'] as String,
      'locationName': json['${dbLocationName()}'] as String,
      'latitude': json['${dbLatitude()}'] as double,
      'longitude': json['${dbLongitude()}'] as double,
    };

    return {
      'deviceDetails': deviceDetails,
      'time': json['${dbTime()}'] as String,
      'pm2_5': {'calibratedValue': json['${dbPm25()}'] as double},
      'pm10': {'value': json['${dbPm10()}'] as double},
      'externalTemperature': {'value': json['${dbTemperature()}'] as double},
      'externalHumidity': {'value': json['${dbHumidity()}'] as double},
      'speed': {'value': json['${dbSpeed()}'] as double},
      'altitude': {'value': json['${dbAltitude()}'] as double},
    };
  }

  static Map<String, dynamic> mapToDb(Measurement measurement) {
    // var time = measurement.time.replaceAll('T', ' ');
    //
    // if (time.contains('.')) {
    //   time = time.substring(0, time.indexOf('.'));
    // }

    var device = measurement.device;

    return {
      '${dbTime()}': measurement.time,
      '${dbPm25()}': measurement.pm2_5.calibratedValue,
      '${dbPm10()}': measurement.pm10.value,
      '${dbAltitude()}': measurement.altitude.value,
      '${dbSpeed()}': measurement.speed.value,
      '${dbTemperature()}': measurement.temperature.value,
      '${dbHumidity()}': measurement.humidity.value,
      '${dbNickName()}':
          device.nickName == '' ? device.locationName : device.nickName,
      '${dbDescription()}': device.description,
      '${dbSiteName()}': device.siteName,
      '${dbLocationName()}': device.locationName,
      '${dbDeviceName()}': device.name,
      '${dbLatitude()}': device.latitude,
      '${dbLongitude()}': device.longitude,
    };
  }

  static List<Measurement> parseMeasurements(dynamic jsonBody) {
    return Measurements.fromJson(jsonBody).measurements;
  }

  static Measurement parseMeasurement(dynamic jsonBody) {
    var measurements = Measurements.fromJson(jsonBody).measurements;
    return measurements.first;
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
