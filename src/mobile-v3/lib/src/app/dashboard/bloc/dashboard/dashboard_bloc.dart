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

      UserPreferencesModel? preferences;

      try {
        final userId = await AuthHelper.getCurrentUserId();
        if (userId != null) {
          loggy.info(
              'Loading preferences during dashboard load for user: $userId');
          final prefsResponse =
              await preferencesRepo.getUserPreferences(userId);

          // Debug log to see the structure of the response
          loggy.info(
              'Preference response structure: ${prefsResponse.keys.toList()}');

          if (prefsResponse['success'] == true) {
            try {
              // New parsing strategy for the list-based preferences
              if (prefsResponse['preferences'] is List &&
                  prefsResponse['preferences'].isNotEmpty) {
                // Take the first item in the preferences list
                final preferenceData = prefsResponse['preferences'].first;

                // Ensure it's a Map before parsing
                if (preferenceData is Map<String, dynamic>) {
                  preferences = UserPreferencesModel.fromJson(preferenceData);

                  loggy.info(
                      'Successfully loaded preferences with ${preferences.selectedSites.length} sites');
                }
              }

              // Fallback parsing strategies
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

      // Emit loaded state with preferences (if loaded) or null
      emit(DashboardLoaded(response, userPreferences: preferences));

      // If preferences failed to load initially, try again as a separate event
      if (preferences == null) {
        loggy.info(
            'Preferences not loaded initially, retrying as separate event');
        add(LoadUserPreferences());
      }
    } catch (e) {
      loggy.error('Error loading dashboard: $e');
      emit(DashboardLoadingError(e.toString()));
    }
  }


  Future<void> _handleUpdateSelectedLocations(
    List<String> locationIds, Emitter<DashboardState> emit) async {
  if (state is! DashboardLoaded) return;

  try {
    final currentState = state as DashboardLoaded;
    final userId = await AuthHelper.getCurrentUserId();

    if (userId == null) {
      loggy.warning('Cannot update preferences: No user ID available');
      return;
    }
    
    loggy.info('Updating selected locations for user $userId with ${locationIds.length} IDs');
    for (final id in locationIds) {
      loggy.info('Selected location ID: $id');
    }

    // Get existing preferences to merge with new selections
    List<Map<String, dynamic>> selectedSites = [];
    Set<String> existingSiteIds = {};

    // If we have existing preferences, first include ALL existing sites
    if (currentState.userPreferences != null) {
      for (var site in currentState.userPreferences!.selectedSites) {
        loggy.info('Including existing site ${site.name} (ID: ${site.id})');
        selectedSites.add({
          "_id": site.id,
          "name": site.name,
          "search_name": site.searchName ?? site.name,
          "latitude": site.latitude,
          "longitude": site.longitude,
          "createdAt": DateTime.now().toIso8601String(),
        });
        existingSiteIds.add(site.id);
      }
    }

    // Now add any new selections that weren't already in the existing preferences
    for (final id in locationIds) {
      // Skip if already included from existing preferences
      if (existingSiteIds.contains(id)) {
        continue;
      }

      // Try to find details for this new location
      Measurement? matchingMeasurement;
      
      // First try direct ID match
      matchingMeasurement = currentState.response.measurements
          ?.where((m) => m.id == id).firstOrNull;
      
      // If not found, try siteId match
      matchingMeasurement ??= currentState.response.measurements
            ?.where((m) => m.siteId == id).firstOrNull;
      
      // If still not found, try siteDetails.id match
      matchingMeasurement ??= currentState.response.measurements
            ?.where((m) => m.siteDetails?.id == id).firstOrNull;

      if (matchingMeasurement != null) {
        loggy.info('Adding new location: ${matchingMeasurement.siteDetails?.name}');
        
        // Determine which coordinates to use (prioritize the most specific ones)
        double? latitude = matchingMeasurement.siteDetails?.approximateLatitude;
        double? longitude = matchingMeasurement.siteDetails?.approximateLongitude;
        
        if (latitude == null || longitude == null) {
          latitude = matchingMeasurement.siteDetails?.siteCategory?.latitude;
          longitude = matchingMeasurement.siteDetails?.siteCategory?.longitude;
        }
        
        selectedSites.add({
          "_id": id,
          "name": matchingMeasurement.siteDetails?.name ?? 'Unknown Location',
          "search_name": matchingMeasurement.siteDetails?.searchName ??
              matchingMeasurement.siteDetails?.name ??
              'Unknown Location',
          "latitude": latitude,
          "longitude": longitude,
          "createdAt": DateTime.now().toIso8601String(),
        });
      } else {
        loggy.warning('Could not find details for new location ID: $id');
      }
    }

    // Prepare request body
    final Map<String, dynamic> requestBody = {
      "user_id": userId,
      "selected_sites": selectedSites,
    };

    loggy.info(
        'Updating preferences with ${selectedSites.length} locations');
        
    // Log the exact data being sent
    for (var site in selectedSites) {
      loggy.info('Selected site: ${site["name"]} (ID: ${site["_id"]})');
    }
    
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

        loggy.info(
            'Loaded preferences: ${prefsData.selectedSites.length} sites');

        // Verify if the preferences contain sites
        if (prefsData.selectedSites.isEmpty) {
          loggy.info('Loaded preferences contain no selected sites');
        } else {
          // Log a sample of the loaded sites to verify data structure
          for (int i = 0; i < min(prefsData.selectedSites.length, 3); i++) {
            final site = prefsData.selectedSites[i];
            loggy.info('Loaded site ${i + 1}: ${site.name} (ID: ${site.id})');
          }
        }

        // Update the state with user preferences
        emit(
            DashboardLoaded(currentState.response, userPreferences: prefsData));
      } else if (response['auth_error'] == true) {
        loggy.warning('Authentication error when loading preferences');

        // Notify the AuthBloc about the authentication error
        // You can add code here to dispatch an event to the AuthBloc
        // For example:
        // context.read<AuthBloc>().add(AuthTokenExpired());

        // For now, we'll just continue without user preferences
      } else {
        loggy
            .warning('Failed to load user preferences: ${response['message']}');
      }
    } catch (e) {
      loggy.error('Error loading user preferences: $e');
      // Don't emit error state here, just log it
    }
  }

  // Helper to get minimum of two integers
  int min(int a, int b) => a < b ? a : b;
}
