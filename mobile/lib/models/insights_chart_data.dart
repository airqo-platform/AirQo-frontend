import 'package:app/models/place_details.dart';
import 'package:app/utils/date.dart';
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
  @JsonKey(fromJson: boolFromJson, toJson: boolToJson)
  bool isForecast = false;
  String name;
  String location;
  String day;
  String frequency;

  InsightsChartData(this.time, this.value, this.pollutant, this.available,
      this.name, this.location, this.day, this.frequency, this.isForecast);

  factory InsightsChartData.fromJson(Map<String, dynamic> json) =>
      _$InsightsChartDataFromJson(json);

  Map<String, dynamic> toJson() => _$InsightsChartDataToJson(this);

  @override
  String toString() {
    return 'InsightsChartData{time: $time,}';
  }

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      'id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, '
      'time TEXT, isForecast TEXT, '
      'pollutant TEXT, value REAL, '
      'available TEXT, name TEXT, frequency TEXT,'
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
    List<HistoricalMeasurement> allMeasurements,
    String pollutant,
    PlaceDetails placeDetails,
    List<HistoricalMeasurement> measurements,
  ) {
    var insights = <InsightsChartData>[];
    var days = <int>[];
    for (var measurement in allMeasurements) {
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
          'daily',
          !measurements.contains(measurement));

      days.add(insight.time.weekday);
      insights.add(insight);
    }

    if (insights.isEmpty) {
      var monday = DateTime.now().getDateOfFirstDayOfWeek();
      var lastInsight = InsightsChartData(
          monday,
          55,
          pollutant,
          false,
          placeDetails.getName(),
          placeDetails.getLocation(),
          DateFormat('EEE').format(monday),
          'daily',
          false);

      insights.add(lastInsight);

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
            'daily',
            false));

        lastInsight = insights.last;
      }

      return formatData(insights);
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
          'daily',
          false));

      lastInsight = insights.last;
    }

    return formatData(insights);
  }

  static List<InsightsChartData> getHourlyInsightsData(
    List<HistoricalMeasurement> allMeasurements,
    String pollutant,
    PlaceDetails placeDetails,
    List<HistoricalMeasurement> measurements,
  ) {
    var insights = <InsightsChartData>[];
    var hours = <int>[];

    var measurementsHours = <int>[];

    for (var measurement in measurements) {
      measurementsHours.add(DateTime.parse(measurement.time).hour);
    }

    for (var measurement in allMeasurements) {
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
          DateFormat('EEE').format(DateTime.parse(measurement.time)),
          'hourly',
          !measurementsHours.contains(time.hour));
      hours.add(time.hour);
      insights.add(insight);
    }

    if (insights.isEmpty) {
      var now = DateTime.now();
      for (var i = 0; i <= 23; i++) {
        if (!hours.contains(i)) {
          var hour = i.toString().length == 2 ? '$i' : '0$i';
          var time = DateTime.parse(
              '${DateFormat('yyyy-MM-dd').format(now)} $hour:00:00');

          insights.add(InsightsChartData(
              time,
              50,
              pollutant,
              false,
              placeDetails.getName(),
              placeDetails.getLocation(),
              DateFormat('EEE').format(time),
              'hourly',
              false));
        }
      }
      insights.removeWhere((element) => element.time.day != DateTime.now().day);
      return formatData(insights);
    }

    var referenceInsight = insights.first;
    for (var i = 0; i <= 23; i++) {
      if (!hours.contains(i)) {
        var hour = i.toString().length == 2 ? '$i' : '0$i';
        var time = DateTime.parse(
            '${DateFormat('yyyy-MM-dd').format(referenceInsight.time)}'
            ' $hour:00:00');

        insights.add(InsightsChartData(
            time,
            referenceInsight.value,
            pollutant,
            false,
            placeDetails.getName(),
            placeDetails.getLocation(),
            DateFormat('EEE').format(time),
            'hourly',
            false));
      }
    }
    insights.removeWhere((element) => element.time.day != DateTime.now().day);
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
        '',
        false);
  }
}
