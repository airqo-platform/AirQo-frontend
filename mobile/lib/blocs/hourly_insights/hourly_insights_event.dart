part of 'hourly_insights_bloc.dart';

abstract class HourlyInsightsEvent extends Equatable {
  const HourlyInsightsEvent();
}

class LoadHourlyInsights extends HourlyInsightsEvent {
  const LoadHourlyInsights({
    this.siteId,
    this.airQualityReading,
  });
  final String? siteId;
  final AirQualityReading? airQualityReading;

  @override
  List<Object?> get props => ['LoadHourlyInsights'];
}

class SwitchHourlyInsightsPollutant extends HourlyInsightsEvent {
  const SwitchHourlyInsightsPollutant({required this.pollutant});
  final Pollutant pollutant;

  @override
  List<Object?> get props => ['SwitchHourlyInsightsPollutant'];
}

class UpdateHourlyInsightsActiveIndex extends HourlyInsightsEvent {
  const UpdateHourlyInsightsActiveIndex(this.index);
  final int index;

  @override
  List<Object?> get props => ['UpdateHourlyInsightsActiveIndex'];
}

class UpdateHourlyInsightsSelectedInsight extends HourlyInsightsEvent {
  const UpdateHourlyInsightsSelectedInsight(this.selectedInsight);
  final Insights selectedInsight;

  @override
  List<Object?> get props => ['UpdateHourlyInsightsSelectedInsight'];
}

class ClearHourlyInsightsTab extends HourlyInsightsEvent {
  const ClearHourlyInsightsTab();

  @override
  List<Object?> get props => ['ClearHourlyInsightsTab'];
}
