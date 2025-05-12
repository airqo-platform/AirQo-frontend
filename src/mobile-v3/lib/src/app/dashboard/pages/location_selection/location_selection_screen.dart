import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';
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
import 'package:airqo/src/app/shared/pages/error_page.dart';

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
  bool isHtmlError = false;

  @override
  void initState() {
    super.initState();
    loggy.info('initState called');
    selectedLocations = {};
    _initializeUserData();
    googlePlacesBloc = context.read<GooglePlacesBloc>();
    googlePlacesBloc!.add(ResetGooglePlaces());

    final dashboardBloc = context.read<DashboardBloc>();
    final currentState = dashboardBloc.state;
    loggy.info('Current dashboard state: ${currentState.runtimeType}');

    if (currentState is DashboardLoaded &&
        currentState.response.measurements != null) {
      loggy.info('Dashboard already loaded, populating measurements');
      _populateMeasurements(currentState.response.measurements!);
      _syncSelectedLocations(currentState);
    } else {
      dashboardBloc.add(LoadDashboard());
    }
  }

  void _syncSelectedLocations(DashboardLoaded state) {
    if (state.userPreferences != null &&
        state.userPreferences!.selectedSites.isNotEmpty) {
      final existingIds =
          state.userPreferences!.selectedSites.map((site) => site.id).toSet();
      loggy.info(
          'Syncing selected locations: ${existingIds.length} found - $existingIds');
      setState(() {
        selectedLocations = existingIds;
      });
    } else {
      loggy.info(
          'No user preferences or empty selected sites, resetting to empty');
      setState(() {
        selectedLocations = {};
      });
    }
  }

  Future<void> _initializeUserData() async {
    try {
      loggy.info('⭐ Starting to initialize user data');

      await AuthHelper.debugToken();

      final authState = context.read<AuthBloc>().state;
      loggy.info('Current auth state: ${authState.runtimeType}');

      final isLoggedIn = authState is AuthLoaded;
      loggy.info('Is user logged in according to AuthBloc? $isLoggedIn');

      if (isLoggedIn) {
        final isExpired = await TokenDebugger.checkTokenExpiration();

        if (isExpired) {
          loggy.warning('Token is expired, user needs to login again');

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text(
                    'Your session has expired. Please log in again.'),
                duration: const Duration(seconds: 8),
                action: SnackBarAction(
                  label: 'Log In',
                  onPressed: () {
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
      }
    } catch (e) {
      loggy.error('❌ Error initializing user data: $e');
      loggy.error('Stack trace: ${StackTrace.current}');
    }
  }

  Future<void> _saveSelectedLocations() async {
    loggy.info(
        'Save button pressed with ${selectedLocations.length} selected locations');

    await AuthHelper.debugToken();

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
      final dashboardBloc = context.read<DashboardBloc>();
      final locationIdsList = selectedLocations.toList();

      loggy.info(
          'Dispatching UpdateSelectedLocations with ${locationIdsList.length} locations');

      dashboardBloc.add(UpdateSelectedLocations(locationIdsList));

      loggy.info('✅ Successfully dispatched update event');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Locations saved successfully',
            style: TextStyle(color: Colors.white),
          ),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 1),
          behavior: SnackBarBehavior.floating,
        ),
      );

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
          if (selectedLocations.length >= maxLocations) {
            showLocationLimitError = true;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, color: Colors.white),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Maximum of $maxLocations favorite locations reached',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
                backgroundColor: Colors.red,
                duration: Duration(seconds: 3),
                behavior: SnackBarBehavior.floating,
                action: SnackBarAction(
                  label: 'Got it',
                  textColor: Colors.white,
                  onPressed: () {
                    ScaffoldMessenger.of(context).hideCurrentSnackBar();
                  },
                ),
              ),
            );
            return;
          }

          selectedLocations.add(id);
          showLocationLimitError = false;

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Location added to favorites',
                style: TextStyle(color: Colors.white),
              ),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 1),
              behavior: SnackBarBehavior.floating,
            ),
          );
        } else {
          selectedLocations.remove(id);
          showLocationLimitError = false;

          // Show a message when a location is removed from favorites
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Location removed from favorites',
                style: TextStyle(color: Colors.white),
              ),
              backgroundColor: Colors.blueGrey,
              duration: Duration(seconds: 1),
              behavior: SnackBarBehavior.floating,
            ),
          );
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
      isHtmlError = false;
    });
  }

  bool _checkForHtmlError(String message) {
    return message.contains("<html>") ||
        message.contains("<!DOCTYPE") ||
        message.contains("Unexpected character");
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<DashboardBloc, DashboardState>(
      listener: (context, state) {
        if (state is DashboardLoaded) {
          loggy.info('BlocListener: DashboardLoaded received');
          if (state.response.measurements != null) {
            _populateMeasurements(state.response.measurements!);
            _syncSelectedLocations(state);
          } else {
            setState(() {
              isLoading = false;
              errorMessage = "No measurements available";
            });
          }
        } else if (state is DashboardLoading) {
          setState(() {
            isLoading = true;
          });
        } else if (state is DashboardLoadingError) {
          setState(() {
            isLoading = false;
            errorMessage = state.message;
            isHtmlError = _checkForHtmlError(state.message);
          });
          loggy.error('Dashboard loading error: ${state.message}');

          if (isHtmlError) {
            loggy.error(
                'HTML error detected, API returning HTML instead of JSON');
          }
        }
      },
      child: Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            'Select Locations',
            style: TextStyle(
                color: Theme.of(context).textTheme.headlineLarge?.color,
                fontSize: 24,
                fontWeight: FontWeight.w700),
          ),
          actions: [
            IconButton(
              icon: Icon(Icons.close,
                  color: Theme.of(context).textTheme.headlineLarge?.color),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
        body: _buildBody(context),
      ),
    );
  }

  Widget _buildBody(BuildContext context) {
    if (isHtmlError && !isLoading) {
      return ErrorPage();
    }

    if (errorMessage != null &&
        (errorMessage!.contains("Failed to") ||
            errorMessage!.contains("Error") ||
            errorMessage!.contains("Exception")) &&
        !isLoading) {
      return Stack(
        children: [
          Positioned.fill(
            child: Center(
              child: ErrorPage(),
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        LocationSearchBar(
          controller: searchController,
          onChanged: _handleSearch,
        ),
        const SizedBox(height: 16),
        CountriesFilter(
          currentFilter: currentFilter,
          onFilterSelected: _filterByCountry,
          onResetFilter: _resetFilter,
        ),
        if (showLocationLimitError)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'You can select up to $maxLocations locations only',
              style: TextStyle(
                color: Colors.red[400],
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Text(
                'Selected: ${selectedLocations.length}/$maxLocations',
                style: TextStyle(
                  color: Theme.of(context).textTheme.headlineSmall?.color,
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              if (selectedLocations.isNotEmpty)
                TextButton.icon(
                  onPressed: () {
                    setState(() {
                      selectedLocations.clear();
                    });
                  },
                  icon: Icon(Icons.clear_all, size: 18),
                  label: Text(
                    "Clear All",
                    style: TextStyle(
                      fontSize: 14,
                    ),
                  ),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.red[400],
                  ),
                ),
            ],
          ),
        ),
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
                foregroundColor: Colors.white,
                disabledForegroundColor: Colors.white.withOpacity(0.7),
                disabledBackgroundColor:
                    AppColors.primaryColor.withOpacity(0.5),
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
                      'Save ${selectedLocations.length} Location${selectedLocations.length != 1 ? 's' : ''}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
            ),
          ),
        ),
      ],
    );
  }
}
