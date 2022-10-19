part of 'dashboard_bloc.dart';

abstract class DashboardEvent extends Equatable {
  const DashboardEvent();
}

class UpdateGreetings extends DashboardEvent {
  const UpdateGreetings();

  @override
  List<Object?> get props => ['Update Greetings'];
}

class InitializeDashboard extends DashboardEvent {
  const InitializeDashboard();

  @override
  List<Object?> get props => ['Initialize Dashboard'];
}
