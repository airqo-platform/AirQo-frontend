part of 'dashboard_bloc.dart';

abstract class DashboardEvent extends Equatable {
  const DashboardEvent();

  @override
  List<Object> get props => [];
}

class LoadDashboard extends DashboardEvent {}

class LoadUserPreferences extends DashboardEvent {}

class UpdateSelectedLocations extends DashboardEvent {
  final List<String> locationIds;

  const UpdateSelectedLocations(this.locationIds);

  @override
  List<Object> get props => [locationIds];
}