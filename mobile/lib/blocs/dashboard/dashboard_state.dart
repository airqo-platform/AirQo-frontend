part of 'dashboard_bloc.dart';

enum DashboardStatus {
  initial,
  loaded,
  processing,
  error,
}

enum DashboardError { noAirQuality, noInternetConnection, none }

class DashboardState extends Equatable {
  const DashboardState._({
    this.greetings = '',
    this.airQualityReadings = const [],
    this.blocStatus = DashboardStatus.initial,
    this.error = DashboardError.none,
  });

  const DashboardState({
    this.greetings = '',
    this.airQualityReadings = const [],
    this.blocStatus = DashboardStatus.initial,
    this.error = DashboardError.none,
  });

  DashboardState copyWith({
    String? greetings,
    List<AirQualityReading>? airQualityReadings,
    DashboardStatus? blocStatus,
    DashboardError? error,
  }) {
    return DashboardState(
      greetings: greetings ?? this.greetings,
      airQualityReadings: airQualityReadings ?? this.airQualityReadings,
      blocStatus: blocStatus ?? this.blocStatus,
      error: error ?? this.error,
    );
  }

  const DashboardState.initial() : this._();

  final String greetings;
  final List<AirQualityReading> airQualityReadings;
  final DashboardStatus blocStatus;
  final DashboardError error;

  @override
  List<Object?> get props => [
        greetings,
        airQualityReadings,
        blocStatus,
        error,
      ];
}
