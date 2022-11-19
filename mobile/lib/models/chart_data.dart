import 'package:app/models/database.dart';
import 'package:equatable/equatable.dart';

import 'enum_constants.dart';

class ChartData extends Equatable {
  const ChartData({
    required this.frequency,
    required this.available,
    required this.dateTime,
    required this.siteId,
    required this.pm2_5,
    required this.pm10,
  });

  factory ChartData.fromHistoricalInsight(HistoricalInsight insight) =>
      ChartData(
        frequency: insight.frequency,
        available: insight.available,
        dateTime: insight.time,
        siteId: insight.siteId,
        pm2_5: insight.pm2_5,
        pm10: insight.pm10,
      );
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

  @override
  List<Object?> get props => [dateTime, frequency, siteId];
}

class InsightData {
  const InsightData({
    required this.forecast,
    required this.historical,
  });

  final List<ForecastInsight> forecast;
  final List<HistoricalInsight> historical;
}
