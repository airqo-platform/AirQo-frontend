part of 'hourly_insights_bloc.dart';

class HourlyInsightsState extends Equatable {
  const HourlyInsightsState._({
    this.siteId = '',
    this.insights = const {},
    this.airQualityReading = null,
    this.pollutant = Pollutant.pm2_5,
    this.selectedInsight = null,
    this.chartIndex = 0,
    this.insightsStatus = InsightsStatus.loading,
    this.errorMessage = '',
  });

  const HourlyInsightsState.initial() : this._();

  const HourlyInsightsState({
    required this.siteId,
    required this.insights,
    required this.airQualityReading,
    required this.pollutant,
    required this.selectedInsight,
    required this.chartIndex,
    required this.insightsStatus,
    required this.errorMessage,
  });

  HourlyInsightsState copyWith({
    String? siteId,
    Map<Pollutant, List<List<charts.Series<Insights, String>>>>? insights,
    int? chartIndex,
    Pollutant? pollutant,
    Insights? selectedInsight,
    AirQualityReading? airQualityReading,
    InsightsStatus? insightsStatus,
    String? errorMessage,
  }) {
    return HourlyInsightsState(
      siteId: siteId ?? this.siteId,
      insights: insights ?? this.insights,
      airQualityReading: airQualityReading ?? this.airQualityReading,
      pollutant: pollutant ?? this.pollutant,
      selectedInsight: selectedInsight ?? this.selectedInsight,
      chartIndex: chartIndex ?? this.chartIndex,
      insightsStatus: insightsStatus ?? this.insightsStatus,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  final String siteId;
  final Map<Pollutant, List<List<charts.Series<Insights, String>>>> insights;
  final int chartIndex;
  final Pollutant pollutant;
  final Insights? selectedInsight;
  final AirQualityReading? airQualityReading;
  final InsightsStatus insightsStatus;
  final String errorMessage;

  @override
  List<Object?> get props => [
        siteId,
        insights,
        airQualityReading,
        pollutant,
        selectedInsight,
        chartIndex,
        insightsStatus,
        errorMessage,
      ];
}
