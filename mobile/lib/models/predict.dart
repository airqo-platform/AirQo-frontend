import 'package:app/models/historical_measurement.dart';
import 'package:app/models/site.dart';
import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';
import 'package:json_annotation/json_annotation.dart';

import 'measurement_value.dart';

part 'predict.g.dart';

@JsonSerializable()
class Predict {
  @JsonKey(required: true, name: 'prediction_time')
  String time;

  @JsonKey(required: true, name: 'prediction_value')
  double value;

  @JsonKey(required: false, name: 'lower_ci', defaultValue: 0.0)
  double lower;

  @JsonKey(required: false, name: 'upper_ci', defaultValue: 0.0)
  double upper;

  Predict({
    required this.value,
    required this.lower,
    required this.time,
    required this.upper,
  });

  factory Predict.fromJson(Map<String, dynamic> json) =>
      _$PredictFromJson(json);

  Map<String, dynamic> toJson() => _$PredictToJson(this);

  static String createTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${forecastDb()}('
      'id PRIMARY KEY, ${Site.dbId()} TEXT,'
      '${dbTime()} TEXT, ${dbUpper()} REAL, '
      '${dbValue()} REAL, ${dbLower()} REAL)';

  static String dbLower() => 'lower';

  static String dbTime() => 'time';

  static String dbUpper() => 'upper';

  static String dbValue() => 'value';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${forecastDb()}';

  static String forecastDb() => 'forecast_measurements';

  static List<HistoricalMeasurement> getMeasurements(
      List<Predict> predictions, String siteId, int deviceNumber, bool today) {
    var measurements = <HistoricalMeasurement>[];
    var emptyValue = MeasurementValue(value: 0.0, calibratedValue: 0.0);
    final formatter = DateFormat('EEE, d MMM yyyy HH:mm:ss');

    for (var predict in predictions) {
      var pmValue = MeasurementValue(
          value: predict.value, calibratedValue: predict.value);

      var time =
          formatter.parse(predict.time).subtract(const Duration(hours: 3));

      if (today) {
        if (time.day == DateTime.now().day) {
          var measurement = HistoricalMeasurement(
              time.toUtc().toString(),
              pmValue,
              emptyValue,
              emptyValue,
              emptyValue,
              emptyValue,
              emptyValue,
              siteId,
              deviceNumber);
          measurements.add(measurement);
        }
      } else {
        var measurement = HistoricalMeasurement(
            time.toUtc().toString(),
            pmValue,
            emptyValue,
            emptyValue,
            emptyValue,
            emptyValue,
            emptyValue,
            siteId,
            deviceNumber);
        measurements.add(measurement);
      }
    }
    return measurements;
  }

  static Map<String, dynamic> mapFromDb(Map<String, dynamic> json) {
    return {
      'prediction_time': json[dbTime()] as String,
      'prediction_value': json[dbValue()] as double,
      'lower_ci': json[dbLower()] as double,
      'upper_ci': json[dbUpper()] as double,
    };
  }

  static Map<String, dynamic> mapToDb(Predict predict, String siteId) {
    return {
      dbTime(): predict.time,
      Site.dbId(): siteId,
      dbValue(): predict.value,
      dbLower(): predict.lower,
      dbUpper(): predict.upper
    };
  }

  static List<Predict> parsePredictions(dynamic jsonBody) {
    var predictions = <Predict>[];

    for (var element in jsonBody) {
      try {
        var predict = Predict.fromJson(element);
        predictions.add(predict);
      } on Error catch (e) {
        debugPrint(e.toString());
      }
    }

    return predictions;
  }
}

extension PredictExtension on Predict {}
