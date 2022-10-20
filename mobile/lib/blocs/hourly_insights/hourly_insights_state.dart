part of 'hourly_insights_bloc.dart';

class HourlyInsightsState extends Equatable {
  const HourlyInsightsState({
    required this.siteId,
    required this.insights,
    required this.airQualityReading,
    required this.pollutant,
    required this.selectedInsight,
    required this.chartIndex,
  });

  final String siteId;
  final Map<Pollutant, List<List<charts.Series<Insights, String>>>> insights;
  final int chartIndex;
  final Pollutant pollutant;
  final Insights? selectedInsight;
  final AirQualityReading? airQualityReading;

  @override
  List<Object> get props => [];
}

class HourlyInsightsLoading extends HourlyInsightsState {
  const HourlyInsightsLoading({
    required super.siteId,
    required super.insights,
    required super.airQualityReading,
    required super.pollutant,
    required super.selectedInsight,
    required super.chartIndex,
  });

  @override
  List<Object> get props => [];
}
