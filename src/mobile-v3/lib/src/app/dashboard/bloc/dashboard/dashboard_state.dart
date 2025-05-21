part of 'dashboard_bloc.dart';

abstract class DashboardState extends Equatable {
  const DashboardState();
  
  @override
  List<Object?> get props => [];
}

class DashboardInitial extends DashboardState {}

class DashboardLoading extends DashboardState {
  final bool isOffline;
  final DashboardLoaded? previousState;

  const DashboardLoading({
    this.isOffline = false,
    this.previousState,
  });
  
  @override
  List<Object?> get props => [isOffline, previousState];
}

class DashboardLoaded extends DashboardState {
  final AirQualityResponse response;
  final UserPreferencesModel? userPreferences;
  final bool isOffline;
  final DateTime? lastUpdated;

  const DashboardLoaded(
    this.response, {
    this.userPreferences,
    this.isOffline = false,
    this.lastUpdated,
  });
  
  @override
  List<Object?> get props => [response, userPreferences, isOffline, lastUpdated];
  
  // Helper method to get selected location IDs
  List<String> get selectedLocationIds {
    if (userPreferences == null) return [];
    return userPreferences!.selectedSites
        .map((site) => site.id)
        .cast<String>()
        .toList();
  }
  
  // Create a copy with updated properties
  DashboardLoaded copyWith({
    AirQualityResponse? response,
    UserPreferencesModel? userPreferences,
    bool? isOffline,
    DateTime? lastUpdated,
  }) {
    return DashboardLoaded(
      response ?? this.response,
      userPreferences: userPreferences ?? this.userPreferences,
      isOffline: isOffline ?? this.isOffline,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }
}

/// State when dashboard is loaded but currently refreshing
class DashboardRefreshing extends DashboardLoaded {
  const DashboardRefreshing(
    super.response, {
    super.userPreferences,
    super.isOffline,
    super.lastUpdated,
  });
}

/// State for when dashboard is loaded but with an error
class DashboardLoadedWithError extends DashboardLoaded {
  final String errorMessage;

  const DashboardLoadedWithError(
    super.response, {
    super.userPreferences,
    super.isOffline,
    super.lastUpdated,
    required this.errorMessage,
  });
  
  @override
  List<Object?> get props => [...super.props, errorMessage];
}

class DashboardLoadingError extends DashboardState {
  final String message;
  final bool isOffline;
  final bool hasCache;
  

  const DashboardLoadingError(
    this.message, {
    this.isOffline = false,
    this.hasCache = false
  });
  
  @override
  List<Object> get props => [message, isOffline];
}