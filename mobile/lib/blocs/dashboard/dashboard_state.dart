part of 'dashboard_bloc.dart';

enum DashboardStatus {
  loaded,
  refreshing,
  error,
  loading,
}

enum DashboardError { noAirQuality, noInternetConnection, none }

class DashboardState extends Equatable {
  const DashboardState({
    this.greetings = '',
    this.airQualityReadings = const [],
    this.status = DashboardStatus.loading,
    this.error = DashboardError.none,
    this.checkForUpdates = true,
    this.scrollToTop = false,
  });

  DashboardState copyWith({
    String? greetings,
    List<AirQualityReading>? airQualityReadings,
    DashboardStatus? status,
    DashboardError? error,
    bool? checkForUpdates,
    bool? scrollToTop,
  }) {
    return DashboardState(
      greetings: greetings ?? this.greetings,
      airQualityReadings: airQualityReadings ?? this.airQualityReadings,
      status: status ?? this.status,
      error: error ?? this.error,
      checkForUpdates: checkForUpdates ?? this.checkForUpdates,
      scrollToTop: scrollToTop ?? this.scrollToTop,
    );
  }

  final String greetings;
  final List<AirQualityReading> airQualityReadings;
  final DashboardStatus status;
  final DashboardError error;
  final bool checkForUpdates;
  final bool scrollToTop;

  @override
  List<Object?> get props => [
        greetings,
        airQualityReadings,
        status,
        error,
        checkForUpdates,
        scrollToTop,
      ];
}
