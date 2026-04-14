part of 'dashboard_bloc.dart';

abstract class DashboardEvent extends Equatable {
  const DashboardEvent();

  @override
  List<Object> get props => [];
}

class LoadDashboard extends DashboardEvent {
  final bool forceRefresh;
  const LoadDashboard({this.forceRefresh = false});

  @override
  List<Object> get props => [forceRefresh];
}

class LoadUserPreferences extends DashboardEvent {}

class UpdateSelectedLocations extends DashboardEvent {
  final List<String> locationIds;

  const UpdateSelectedLocations(this.locationIds);

  @override
  List<Object> get props => [locationIds];
}

class RefreshDashboard extends DashboardEvent {}

class ConnectionStatusChanged extends DashboardEvent {
  final bool isConnected;
  final ConnectionType connectionType;

  const ConnectionStatusChanged({
    required this.isConnected,
    required this.connectionType,
  });

  @override
  List<Object> get props => [isConnected, connectionType];
}

class DataUpdatedEvent extends DashboardEvent {
  final AirQualityResponse response;

  const DataUpdatedEvent(this.response);

  @override
  List<Object> get props => [response];
}

class SilentRefreshDashboard extends DashboardEvent {}
