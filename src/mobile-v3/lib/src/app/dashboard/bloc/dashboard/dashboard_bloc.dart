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

      AirQualityResponse response = await repository.fetchAirQualityReadings();
      
      // If we have a current state with preferences, keep them
      UserPreferencesModel? preferences;
      if (state is DashboardLoaded) {
        preferences = (state as DashboardLoaded).userPreferences;
      }
      
      emit(DashboardLoaded(response, userPreferences: preferences));
      
      // After loading dashboard, try to load user preferences
      add(LoadUserPreferences());
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
      
      // Get the measurements corresponding to the selected location IDs
      final selectedMeasurements = currentState.response.measurements
          ?.where((m) => m.id != null && locationIds.contains(m.id))
          .toList() ?? [];
      
      // Create the selected sites list for the API
      final List<Map<String, dynamic>> selectedSites = selectedMeasurements.map((m) {
        return {
          "_id": m.id,
          "name": m.siteDetails?.name ?? 'Unknown Location',
          "search_name": m.siteDetails?.searchName ?? m.siteDetails?.name ?? 'Unknown Location',
          "latitude": m.siteDetails?.approximateLatitude ?? m.siteDetails?.approximateLatitude,
          "longitude": m.siteDetails?.approximateLongitude ?? m.siteDetails?.approximateLongitude,
        };
      }).toList();
      
      // Prepare request body
      final Map<String, dynamic> requestBody = {
        "user_id": userId,
        "selected_sites": selectedSites,
      };
      
      loggy.info('Updating preferences with ${selectedSites.length} locations');
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
    if (state is! DashboardLoaded) return;
    
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
        
        // Update the state with user preferences
        emit(DashboardLoaded(
          currentState.response, 
          userPreferences: prefsData
        ));
      } else {
        loggy.warning('Failed to load user preferences: ${response['message']}');
      }
    } catch (e) {
      loggy.error('Error loading user preferences: $e');
      // Don't emit error state here, just log it
    }
  }
}