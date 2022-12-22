part of 'dashboard_bloc.dart';

abstract class DashboardEvent extends Equatable {
  const DashboardEvent();
}

class InitializeDashboard extends DashboardEvent {
  const InitializeDashboard();

  @override
  List<Object?> get props => [];
}

class RefreshDashboard extends DashboardEvent {
  const RefreshDashboard();

  @override
  List<Object?> get props => [];
}
