part of 'insights_bloc.dart';

class InsightsState extends Equatable {
  const InsightsState({
    this.healthTips = const [],
    this.forecast = const [],
    this.airQualityReading,
  });

  InsightsState copyWith({
    AirQualityReading? airQualityReading,
    List<HealthTip>? healthTips,
    List<AirQualityReading>? forecast,
  }) {
    return InsightsState(
      healthTips: healthTips ?? this.healthTips,
      forecast: forecast ?? this.forecast,
      airQualityReading: airQualityReading ?? this.airQualityReading,
    );
  }

  final AirQualityReading? airQualityReading;
  final List<HealthTip> healthTips;
  final List<AirQualityReading> forecast;

  @override
  List<Object?> get props => [
        airQualityReading,
        healthTips,
      ];
}
