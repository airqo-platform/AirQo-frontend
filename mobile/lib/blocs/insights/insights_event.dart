part of 'insights_bloc.dart';

abstract class InsightsEvent extends Equatable {
  const InsightsEvent();
}

class LoadDailyInsights extends InsightsEvent {
  const LoadDailyInsights();

  @override
  List<Object?> get props => [];
}

class InitializeInsightsPage extends InsightsEvent {
  const InitializeInsightsPage({
    required this.siteId,
    required this.airQualityReading,
  });
  final String siteId;
  final AirQualityReading airQualityReading;

  @override
  List<Object?> get props => [];
}

class LoadHourlyInsights extends InsightsEvent {
  const LoadHourlyInsights();

  @override
  List<Object?> get props => [];
}

class SwitchPollutant extends InsightsEvent {
  const SwitchPollutant({required this.pollutant});
  final Pollutant pollutant;

  @override
  List<Object?> get props => [];
}

class UpdateActiveIndex extends InsightsEvent {
  const UpdateActiveIndex(this.index);
  final int index;

  @override
  List<Object?> get props => [];
}

class UpdateSelectedInsight extends InsightsEvent {
  const UpdateSelectedInsight(this.insights);
  final Insights insights;

  @override
  List<Object?> get props => [];
}

class SwitchTab extends InsightsEvent {
  const SwitchTab({required this.frequency});
  final Frequency frequency;

  @override
  List<Object?> get props => [];
}

class ClearInsightsPage extends InsightsEvent {
  const ClearInsightsPage();

  @override
  List<Object?> get props => [];
}
