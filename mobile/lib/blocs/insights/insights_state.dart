part of 'insights_bloc.dart';

class InsightsState extends Equatable {
  const InsightsState({
    required this.siteId,
    required this.dailyInsights,
    required this.hourlyInsights,
    required this.frequency,
    required this.airQualityReading,
    required this.pollutant,
    required this.selectedInsight,
    required this.activeChartIndex,
  });

  final String siteId;
  final Map<Pollutant, List<List<charts.Series<Insights, String>>>>
      dailyInsights;
  final Map<Pollutant, List<List<charts.Series<Insights, String>>>>
      hourlyInsights;
  final Frequency frequency;
  final int activeChartIndex;
  final Pollutant pollutant;
  final Insights? selectedInsight;
  final AirQualityReading? airQualityReading;

  @override
  List<Object> get props => [];
}

class InsightsLoading extends InsightsState {
  const InsightsLoading({
    required super.siteId,
    required super.hourlyInsights,
    required super.dailyInsights,
    required super.frequency,
    required super.airQualityReading,
    required super.pollutant,
    required super.selectedInsight,
    required super.activeChartIndex,
  });

  @override
  List<Object> get props => [];
}
