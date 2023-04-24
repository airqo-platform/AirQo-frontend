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
    this.airQualityReadings = const [],
    this.status = DashboardStatus.loading,
    this.error = DashboardError.none,
    this.checkForUpdates = true,
    this.scrollToTop = false,
  });

  DashboardState copyWith({
    List<AirQualityReading>? airQualityReadings,
    DashboardStatus? status,
    DashboardError? error,
    bool? checkForUpdates,
    bool? scrollToTop,
  }) {
    return DashboardState(
      airQualityReadings: airQualityReadings ?? this.airQualityReadings,
      status: status ?? this.status,
      error: error ?? this.error,
      checkForUpdates: checkForUpdates ?? this.checkForUpdates,
      scrollToTop: scrollToTop ?? this.scrollToTop,
    );
  }

  final List<AirQualityReading> airQualityReadings;
  final DashboardStatus status;
  final DashboardError error;
  final bool checkForUpdates;
  final bool scrollToTop;

  @override
  List<Object?> get props => [
        airQualityReadings,
        status,
        error,
        checkForUpdates,
        scrollToTop,
      ];
}
