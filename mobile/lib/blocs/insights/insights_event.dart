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
