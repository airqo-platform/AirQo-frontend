part of 'insights_bloc.dart';

class InsightsState extends Equatable {
  const InsightsState._({
    this.siteId = '',
    this.historicalCharts = const {},
    this.forecastCharts = const {},
    this.airQualityReading,
    this.pollutant = Pollutant.pm2_5,
    this.featuredHistoricalInsight,
    this.featuredForecastInsight,
    this.historicalChartIndex = 0,
    this.forecastChartIndex = 0,
    this.insightsStatus = InsightsStatus.loading,
    this.errorMessage = '',
    this.frequency = Frequency.hourly,
    this.miniInsightsCharts = const {},
    this.scrollingGraphs = false,
    this.isShowingForecast = false,
    this.healthTips = const [],
    this.healthTipsTitle = '',
  });

  const InsightsState.initial({required Frequency frequency})
      : this._(frequency: frequency);

  const InsightsState({
    required this.siteId,
    required this.historicalCharts,
    required this.forecastCharts,
    required this.miniInsightsCharts,
    required this.airQualityReading,
    required this.pollutant,
    required this.featuredHistoricalInsight,
    required this.historicalChartIndex,
    required this.forecastChartIndex,
    required this.insightsStatus,
    required this.errorMessage,
    required this.frequency,
    required this.scrollingGraphs,
    required this.isShowingForecast,
    required this.featuredForecastInsight,
    required this.healthTips,
    required this.healthTipsTitle,
  });

  InsightsState copyWith({
    String? siteId,
    Map<Pollutant, List<List<charts.Series<ChartData, String>>>>?
        historicalCharts,
    Map<Pollutant, List<charts.Series<ChartData, String>>>? miniInsightsCharts,
    Map<Pollutant, List<List<charts.Series<ChartData, String>>>>?
        forecastCharts,
    int? historicalChartIndex,
    int? forecastChartIndex,
    Pollutant? pollutant,
    ChartData? featuredHistoricalInsight,
    ChartData? featuredForecastInsight,
    AirQualityReading? airQualityReading,
    InsightsStatus? insightsStatus,
    String? errorMessage,
    String? healthTipsTitle,
    Frequency? frequency,
    bool? scrollingGraphs,
    bool? isShowingForecast,
    List<Recommendation>? healthTips,
  }) {
    return InsightsState(
      siteId: siteId ?? this.siteId,
      historicalCharts: historicalCharts ?? this.historicalCharts,
      healthTips: healthTips ?? this.healthTips,
      healthTipsTitle: healthTipsTitle ?? this.healthTipsTitle,
      forecastCharts: forecastCharts ?? this.forecastCharts,
      miniInsightsCharts: miniInsightsCharts ?? this.miniInsightsCharts,
      airQualityReading: airQualityReading ?? this.airQualityReading,
      pollutant: pollutant ?? this.pollutant,
      featuredHistoricalInsight:
          featuredHistoricalInsight ?? this.featuredHistoricalInsight,
      historicalChartIndex: historicalChartIndex ?? this.historicalChartIndex,
      forecastChartIndex: forecastChartIndex ?? this.forecastChartIndex,
      insightsStatus: insightsStatus ?? this.insightsStatus,
      errorMessage: errorMessage ?? this.errorMessage,
      frequency: frequency ?? this.frequency,
      scrollingGraphs: scrollingGraphs ?? this.scrollingGraphs,
      isShowingForecast: isShowingForecast ?? this.isShowingForecast,
      featuredForecastInsight:
          featuredForecastInsight ?? this.featuredForecastInsight,
    );
  }

  final String siteId;
  final Map<Pollutant, List<List<charts.Series<ChartData, String>>>>
      historicalCharts;
  final Map<Pollutant, List<List<charts.Series<ChartData, String>>>>
      forecastCharts;
  final Map<Pollutant, List<charts.Series<ChartData, String>>>
      miniInsightsCharts;
  final int historicalChartIndex;
  final int forecastChartIndex;
  final Pollutant pollutant;
  final ChartData? featuredHistoricalInsight;
  final ChartData? featuredForecastInsight;
  final AirQualityReading? airQualityReading;
  final InsightsStatus insightsStatus;
  final String errorMessage;
  final Frequency frequency;
  final bool scrollingGraphs;
  final bool isShowingForecast;
  final List<Recommendation> healthTips;
  final String healthTipsTitle;

  @override
  List<Object?> get props => [
        siteId,
        historicalCharts,
        airQualityReading,
        pollutant,
        featuredHistoricalInsight,
        historicalChartIndex,
        insightsStatus,
        errorMessage,
        frequency,
        miniInsightsCharts,
        scrollingGraphs,
        isShowingForecast,
        forecastCharts,
        forecastChartIndex,
        featuredForecastInsight,
        healthTips,
        healthTipsTitle,
      ];
}
