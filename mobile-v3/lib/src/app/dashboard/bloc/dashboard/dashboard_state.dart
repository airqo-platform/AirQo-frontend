part of 'dashboard_bloc.dart';

sealed class DashboardState extends Equatable {
  const DashboardState();

  @override
  List<Object> get props => [];
}

final class DashboardInitial extends DashboardState {}

class DashboardLoading extends DashboardState {}

class DashboardLoaded extends DashboardState {
  final AirQualityResponse response;

  const DashboardLoaded(this.response);
}

class DashboardLoadingError extends DashboardState {
  final String message;

  const DashboardLoadingError(this.message);
}

