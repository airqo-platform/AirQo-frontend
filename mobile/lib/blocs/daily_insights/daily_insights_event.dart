part of 'daily_insights_bloc.dart';

abstract class DailyInsightsEvent extends Equatable {
  const DailyInsightsEvent();
}

class LoadDailyInsights extends DailyInsightsEvent {
  const LoadDailyInsights({
    this.siteId,
    this.airQualityReading,
  });
  final String? siteId;
  final AirQualityReading? airQualityReading;

  @override
  List<Object?> get props => ['LoadDailyInsights'];
}

class SwitchDailyInsightsPollutant extends DailyInsightsEvent {
  const SwitchDailyInsightsPollutant({required this.pollutant});
  final Pollutant pollutant;

  @override
  List<Object?> get props => ['SwitchDailyInsightsPollutant'];
}

class UpdateDailyInsightsActiveIndex extends DailyInsightsEvent {
  const UpdateDailyInsightsActiveIndex(this.index);
  final int index;

  @override
  List<Object?> get props => ['UpdateDailyInsightsActiveIndex'];
}

class UpdateDailyInsightsSelectedInsight extends DailyInsightsEvent {
  const UpdateDailyInsightsSelectedInsight(this.selectedInsight);
  final Insights selectedInsight;

  @override
  List<Object?> get props => ['UpdateDailyInsightsSelectedInsight'];
}

class ClearDailyInsightsTab extends DailyInsightsEvent {
  const ClearDailyInsightsTab();

  @override
  List<Object?> get props => ['ClearDailyInsightsTab'];
}
