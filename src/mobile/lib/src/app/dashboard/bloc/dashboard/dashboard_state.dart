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
  /// True when the preferences fetch returned a 401, meaning the user's token
  /// is expired. The session is not wiped — the user just needs a token refresh.
  final bool prefsAuthError;

  const DashboardLoaded(
    this.response, {
    this.userPreferences,
    this.isOffline = false,
    this.lastUpdated,
    this.prefsAuthError = false,
  });

  @override
  List<Object?> get props => [response, userPreferences, isOffline, lastUpdated, prefsAuthError];

  List<String> get selectedLocationIds {
    if (userPreferences == null) return [];
    return userPreferences!.selectedSites
        .map((site) => site.id)
        .cast<String>()
        .toList();
  }


  DashboardLoaded copyWith({
    AirQualityResponse? response,
    UserPreferencesModel? userPreferences,
    bool? isOffline,
    DateTime? lastUpdated,
    bool? prefsAuthError,
  }) {
    return DashboardLoaded(
      response ?? this.response,
      userPreferences: userPreferences ?? this.userPreferences,
      isOffline: isOffline ?? this.isOffline,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      prefsAuthError: prefsAuthError ?? this.prefsAuthError,
    );
  }
}

class DashboardRefreshing extends DashboardLoaded {
  const DashboardRefreshing(
    super.response, {
    super.userPreferences,
    super.isOffline,
    super.lastUpdated,
    super.prefsAuthError,
  });
}

class DashboardLoadedWithError extends DashboardLoaded {
  final String errorMessage;

  const DashboardLoadedWithError(
    super.response, {
    super.userPreferences,
    super.isOffline,
    super.lastUpdated,
    super.prefsAuthError,
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

class DashboardAuthenticationError extends DashboardState {
  final String message;
  final DashboardLoaded previousState;

  const DashboardAuthenticationError({
    required this.message,
    required this.previousState,
  });

  @override
  List<Object?> get props => [message, previousState];
}