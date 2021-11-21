import 'package:app/models/place_details.dart';
import 'package:intl/intl.dart';
import 'package:json_annotation/json_annotation.dart';

import 'historical_measurement.dart';
import 'json_parsers.dart';

part 'insights_chart_data.g.dart';

@JsonSerializable(explicitToJson: true)
class InsightsChartData {
  @JsonKey(fromJson: timeFromJson, toJson: timeToJson)
  DateTime time;
  double value;
  String pollutant;
  @JsonKey(fromJson: boolFromJson, toJson: boolToJson)
  bool available = false;
  String name;
  String location;
  String day;
  String frequency;

  InsightsChartData(this.time, this.value, this.pollutant, this.available,
      this.name, this.location, this.day, this.frequency);

  factory InsightsChartData.fromJson(Map<String, dynamic> json) =>
      _$InsightsChartDataFromJson(json);

  Map<String, dynamic> toJson() => _$InsightsChartDataToJson(this);

  @override
  String toString() {
    return 'InsightsChartData{time: $time,}';
  }

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      'id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, time TEXT, '
      'pollutant TEXT, value REAL, '
      'available TEXT, name TEXT, '
      'day TEXT, location TEXT )';

  static String dbName() => 'insights_db';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static List<InsightsChartData> formatData(List<InsightsChartData> data) {
    data.sort((x, y) {
      return x.time.compareTo(y.time);
    });

    return data;
  }

  static List<InsightsChartData> getDailyInsightsData(
      List<HistoricalMeasurement> measurements,
      String pollutant,
      PlaceDetails placeDetails) {
    var insights = <InsightsChartData>[];
    for (var measurement in measurements) {
      var value = measurement.getPm2_5Value();
      if (pollutant == 'pm10') {
        value = measurement.getPm10Value();
      }
      var insight = InsightsChartData(
          DateTime.parse(measurement.time),
          value,
          pollutant,
          true,
          placeDetails.getName(),
          placeDetails.getLocation(),
          DateFormat('EEE').format(DateTime.parse(measurement.time)),
          'daily');

      insights.add(insight);
    }

    var lastInsight = insights.last;
    while (insights.length != 7) {
      var nextTime = lastInsight.time.add(const Duration(days: 1));

      insights.add(InsightsChartData(
          nextTime,
          lastInsight.value,
          pollutant,
          false,
          placeDetails.getName(),
          placeDetails.getLocation(),
          DateFormat('EEE').format(nextTime),
          'daily'));

      lastInsight = insights.last;
    }

    return formatData(insights);
  }

  static List<InsightsChartData> getHourlyInsightsData(
      List<HistoricalMeasurement> measurements,
      String pollutant,
      PlaceDetails placeDetails) {
    var insights = <InsightsChartData>[];
    var hours = <int>[];
    for (var measurement in measurements) {
      var value = measurement.getPm2_5Value();
      if (pollutant == 'pm10') {
        value = measurement.getPm10Value();
      }
      var time = DateTime.parse(measurement.time);
      var insight = InsightsChartData(
          time,
          value,
          pollutant,
          true,
          placeDetails.getName(),
          placeDetails.getLocation(),
          DateFormat('EEE').format(time),
          'hourly');
      hours.add(time.hour);
      insights.add(insight);
    }

    if (insights.isEmpty) {
      return [];
    }

    var referenceInsight = insights.first;
    for (var i = 0; i <= 23; i++) {
      if (!hours.contains(i)) {
        var hour = i.toString().length == 2 ? '$i' : '0$i';
        var time = DateTime.parse(
            '${DateFormat('yyyy-MM-dd').format(referenceInsight.time)}T$hour:00:00.000Z');

        insights.add(InsightsChartData(
            time,
            referenceInsight.value,
            pollutant,
            false,
            placeDetails.getName(),
            placeDetails.getLocation(),
            DateFormat('EEE').format(time),
            'hourly'));
      }
    }
    return formatData(insights);
  }

  static InsightsChartData historicalDataToInsightsData(
      HistoricalMeasurement measurement,
      String pollutant,
      PlaceDetails placeDetails) {
    var value = measurement.getPm2_5Value();

    if (pollutant == 'pm10') {
      value = measurement.getPm10Value();
    }

    return InsightsChartData(
        DateTime.parse(measurement.time),
        value,
        pollutant,
        true,
        placeDetails.getName(),
        placeDetails.getLocation(),
        DateFormat('EEE').format(DateTime.parse(measurement.time)),
        '');
  }
}
