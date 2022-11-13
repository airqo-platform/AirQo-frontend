part of 'insights_bloc.dart';

class InsightsState extends Equatable {
  const InsightsState._({
    this.siteId = '',
    this.insightsCharts = const {},
    this.forecastCharts = const {},
    this.airQualityReading,
    this.pollutant = Pollutant.pm2_5,
    this.selectedInsight,
    this.chartIndex = 0,
    this.forecastChartIndex = 0,
    this.insightsStatus = InsightsStatus.loading,
    this.errorMessage = '',
    this.frequency = Frequency.hourly,
    this.miniInsightsCharts = const {},
    this.scrollingGraphs = false,
    this.showForecastData = false,
  });

  const InsightsState.initial({required Frequency frequency})
      : this._(frequency: frequency);

  const InsightsState({
    required this.siteId,
    required this.insightsCharts,
    required this.forecastCharts,
    required this.miniInsightsCharts,
    required this.airQualityReading,
    required this.pollutant,
    required this.selectedInsight,
    required this.chartIndex,
    required this.forecastChartIndex,
    required this.insightsStatus,
    required this.errorMessage,
    required this.frequency,
    required this.scrollingGraphs,
    required this.showForecastData,
  });

  InsightsState copyWith({
    String? siteId,
    Map<Pollutant, List<List<charts.Series<ChartData, String>>>>?
        insightsCharts,
    Map<Pollutant, List<charts.Series<ChartData, String>>>? miniInsightsCharts,
    Map<Pollutant, List<List<charts.Series<ChartData, String>>>>?
        forecastCharts,
    int? chartIndex,
    int? forecastChartIndex,
    Pollutant? pollutant,
    ChartData? selectedInsight,
    AirQualityReading? airQualityReading,
    InsightsStatus? insightsStatus,
    String? errorMessage,
    Frequency? frequency,
    bool? scrollingGraphs,
    bool? showForecastData,
  }) {
    return InsightsState(
      siteId: siteId ?? this.siteId,
      insightsCharts: insightsCharts ?? this.insightsCharts,
      forecastCharts: forecastCharts ?? this.forecastCharts,
      miniInsightsCharts: miniInsightsCharts ?? this.miniInsightsCharts,
      airQualityReading: airQualityReading ?? this.airQualityReading,
      pollutant: pollutant ?? this.pollutant,
      selectedInsight: selectedInsight ?? this.selectedInsight,
      chartIndex: chartIndex ?? this.chartIndex,
      forecastChartIndex: forecastChartIndex ?? this.forecastChartIndex,
      insightsStatus: insightsStatus ?? this.insightsStatus,
      errorMessage: errorMessage ?? this.errorMessage,
      frequency: frequency ?? this.frequency,
      scrollingGraphs: scrollingGraphs ?? this.scrollingGraphs,
      showForecastData: showForecastData ?? this.showForecastData,
    );
  }

  final String siteId;
  final Map<Pollutant, List<List<charts.Series<ChartData, String>>>>
      insightsCharts;
  final Map<Pollutant, List<List<charts.Series<ChartData, String>>>>
      forecastCharts;
  final Map<Pollutant, List<charts.Series<ChartData, String>>>
      miniInsightsCharts;
  final int chartIndex;
  final int forecastChartIndex;
  final Pollutant pollutant;
  final ChartData? selectedInsight;
  final AirQualityReading? airQualityReading;
  final InsightsStatus insightsStatus;
  final String errorMessage;
  final Frequency frequency;
  final bool scrollingGraphs;
  final bool showForecastData;

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
        scrollingGraphs,
        showForecastData,
        forecastCharts,
        forecastChartIndex,
      ];
}
