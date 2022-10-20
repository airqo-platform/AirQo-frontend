part of 'daily_insights_bloc.dart';

class DailyInsightsState extends Equatable {
  const DailyInsightsState({
    required this.siteId,
    required this.insights,
    required this.miniInsights,
    required this.airQualityReading,
    required this.pollutant,
    required this.selectedInsight,
    required this.chartIndex,
  });

  final String siteId;
  final Map<Pollutant, List<List<charts.Series<Insights, String>>>> insights;
  final Map<Pollutant, List<charts.Series<Insights, String>>> miniInsights;
  final int chartIndex;
  final Pollutant pollutant;
  final Insights? selectedInsight;
  final AirQualityReading? airQualityReading;

  @override
  List<Object> get props => [];
}

class DailyInsightsLoading extends DailyInsightsState {
  const DailyInsightsLoading({
    required super.siteId,
    required super.insights,
    required super.miniInsights,
    required super.airQualityReading,
    required super.pollutant,
    required super.selectedInsight,
    required super.chartIndex,
  });

  @override
  List<Object> get props => [];
}
