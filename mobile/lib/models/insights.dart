import 'package:flutter/foundation.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'json_parsers.dart';

part 'insights.g.dart';

@JsonSerializable(explicitToJson: true)
class Insights {
  @JsonKey(fromJson: timeFromJson, toJson: timeToJson)
  DateTime time;
  double pm2_5;
  double pm10;
  @JsonKey(fromJson: boolFromJson, toJson: boolToJson)
  bool isEmpty = false;
  @JsonKey(fromJson: boolFromJson, toJson: boolToJson)
  bool isForecast = false;
  String name;
  String siteId;
  String location;
  @JsonKey(fromJson: frequencyFromJson)
  String frequency;

  Insights(this.time, this.pm2_5, this.pm10, this.isEmpty, this.isForecast,
      this.name, this.siteId, this.location, this.frequency);

  factory Insights.fromJson(Map<String, dynamic> json) =>
      _$InsightsFromJson(json);

  double getChartValue(String pollutant) {
    return pollutant == 'pm2.5'
        ? double.parse(pm2_5.toStringAsFixed(2))
        : double.parse(pm10.toStringAsFixed(2));
  }

  Map<String, dynamic> toJson() => _$InsightsToJson(this);

  @override
  String toString() {
    return 'Insights{siteId: $siteId, frequency: $frequency}';
  }

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      'id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, frequency TEXT, '
      'time TEXT, isEmpty TEXT, isForecast TEXT, hasPm10 TEXT, '
      'name TEXT, siteId TEXT, location TEXT, pm2_5 REAL, pm10 REAL)';

  static String dbName() => 'insights_collection';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static List<Insights> formatData(List<Insights> data, String frequency) {
    data.sort((x, y) {
      if (frequency == 'daily') {
        return x.time.weekday.compareTo(y.time.weekday);
      }
      return x.time.compareTo(y.time);
    });

    return data;
  }

  static List<Insights> parseInsights(dynamic jsonBody) {
    var insights = <Insights>[];

    var offSet = DateTime.now().timeZoneOffset;
    for (var jsonElement in jsonBody) {
      try {
        DateTime formattedDate;
        var insight = Insights.fromJson(jsonElement);

        if (offSet.isNegative) {
          formattedDate =
              insight.time.subtract(Duration(hours: offSet.inHours));
        } else {
          formattedDate = insight.time.add(Duration(hours: offSet.inHours));
        }

        insight.time = formattedDate;

        insights.add(insight);
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
        Sentry.captureException(
          exception,
          stackTrace: stackTrace,
        );
      }
    }

    insights.sort((x, y) {
      return x.time.compareTo(y.time);
    });

    return insights;
  }
}
