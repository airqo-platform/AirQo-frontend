part of 'dashboard_bloc.dart';

abstract class DashboardEvent extends Equatable {
  const DashboardEvent();
}

class RefreshDashboard extends DashboardEvent {
  const RefreshDashboard({this.reload});
  final bool? reload;

  @override
  List<Object?> get props => [reload];
}

class CancelCheckForUpdates extends DashboardEvent {
  const CancelCheckForUpdates();

  @override
  List<Object?> get props => [];
}
