part of 'dashboard_bloc.dart';

class DashboardState extends Equatable {
  const DashboardState({
    required this.greetings,
    required this.airQualityReadings,
    required this.loading,
  });
  final String greetings;
  final List<AirQualityReading> airQualityReadings;
  final bool loading;

  DashboardState copyWith({
    String? greetings,
    List<AirQualityReading>? airQualityReadings,
    bool? loading,
  }) {
    return DashboardState(
      greetings: greetings ?? this.greetings,
      loading: loading ?? this.loading,
      airQualityReadings: airQualityReadings ?? this.airQualityReadings,
    );
  }

  @override
  List<Object> get props => [];
}

class DashboardLoading extends DashboardState {
  const DashboardLoading({
    required super.greetings,
    required super.airQualityReadings,
    required super.loading,
  });

  @override
  List<Object> get props => [];
}
