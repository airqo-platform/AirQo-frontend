part of 'dashboard_bloc.dart';

abstract class DashboardState extends Equatable {
  const DashboardState();
  
  @override
  List<Object?> get props => [];
}

class DashboardInitial extends DashboardState {}

class DashboardLoading extends DashboardState {}

class DashboardLoaded extends DashboardState {
  final AirQualityResponse response;
  final UserPreferencesModel? userPreferences;

  const DashboardLoaded(this.response, {this.userPreferences});
  
  @override
  List<Object?> get props => [response, userPreferences];
  
  // Helper method to get selected location IDs
  List<String> get selectedLocationIds {
    if (userPreferences == null) return [];
    return userPreferences!.selectedSites
        .map((site) => site.id)
        .cast<String>()
        .toList();
  }
  
  // Create a copy with updated preferences
  DashboardLoaded copyWith({
    AirQualityResponse? response,
    UserPreferencesModel? userPreferences,
  }) {
    return DashboardLoaded(
      response ?? this.response,
      userPreferences: userPreferences ?? this.userPreferences,
    );
  }
}

class DashboardLoadingError extends DashboardState {
  final String message;

  const DashboardLoadingError(this.message);
  
  @override
  List<Object> get props => [message];
}