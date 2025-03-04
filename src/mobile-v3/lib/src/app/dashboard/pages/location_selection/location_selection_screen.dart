import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/countries_filter.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/location_list_view.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/utils/location_helpers.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/location_search_bar.dart';
import 'package:airqo/src/app/dashboard/repository/user_preferences_repository.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/pages/login_page.dart';
import 'package:airqo/src/app/auth/services/token_debugger.dart';

import 'package:loggy/loggy.dart';

class LocationSelectionScreen extends StatefulWidget with UiLoggy {
  const LocationSelectionScreen({super.key});

  @override
  State<LocationSelectionScreen> createState() =>
      _LocationSelectionScreenState();
}

class _LocationSelectionScreenState extends State<LocationSelectionScreen>
    with UiLoggy {
  bool showDetails = false;
  Measurement? currentDetails;
  String? currentDetailsName;
  Set<String> selectedLocations = {};
  TextEditingController searchController = TextEditingController();
  GooglePlacesBloc? googlePlacesBloc;
  List<Measurement> localSearchResults = [];
  List<Measurement> allMeasurements = [];
  List<Measurement> filteredMeasurements = [];
  String currentFilter = "All";
  bool isLoading = true;
  String? errorMessage;
  bool showLocationLimitError = false;
  static const int maxLocations = 4;
  final UserPreferencesRepository _preferencesRepo = UserPreferencesImpl();
  bool isSaving = false;
  String? currentUserId;
  UserPreferencesModel? userPreferences;

  @override
void initState() {
  super.initState();
  loggy.info('initState called');

  _initializeUserData();

  googlePlacesBloc = context.read<GooglePlacesBloc>()
    ..add(ResetGooglePlaces());

  loggy.info('Checking dashboard state');
  final dashboardBloc = context.read<DashboardBloc>();
  final currentState = dashboardBloc.state;
  loggy.info('Current dashboard state: ${currentState.runtimeType}');

  if (currentState is DashboardLoaded) {
    loggy.info('Dashboard already loaded, populating measurements');
    if (currentState.response.measurements != null) {
      loggy.info(
          'Found ${currentState.response.measurements!.length} measurements in loaded state');
      _populateMeasurements(currentState.response.measurements!);
      
      // IMPORTANT ADDITION: Pre-select existing locations from the current DashboardState
      if (currentState.userPreferences != null &&
          currentState.userPreferences!.selectedSites.isNotEmpty) {
        final existingIds = currentState.userPreferences!.selectedSites
            .map((site) => site.id)
            .toSet();
            
        loggy.info('Pre-selecting ${existingIds.length} existing locations from dashboard state');
        setState(() {
          selectedLocations = existingIds;
        });
      }
    } else {
      loggy.warning('No measurements in loaded state');
      setState(() {
        isLoading = false;
        errorMessage = "No measurements available in loaded state";
      });
    }
  } else {
    loggy.info('Dispatching LoadDashboard event');
    dashboardBloc.add(LoadDashboard());
  }
}

  Future<void> _initializeUserData() async {
    try {
      loggy.info('⭐ Starting to initialize user data');

      // Debug token information
      await AuthHelper.debugToken();

      final authState = context.read<AuthBloc>().state;
      loggy.info('Current auth state: ${authState.runtimeType}');

      final isLoggedIn = authState is AuthLoaded;
      loggy.info('Is user logged in according to AuthBloc? $isLoggedIn');

      if (isLoggedIn) {
        // Use the enhanced token checker
        final isExpired = await TokenDebugger.checkTokenExpiration();

        if (isExpired) {
          loggy.warning('Token is expired, user needs to login again');

          // Show SnackBar with action button to navigate to login
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text(
                    'Your session has expired. Please log in again.'),
                duration: const Duration(seconds: 8),
                action: SnackBarAction(
                  label: 'Log In',
                  onPressed: () {
                    // Navigate directly to login screen
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(
                        builder: (context) => const LoginPage(),
                      ),
                      (route) => false,
                    );
                  },
                ),
              ),
            );
          }
          return;
        }

        // Token valid, proceed to get user ID
        final userId = await AuthHelper.getCurrentUserId();
        loggy.info('Retrieved user ID: ${userId ?? "NULL"}');

        if (userId != null) {
          setState(() {
            currentUserId = userId;
          });
          loggy.info('✅ User ID set in state: $currentUserId');

          await _loadUserPreferences(userId);
        } else {
          loggy.warning('❌ No user ID found in token - token may be invalid');

          // Optionally, show a message to the user
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text(
                      'Authentication issue detected. Please log in again.')),
            );
          }
        }
      } else {
        loggy.warning('❌ User is not logged in according to AuthBloc');
        // You could show a login prompt here
      }
    } catch (e) {
      loggy.error('❌ Error initializing user data: $e');
      loggy.error('Stack trace: ${StackTrace.current}');
    }
  }
// 2. Modification to the location_selection_screen.dart file
// File: src/mobile-v3/lib/src/app/dashboard/pages/location_selection/location_selection_screen.dart

// Update the _saveSelectedLocations method in the LocationSelectionScreen
Future<void> _saveSelectedLocations() async {
  loggy.info(
      'Save button pressed with ${selectedLocations.length} selected locations');

  // Debug token
  await AuthHelper.debugToken();

  // Check auth state from the bloc
  final authState = context.read<AuthBloc>().state;
  final isLoggedIn = authState is AuthLoaded;

  loggy.info('Current auth state: ${authState.runtimeType}');
  loggy.info('Is user logged in? $isLoggedIn');

  if (!isLoggedIn) {
    loggy.warning('❌ User not logged in, cannot save');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Please log in to save your locations')),
    );
    return;
  }

  // Use enhanced token checker
  final isExpired = await TokenDebugger.checkTokenExpiration();

  if (isExpired) {
    loggy.warning('❌ Token is expired, cannot save');

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Your session has expired. Please log in again.'),
        duration: const Duration(seconds: 8),
        action: SnackBarAction(
          label: 'Log In',
          onPressed: () {
            // Navigate directly to login screen
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(
                builder: (context) => const LoginPage(),
              ),
              (route) => false,
            );
          },
        ),
      ),
    );
    return;
  }
  
  setState(() {
    isSaving = true;
  });

  try {
    // IMPORTANT CHANGE: Instead of creating a new preference, we dispatch
    // the UpdateSelectedLocations event to the DashboardBloc, which will
    // merge these with existing locations
    
    final dashboardBloc = context.read<DashboardBloc>();
    
    // Convert the Set to a List
    final locationIdsList = selectedLocations.toList();
    
    loggy.info('Dispatching UpdateSelectedLocations with ${locationIdsList.length} locations');
    
    // Dispatch the event
    dashboardBloc.add(UpdateSelectedLocations(locationIdsList));
    
    // Show success message
    loggy.info('✅ Successfully dispatched update event');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Locations saved successfully')),
    );
    
    // Return to previous screen with the selected locations
    Navigator.pop(context, locationIdsList);
  } catch (e) {
    loggy.error('❌ Error saving locations: $e');
    loggy.error('Stack trace: ${StackTrace.current}');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
          content: Text(
              'An error occurred while saving locations: ${e.toString()}')),
    );
  } finally {
    if (mounted) {
      setState(() {
        isSaving = false;
      });
    }
  }
}



  Future<void> _loadUserPreferences(String userId) async {
    try {
      final response = await _preferencesRepo.getUserPreferences(userId);

      if (response['success'] == true && response['data'] != null) {
        final prefsData = UserPreferencesModel.fromJson(response['data']);

        setState(() {
          userPreferences = prefsData;

          // Pre-select any saved locations
          if (prefsData.selectedSites.isNotEmpty) {
            selectedLocations =
                prefsData.selectedSites.map((site) => site.id).toSet();

            loggy.info(
                'Loaded ${selectedLocations.length} previously selected locations');
          }
        });
      }
    } catch (e) {
      loggy.error('Error loading user preferences: $e');
    }
  }

  void _populateMeasurements(List<Measurement> measurements) {
    LocationHelper.populateMeasurements(measurements,
        onSuccess: (finalMeasurements) {
      setState(() {
        allMeasurements = finalMeasurements;
        isLoading = false;
      });
      loggy.info(
          'State updated with ${allMeasurements.length} measurements, isLoading=$isLoading');
    });
  }

  void _handleSearch(String value) {
    loggy.info('Search text changed to: "$value"');
    if (value.isEmpty) {
      loggy.info('Search cleared, resetting Google Places');
      googlePlacesBloc!.add(ResetGooglePlaces());
      setState(() {
        localSearchResults = [];
      });
    } else {
      loggy.info('Searching for: "$value"');
      googlePlacesBloc!.add(SearchPlace(value));
      setState(() {
        localSearchResults =
            LocationHelper.searchAirQualityLocations(value, allMeasurements);
      });
    }
  }

  void _filterByCountry(String country) {
    loggy.info('Filtering by country: $country');
    setState(() {
      filteredMeasurements =
          LocationHelper.filterByCountry(country, allMeasurements);
      currentFilter = country;
    });
  }

  void _resetFilter() {
    loggy.info('Resetting filter');
    setState(() {
      filteredMeasurements = [];
      currentFilter = "All";
    });
  }

  void _viewDetails({Measurement? measurement, String? placeName}) {
    if (measurement != null) {
      loggy.info('Viewing details for measurement with id: ${measurement.id}');
      setState(() {
        showDetails = true;
        currentDetails = measurement;
      });
    } else if (measurement == null && placeName != null) {
      loggy.info('Viewing details for place: $placeName');
      googlePlacesBloc!.add(GetPlaceDetails(placeName));
      setState(() {
        showDetails = true;
        currentDetailsName = placeName;
      });
    }
  }

  void _toggleLocationSelection(String? id, bool selected) {
    if (id != null) {
      setState(() {
        if (selected) {
          // Check if we're already at max locations before adding
          if (selectedLocations.length >= maxLocations) {
            showLocationLimitError = true;
            // Don't add the location
            return;
          }

          selectedLocations.add(id);
          showLocationLimitError = false;
        } else {
          selectedLocations.remove(id);
          showLocationLimitError = false;
        }
      });
    }
  }

  void _retryLoading() {
    loggy.info('Retry button pressed');
    context.read<DashboardBloc>().add(LoadDashboard());
    setState(() {
      isLoading = true;
      errorMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    loggy.debug('build method called');

    return BlocListener<DashboardBloc, DashboardState>(
      listener: (context, state) {
        loggy.info('Dashboard state changed to ${state.runtimeType}');

        if (state is DashboardLoaded) {
          loggy.info(
              'Dashboard loaded with ${state.response.measurements?.length ?? 0} measurements');

          if (state.response.measurements != null) {
            _populateMeasurements(state.response.measurements!);
          } else {
            loggy.warning('Dashboard loaded but measurements is null');
            setState(() {
              isLoading = false;
              errorMessage = "No measurements available";
            });
          }
        } else if (state is DashboardLoading) {
          loggy.info('Dashboard is loading');
        } else if (state is DashboardLoadingError) {
          loggy.error('Dashboard loading error: ${state.message}');
          setState(() {
            isLoading = false;
            errorMessage = state.message;
          });
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF121212),
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            'Add location',
            style: TextStyle(
                color: AppColors.boldHeadlineColor,
                fontSize: 24,
                fontWeight: FontWeight.w700),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.close, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
        body: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Search Bar
          LocationSearchBar(
            controller: searchController,
            onChanged: _handleSearch,
          ),

          const SizedBox(height: 16),

          // Countries Filter
          CountriesFilter(
            currentFilter: currentFilter,
            onFilterSelected: _filterByCountry,
            onResetFilter: _resetFilter,
          ),

          // Error message for location limit
          if (showLocationLimitError)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                'You can select up to 4 locations only',
                style: TextStyle(
                  color: Colors.red[400],
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'All locations',
              style: TextStyle(
                color: Colors.grey[400],
                fontSize: 20,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),

          // Locations List
          Expanded(
            child: LocationListView(
              isLoading: isLoading,
              errorMessage: errorMessage,
              onRetry: _retryLoading,
              searchController: searchController,
              currentFilter: currentFilter,
              allMeasurements: allMeasurements,
              filteredMeasurements: filteredMeasurements,
              localSearchResults: localSearchResults,
              selectedLocations: selectedLocations,
              onToggleSelection: _toggleLocationSelection,
              onViewDetails: _viewDetails,
              onResetFilter: _resetFilter,
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: selectedLocations.isEmpty || isSaving
                    ? null
                    : _saveSelectedLocations,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: isSaving
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Text(
                        'Save (${selectedLocations.length}) Locations',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
              ),
            ),
          ),
        ]),
      ),
    );
  }
}
