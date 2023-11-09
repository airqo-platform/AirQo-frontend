part of 'dashboard_bloc.dart';

abstract class DashboardEvent extends Equatable {
  const DashboardEvent();
}

class RefreshDashboard extends DashboardEvent {
  const RefreshDashboard({this.reload, this.scrollToTop = false});
  final bool? reload;
  final bool scrollToTop;

  @override
  List<Object?> get props => [reload];
}

class CancelCheckForUpdates extends DashboardEvent {
  const CancelCheckForUpdates();

  @override
  List<Object?> get props => [];
}
