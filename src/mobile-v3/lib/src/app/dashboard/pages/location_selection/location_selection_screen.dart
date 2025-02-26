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
import 'package:airqo/src/app/shared/utils/connectivity_helper.dart';

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

    if (currentState is! DashboardLoaded) {
      loggy.info('Dispatching LoadDashboard event');
      dashboardBloc.add(LoadDashboard());
    } else {
      loggy.info('Dashboard already loaded, populating measurements');
      if (currentState.response.measurements != null) {
        loggy.info(
            'Found ${currentState.response.measurements!.length} measurements in loaded state');
        _populateMeasurements(currentState.response.measurements!);
      } else {
        loggy.warning('No measurements in loaded state');
        setState(() {
          isLoading = false;
          errorMessage = "No measurements available in loaded state";
        });
      }
    }
  }

  Future<void> _initializeUserData() async {
    try {
      final userId = await AuthHelper.getCurrentUserId();

      if (userId != null) {
        setState(() {
          currentUserId = userId;
        });

        // Load user preferences
        await _loadUserPreferences(userId);
      } else {
        loggy.warning('No user ID found - user might not be logged in');
      }
    } catch (e) {
      loggy.error('Error initializing user data: $e');
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

  Future<void> _saveSelectedLocations() async {
    loggy.info(
        'Save button pressed with ${selectedLocations.length} selected locations');

    // If no user ID, we can't save preferences
    if (currentUserId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Cannot save locations: User not logged in')),
      );
      return;
    }

    // Check connectivity first
    final hasConnection = await ConnectivityHelper.isConnected();
    if (!hasConnection) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text(
                'No internet connection. Please try again when connected.')),
      );
      return;
    }

    setState(() {
      isSaving = true;
    });

    try {
      // Create list of selected site objects using the correct fields from your Measurement model
      final List<Map<String, dynamic>> selectedSites =
          selectedLocations.map((id) {
        final measurement = allMeasurements.firstWhere(
          (m) => m.id == id,
          orElse: () => throw Exception('Measurement not found for ID $id'),
        );

        // Extract site details from the measurement
        return {
          "_id": id,
          "name": measurement.siteDetails?.name ?? 'Unknown Location',
          "search_name": measurement.siteDetails?.searchName ??
              measurement.siteDetails?.name ??
              'Unknown Location',
          "latitude": measurement.siteDetails?.approximateLatitude ??
              measurement.siteDetails?.approximateLatitude,
          "longitude": measurement.siteDetails?.approximateLongitude ??
              measurement.siteDetails?.approximateLongitude,
        };
      }).toList();

      // Prepare the request body
      final Map<String, dynamic> requestBody = {
        "user_id": currentUserId,
        "selected_sites": selectedSites,
      };

      // Call the repository
      final response = await _preferencesRepo.replacePreference(requestBody);

      if (response['success'] == true) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Locations saved successfully')),
        );
        Navigator.pop(context, selectedLocations.toList());
      } else {
        // Show error message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content:
                  Text('Failed to save locations: ${response["message"]}')),
        );
      }
    } catch (e) {
      loggy.error('Error saving locations: $e');
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
