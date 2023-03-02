import 'package:app/models/database.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';

part 'chart_data.g.dart';

class ChartData extends Equatable {
  const ChartData({
    required this.frequency,
    required this.available,
    required this.dateTime,
    required this.siteId,
    required this.pm2_5,
    required this.pm10,
  });

  factory ChartData.fromForecastInsight(ForecastInsight insight) => ChartData(
        frequency: insight.frequency,
        available: insight.available,
        dateTime: insight.time,
        siteId: insight.siteId,
        pm2_5: insight.pm2_5,
        pm10: insight.pm10,
      );

  final DateTime dateTime;
  final double pm2_5;
  final double pm10;
  final bool available;
  final String siteId;
  final Frequency frequency;

  ChartData copyWith({bool? available}) {
    return ChartData(
      frequency: frequency,
      available: available ?? this.available,
      dateTime: dateTime,
      siteId: siteId,
      pm2_5: pm2_5,
      pm10: pm10,
    );
  }

  @override
  List<Object?> get props => [dateTime, frequency, siteId];
}

@JsonSerializable(
  explicitToJson: true,
  createToJson: false,
)
class InsightData {
  const InsightData({
    required this.forecast,
  });

  factory InsightData.fromJson(Map<String, dynamic> json) =>
      _$InsightDataFromJson(json);

  @JsonKey(fromJson: _forecastInsightListFromJson)
  final List<ForecastInsight> forecast;

  static List<ForecastInsight> _forecastInsightListFromJson(dynamic json) {
    List<ForecastInsight> data = [];
    for (final value in json) {
      try {
        data.add(ForecastInsight.fromJson(value as Map<String, dynamic>));
      } catch (_, __) {}
    }

    return data;
  }
}
