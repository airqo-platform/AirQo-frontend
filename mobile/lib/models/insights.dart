import 'package:json_annotation/json_annotation.dart';

import '../utils/exception.dart';
import 'enum_constants.dart';
import 'json_parsers.dart';

part 'insights.g.dart';

@JsonSerializable(explicitToJson: true)
class Insights {
  @JsonKey(fromJson: timeFromJson, toJson: timeToJson)
  DateTime time;
  double pm2_5;
  double pm10;
  @JsonKey(fromJson: boolFromJson, toJson: boolToJson)
  bool empty = false;
  @JsonKey(fromJson: boolFromJson, toJson: boolToJson)
  bool forecast = false;
  String siteId;
  @JsonKey(fromJson: frequencyFromJson)
  String frequency;

  Insights(this.time, this.pm2_5, this.pm10, this.empty, this.forecast,
      this.siteId, this.frequency);

  factory Insights.fromJson(Map<String, dynamic> json) =>
      _$InsightsFromJson(json);

  double getChartValue(Pollutant pollutant) {
    return pollutant == Pollutant.pm2_5
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
      'time TEXT, empty TEXT, forecast TEXT, '
      'siteId TEXT, pm2_5 REAL, pm10 REAL)';

  static String dbName() => 'insights_collection';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static List<Insights> formatData(List<Insights> data, Frequency frequency) {
    data.sort((x, y) {
      if (frequency == Frequency.daily) {
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
        logException(exception, stackTrace);
      }
    }

    insights.sort((x, y) {
      return x.time.compareTo(y.time);
    });

    return insights;
  }
}
