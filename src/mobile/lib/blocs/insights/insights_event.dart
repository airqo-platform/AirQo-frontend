part of 'insights_bloc.dart';

abstract class InsightsEvent extends Equatable {
  const InsightsEvent();
}

class InitializeInsightsPage extends InsightsEvent {
  const InitializeInsightsPage(this.airQualityReading);

  final AirQualityReading airQualityReading;

  @override
  List<Object> get props => [airQualityReading];
}

class FetchForecast extends InsightsEvent {
  const FetchForecast(this.airQualityReading);
  final AirQualityReading airQualityReading;
  @override
  List<Object> get props => [airQualityReading];
}

class SwitchInsight extends InsightsEvent {
  const SwitchInsight(this.insight);

  final Insight insight;

  @override
  List<Object> get props => [insight];
}
