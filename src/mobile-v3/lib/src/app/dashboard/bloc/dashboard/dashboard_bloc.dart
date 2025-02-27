import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:airqo/src/app/dashboard/repository/user_preferences_repository.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';

part 'dashboard_event.dart';
part 'dashboard_state.dart';

class DashboardBloc extends Bloc<DashboardEvent, DashboardState> with UiLoggy {
  final DashboardRepository repository;
  final UserPreferencesRepository preferencesRepo = UserPreferencesImpl();
  
  DashboardBloc(this.repository) : super(DashboardInitial()) {
    on<DashboardEvent>((event, emit) async {
      if (event is LoadDashboard) {
        await _handleLoadDashboard(emit);
      } else if (event is LoadUserPreferences) {
        await _handleLoadUserPreferences(emit);
      } else if (event is UpdateSelectedLocations) {
        await _handleUpdateSelectedLocations(event.locationIds, emit);
      }
    });
  }

  Future<void> _handleLoadDashboard(Emitter<DashboardState> emit) async {
    try {
      emit(DashboardLoading());

      // Load air quality data
      AirQualityResponse response = await repository.fetchAirQualityReadings();
      
      // Try to load user preferences directly within the dashboard loading flow
      UserPreferencesModel? preferences;
      try {
        final userId = await AuthHelper.getCurrentUserId();
        if (userId != null) {
          loggy.info('Loading preferences during dashboard load for user: $userId');
          final prefsResponse = await preferencesRepo.getUserPreferences(userId);
          
          if (prefsResponse['success'] == true && prefsResponse['data'] != null) {
            preferences = UserPreferencesModel.fromJson(prefsResponse['data']);
            loggy.info('Successfully loaded preferences with ${preferences.selectedSites.length} sites');
          } else {
            loggy.warning('Failed to load user preferences during dashboard load: ${prefsResponse['message']}');
          }
        } else {
          loggy.info('No user ID available during dashboard load');
        }
      } catch (e) {
        loggy.error('Error loading preferences during dashboard load: $e');
        // Continue without preferences rather than failing the whole dashboard
      }
      
      // Emit loaded state with preferences (if loaded) or null
      emit(DashboardLoaded(response, userPreferences: preferences));
      
      // If preferences failed to load initially, try again as a separate event
      if (preferences == null) {
        loggy.info('Preferences not loaded initially, retrying as separate event');
        add(LoadUserPreferences());
      }
    } catch (e) {
      loggy.error('Error loading dashboard: $e');
      emit(DashboardLoadingError(e.toString()));
    }
  }
  
  Future<void> _handleUpdateSelectedLocations(List<String> locationIds, Emitter<DashboardState> emit) async {
    if (state is! DashboardLoaded) return;
    
    try {
      final currentState = state as DashboardLoaded;
      final userId = await AuthHelper.getCurrentUserId();
      
      if (userId == null) {
        loggy.warning('Cannot update preferences: No user ID available');
        return;
      }
      
      // If we have existing preferences, use them as a reference for site details
      List<Map<String, dynamic>> selectedSites = [];
      
      if (currentState.userPreferences != null) {
        // First, include any existing sites that are still in the locationIds list
        for (var site in currentState.userPreferences!.selectedSites) {
          if (locationIds.contains(site.id)) {
            selectedSites.add({
              "_id": site.id,
              "name": site.name,
              "search_name": site.searchName ?? site.name,
              "latitude": site.latitude,
              "longitude": site.longitude,
              "createdAt": DateTime.now().toIso8601String(),
            });
          }
        }
      }
      
      // For any locationIds that weren't in existing preferences, try to find them in measurements
      final existingSiteIds = selectedSites.map((s) => s["_id"] as String).toSet();
      final remainingIds = locationIds.where((id) => !existingSiteIds.contains(id)).toList();
      
      if (remainingIds.isNotEmpty) {
        loggy.info('Finding details for ${remainingIds.length} new location IDs');
        
        // Get measurements for the remaining IDs
        for (final id in remainingIds) {
          // Try to find a matching measurement
          final matchingMeasurement = currentState.response.measurements
              ?.where(
                (m) => m.id == id || m.siteDetails?.id == id || m.siteId == id,
              ).firstOrNull;
          
          if (matchingMeasurement != null) {
            selectedSites.add({
              "_id": id,
              "name": matchingMeasurement.siteDetails?.name ?? 'Unknown Location',
              "search_name": matchingMeasurement.siteDetails?.searchName ?? 
                             matchingMeasurement.siteDetails?.name ?? 'Unknown Location',
              "latitude": matchingMeasurement.siteDetails?.approximateLatitude ?? 
                          matchingMeasurement.siteDetails?.siteCategory?.latitude,
              "longitude": matchingMeasurement.siteDetails?.approximateLongitude ?? 
                           matchingMeasurement.siteDetails?.siteCategory?.longitude,
              "createdAt": DateTime.now().toIso8601String(),
            });
          } else {
            loggy.warning('Could not find details for location ID: $id');
          }
        }
      }
      
      // Prepare request body
      final Map<String, dynamic> requestBody = {
        "user_id": userId,
        "selected_sites": selectedSites,
      };
      
      loggy.info('Updating preferences with ${selectedSites.length} locations out of ${locationIds.length} IDs');
      final response = await preferencesRepo.replacePreference(requestBody);
      
      if (response['success'] == true) {
        loggy.info('Successfully updated preferences');
        // Reload preferences to get the updated data
        add(LoadUserPreferences());
      } else {
        loggy.warning('Failed to update preferences: ${response["message"]}');
      }
    } catch (e) {
      loggy.error('Error updating preferences: $e');
    }
  }
  
  Future<void> _handleLoadUserPreferences(Emitter<DashboardState> emit) async {
    // Only proceed if we have a loaded dashboard
    if (state is! DashboardLoaded) {
      loggy.warning('Cannot load preferences: Dashboard not in loaded state');
      return;
    }
    
    try {
      final currentState = state as DashboardLoaded;
      
      // Get current user ID
      final userId = await AuthHelper.getCurrentUserId();
      if (userId == null) {
        loggy.info('No user ID available, skipping preferences load');
        return;
      }
      
      loggy.info('Loading preferences for user: $userId');
      final response = await preferencesRepo.getUserPreferences(userId);
      
      if (response['success'] == true && response['data'] != null) {
        final prefsData = UserPreferencesModel.fromJson(response['data']);
        
        loggy.info('Loaded preferences: ${prefsData.selectedSites.length} sites');
        
        // Verify if the preferences contain sites
        if (prefsData.selectedSites.isEmpty) {
          loggy.info('Loaded preferences contain no selected sites');
        } else {
          // Log a sample of the loaded sites to verify data structure
          for (int i = 0; i < min(prefsData.selectedSites.length, 3); i++) {
            final site = prefsData.selectedSites[i];
            loggy.info('Loaded site ${i+1}: ${site.name} (ID: ${site.id})');
          }
        }
        
        // Update the state with user preferences
        emit(DashboardLoaded(
          currentState.response, 
          userPreferences: prefsData
        ));
      } else if (response['auth_error'] == true) {
        loggy.warning('Authentication error when loading preferences');
        // Handle auth error - possibly redirect to login or refresh token
      } else {
        loggy.warning('Failed to load user preferences: ${response['message']}');
      }
    } catch (e) {
      loggy.error('Error loading user preferences: $e');
      // Don't emit error state here, just log it
    }
  }
  
  // Helper to get minimum of two integers
  int min(int a, int b) => a < b ? a : b;
}