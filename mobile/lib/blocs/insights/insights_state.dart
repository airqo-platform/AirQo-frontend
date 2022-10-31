part of 'insights_bloc.dart';

class InsightsState extends Equatable {
  const InsightsState._({
    this.siteId = '',
    this.insightsCharts = const {},
    this.airQualityReading,
    this.pollutant = Pollutant.pm2_5,
    this.selectedInsight,
    this.chartIndex = 0,
    this.insightsStatus = InsightsStatus.loading,
    this.errorMessage = '',
    this.frequency = Frequency.hourly,
    this.miniInsightsCharts = const {},
  });

  const InsightsState.initial({required Frequency frequency})
      : this._(frequency: frequency);

  const InsightsState({
    required this.siteId,
    required this.insightsCharts,
    required this.miniInsightsCharts,
    required this.airQualityReading,
    required this.pollutant,
    required this.selectedInsight,
    required this.chartIndex,
    required this.insightsStatus,
    required this.errorMessage,
    required this.frequency,
  });

  InsightsState copyWith({
    String? siteId,
    Map<Pollutant, List<List<charts.Series<Insights, String>>>>? insightsCharts,
    Map<Pollutant, List<charts.Series<Insights, String>>>? miniInsightsCharts,
    int? chartIndex,
    Pollutant? pollutant,
    Insights? selectedInsight,
    AirQualityReading? airQualityReading,
    InsightsStatus? insightsStatus,
    String? errorMessage,
    Frequency? frequency,
  }) {
    return InsightsState(
      siteId: siteId ?? this.siteId,
      insightsCharts: insightsCharts ?? this.insightsCharts,
      miniInsightsCharts: miniInsightsCharts ?? this.miniInsightsCharts,
      airQualityReading: airQualityReading ?? this.airQualityReading,
      pollutant: pollutant ?? this.pollutant,
      selectedInsight: selectedInsight ?? this.selectedInsight,
      chartIndex: chartIndex ?? this.chartIndex,
      insightsStatus: insightsStatus ?? this.insightsStatus,
      errorMessage: errorMessage ?? this.errorMessage,
      frequency: frequency ?? this.frequency,
    );
  }

  final String siteId;
  final Map<Pollutant, List<List<charts.Series<Insights, String>>>>
      insightsCharts;
  final Map<Pollutant, List<charts.Series<Insights, String>>>
      miniInsightsCharts;
  final int chartIndex;
  final Pollutant pollutant;
  final Insights? selectedInsight;
  final AirQualityReading? airQualityReading;
  final InsightsStatus insightsStatus;
  final String errorMessage;
  final Frequency frequency;

  @override
  List<Object?> get props => [
        siteId,
        insightsCharts,
        airQualityReading,
        pollutant,
        selectedInsight,
        chartIndex,
        insightsStatus,
        errorMessage,
        frequency,
        miniInsightsCharts,
      ];
}
