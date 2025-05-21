import 'dart:async';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:airqo/src/app/dashboard/repository/user_preferences_repository.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';

part 'dashboard_event.dart';
part 'dashboard_state.dart';

class DashboardBloc extends Bloc<DashboardEvent, DashboardState> with UiLoggy {
  final DashboardRepository repository;
  final UserPreferencesRepository preferencesRepo = UserPreferencesImpl();
  final CacheManager _cacheManager = CacheManager();

  StreamSubscription? _airQualitySubscription;
  
  StreamSubscription? _connectionSubscription;
  
  DashboardBloc(this.repository) : super(DashboardInitial()) {
    on<LoadDashboard>(_onLoadDashboard);
    on<RefreshDashboard>(_onRefreshDashboard);
    on<SilentRefreshDashboard>(_onSilentRefreshDashboard);
    on<LoadUserPreferences>(_onLoadUserPreferences);
    on<UpdateSelectedLocations>(_onUpdateSelectedLocations);
    on<DataUpdatedEvent>(_onDataUpdated);
    on<ConnectionStatusChanged>(_onConnectionStatusChanged);
    
    _airQualitySubscription = (repository as DashboardImpl).airQualityStream.listen((response) {
      if (state is DashboardLoaded) {
        add(DataUpdatedEvent(response));
      }
    });
    
    _connectionSubscription = _cacheManager.connectionChange.listen((connectionType) {
      add(ConnectionStatusChanged(
        isConnected: connectionType != ConnectionType.none,
        connectionType: connectionType,
      ));
    });
  }

  Future<void> _onLoadDashboard(LoadDashboard event, Emitter<DashboardState> emit) async {
    try {
      // If not already loading, emit loading state
      if (state is! DashboardLoading) {
        emit(DashboardLoading(
          isOffline: !_cacheManager.isConnected,
          previousState: state is DashboardLoaded ? state as DashboardLoaded : null,
        ));
      }

      // Fetch air quality data (will use cache if available)
      AirQualityResponse response = await repository.fetchAirQualityReadings(
        forceRefresh: event.forceRefresh,
      );

      UserPreferencesModel? preferences;

      try {
        // Try to get user preferences if user is logged in
        final userId = await AuthHelper.getCurrentUserId();
        if (userId != null) {
          loggy.info('Loading preferences during dashboard load for user: $userId');
          final prefsResponse = await preferencesRepo.getUserPreferences(userId);

          loggy.info('Preference response structure: ${prefsResponse.keys.toList()}');

          if (prefsResponse['success'] == true) {
            try {
              if (prefsResponse['preferences'] is List &&
                  prefsResponse['preferences'].isNotEmpty) {
                final preferenceData = prefsResponse['preferences'].first;

                if (preferenceData is Map<String, dynamic>) {
                  preferences = UserPreferencesModel.fromJson(preferenceData);
                  loggy.info(
                      'Successfully loaded preferences with ${preferences.selectedSites.length} sites');
                }
              }

              if (preferences == null) {
                if (prefsResponse['preference'] != null) {
                  preferences = UserPreferencesModel.fromJson(
                      prefsResponse['preference']);
                } else if (prefsResponse['data'] is Map) {
                  preferences =
                      UserPreferencesModel.fromJson(prefsResponse['data']);
                } else if (prefsResponse['data'] is List &&
                    prefsResponse['data'].isNotEmpty) {
                  preferences = UserPreferencesModel.fromJson(
                      prefsResponse['data'].first);
                }
              }

              if (preferences == null) {
                loggy.warning('Unable to parse preferences from response');
              }
            } catch (parseError) {
              loggy.error('Error parsing preference data: $parseError');
              loggy.error('Problematic data structure: $prefsResponse');
            }
          } else {
            loggy.warning(
                'Failed to load user preferences during dashboard load: ${prefsResponse['message']}');
          }
        }
      } catch (e) {
        loggy.error('Error loading preferences during dashboard load: $e');
      }

      // Emit loaded state with fresh or cached data
      emit(DashboardLoaded(
        response, 
        userPreferences: preferences,
        isOffline: !_cacheManager.isConnected,
        lastUpdated: DateTime.now(),
      ));

      if (preferences == null) {
        loggy.info('Preferences not loaded initially, retrying as separate event');
        add(LoadUserPreferences());
      }
    } catch (e) {
      loggy.error('Error loading dashboard: $e');
      
      // If we were in a loaded state before, keep that state but mark as error
      if (state is DashboardLoading && (state as DashboardLoading).previousState != null) {
        final previousState = (state as DashboardLoading).previousState!;
        emit(DashboardLoadedWithError(
          previousState.response,
          userPreferences: previousState.userPreferences,
          isOffline: !_cacheManager.isConnected,
          lastUpdated: previousState.lastUpdated,
          errorMessage: e.toString(),
        ));
      } else {
        emit(DashboardLoadingError(
          e.toString(),
          isOffline: !_cacheManager.isConnected,
        ));
      }
    }
  }

  Future<void> _onRefreshDashboard(RefreshDashboard event, Emitter<DashboardState> emit) async {
    try {
      if (state is! DashboardLoaded) {
        add(LoadDashboard(forceRefresh: true));
        return;
      }
      
      final currentState = state as DashboardLoaded;
      emit(DashboardRefreshing(
        currentState.response,
        userPreferences: currentState.userPreferences,
        isOffline: !_cacheManager.isConnected,
        lastUpdated: currentState.lastUpdated,
      ));
      
      final response = await repository.fetchAirQualityReadings(forceRefresh: true);
      
      emit(DashboardLoaded(
        response,
        userPreferences: currentState.userPreferences,
        isOffline: !_cacheManager.isConnected,
        lastUpdated: DateTime.now(),
      ));
      
      add(LoadUserPreferences());
    } catch (e) {
      loggy.error('Error refreshing dashboard: $e');
      
      if (state is DashboardRefreshing) {
        final refreshingState = state as DashboardRefreshing;
        emit(DashboardLoadedWithError(
          refreshingState.response,
          userPreferences: refreshingState.userPreferences,
          isOffline: !_cacheManager.isConnected,
          lastUpdated: refreshingState.lastUpdated,
          errorMessage: e.toString(),
        ));
      } else if (state is DashboardLoaded) {
        final loadedState = state as DashboardLoaded;
        emit(DashboardLoadedWithError(
          loadedState.response,
          userPreferences: loadedState.userPreferences,
          isOffline: !_cacheManager.isConnected,
          lastUpdated: loadedState.lastUpdated,
          errorMessage: e.toString(),
        ));
      } else {
        emit(DashboardLoadingError(
          e.toString(),
          isOffline: !_cacheManager.isConnected,
        ));
      }
    }
  }

  Future<void> _onLoadUserPreferences(LoadUserPreferences event, Emitter<DashboardState> emit) async {
    if (state is! DashboardLoaded && state is! DashboardLoadedWithError) {
      loggy.warning('Cannot load preferences: Dashboard not in loaded state');
      return;
    }

    try {
      final currentState = state as DashboardLoaded;
      final userId = await AuthHelper.getCurrentUserId();
      if (userId == null) {
        loggy.info('No user ID available, skipping preferences load');
        return;
      }

      loggy.info('Loading preferences for user: $userId');
      final response = await preferencesRepo.getUserPreferences(userId);

      UserPreferencesModel? prefsData;
      if (response['success'] == true) {
        if (response['data'] != null &&
            response['data'] is Map<String, dynamic>) {
          prefsData = UserPreferencesModel.fromJson(response['data']);
        } else if (response['preferences'] is List &&
            response['preferences'].isNotEmpty) {
          prefsData =
              UserPreferencesModel.fromJson(response['preferences'].first);
        } else {
          prefsData = UserPreferencesModel(
            id: '',
            userId: userId,
            selectedSites: [],
          );
          loggy.info('No preferences data found, initializing with 0 sites');
        }
        loggy.info(
            'Loaded preferences: ${prefsData.selectedSites.length} sites');
        emit(DashboardLoaded(
          currentState.response, 
          userPreferences: prefsData,
          isOffline: currentState.isOffline,
          lastUpdated: currentState.lastUpdated,
        ));
      } else {
        loggy.warning('Failed to load user preferences: ${response['message']}');
      }
    } catch (e) {
      loggy.error('Error loading user preferences: $e');
    }
  }

  Future<void> _onUpdateSelectedLocations(UpdateSelectedLocations event, Emitter<DashboardState> emit) async {
    if (state is! DashboardLoaded && state is! DashboardLoadedWithError) return;

    try {
      final currentState = state as DashboardLoaded;
      final userId = await AuthHelper.getCurrentUserId();

      if (userId == null) {
        loggy.warning('Cannot update preferences: No user ID available');
        return;
      }

      loggy.info(
          'Updating selected locations for user $userId with ${event.locationIds.length} IDs');
      for (final id in event.locationIds) {
        loggy.info('Selected location ID: $id');
      }

      final measurementsBySiteId = <String, Measurement>{};
      if (currentState.response.measurements != null) {
        for (var m in currentState.response.measurements!) {
          if (m.siteId != null && m.siteId!.isNotEmpty) {
            measurementsBySiteId[m.siteId!] = m;
          }
        }
      }

      List<Map<String, dynamic>> selectedSites = [];
      for (final siteId in event.locationIds) {
        final measurement = measurementsBySiteId[siteId];
        
        if (measurement != null) {
          double? latitude = measurement.siteDetails?.approximateLatitude ?? 
                            measurement.siteDetails?.siteCategory?.latitude;
          double? longitude = measurement.siteDetails?.approximateLongitude ?? 
                             measurement.siteDetails?.siteCategory?.longitude;


          selectedSites.add({
            "_id": siteId,
            "name": measurement.siteDetails?.name ?? 'Unknown Location',
            "search_name": measurement.siteDetails?.searchName ??
                measurement.siteDetails?.name ??
                'Unknown Location',
            "latitude": latitude,
            "longitude": longitude,
            "createdAt": DateTime.now().toIso8601String(),
          });
          loggy.info(
              'Added site: ${measurement.siteDetails?.name} (ID: $siteId)');
        } else {
          loggy.warning('Could not find details for location ID: $siteId');
        }
      }

      final Map<String, dynamic> requestBody = {
        "user_id": userId,
        "selected_sites": selectedSites,
      };

      loggy.info('Updating preferences with ${selectedSites.length} locations');
      for (var site in selectedSites) {
        loggy.info('Selected site: ${site["name"]} (ID: ${site["_id"]})');
      }

      final response = await preferencesRepo.replacePreference(requestBody);

      if (response['success'] == true) {
        loggy.info('Successfully updated preferences');
        add(LoadUserPreferences());
      } else {
        loggy.warning('Failed to update preferences: ${response["message"]}');
      }
    } catch (e) {
      loggy.error('Error updating preferences: $e');
    }
  }
  
  void _onConnectionStatusChanged(ConnectionStatusChanged event, Emitter<DashboardState> emit) {
    loggy.info('Connection status changed: ${event.isConnected ? "Online" : "Offline"}');

    if (state is DashboardLoaded) {
      final currentState = state as DashboardLoaded;
      emit(currentState.copyWith(isOffline: !event.isConnected));
      
      if (event.isConnected && 
          currentState.lastUpdated != null &&
          DateTime.now().difference(currentState.lastUpdated!).inMinutes > 30) {
        add(RefreshDashboard());
      }
    }
  }

  Future<void> _onSilentRefreshDashboard(
    SilentRefreshDashboard event, Emitter<DashboardState> emit) async {
  try {

    if (state is! DashboardLoaded) {
      return;
    }

    final currentState = state as DashboardLoaded;

    final response = await repository.fetchAirQualityReadings(forceRefresh: true);
    
    emit(DashboardLoaded(
      response,
      userPreferences: currentState.userPreferences,
      isOffline: currentState.isOffline,
      lastUpdated: DateTime.now(),
    ));

    add(LoadUserPreferences());
  } catch (e) {
    loggy.error('Error in silent refresh: $e');
  }
}

  
  void _onDataUpdated(DataUpdatedEvent event, Emitter<DashboardState> emit) {

    if (state is DashboardLoaded) {
      final currentState = state as DashboardLoaded;
      emit(DashboardLoaded(
        event.response,
        userPreferences: currentState.userPreferences,
        isOffline: currentState.isOffline,
        lastUpdated: DateTime.now(),
      ));
    }
  }
  
  @override
  Future<void> close() {
    _airQualitySubscription?.cancel();
    _connectionSubscription?.cancel();
    return super.close();
  }
}

