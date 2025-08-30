import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';
import 'package:geolocator/geolocator.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/profile/pages/components/privacy_countries_filter.dart';
import 'package:airqo/src/app/profile/pages/components/privacy_location_list_view.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/utils/location_helpers.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/location_search_bar.dart';
import 'package:airqo/src/app/shared/pages/error_page.dart';

class AddLocationScreen extends StatefulWidget with UiLoggy {
  const AddLocationScreen({super.key});

  @override
  State<AddLocationScreen> createState() => _AddLocationScreenState();
}

class _AddLocationScreenState extends State<AddLocationScreen> with UiLoggy {
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
  static const int maxLocations = 10; // Privacy zones can have more locations than favorites
  bool isHtmlError = false;
  Position? _userPosition;
  static const int _maxNearbyLocations = 4;
  static const double _defaultSearchRadius = 10.0;

  @override
  void initState() {
    super.initState();
    loggy.info('AddLocationScreen initState called');
    selectedLocations = {};
    googlePlacesBloc = context.read<GooglePlacesBloc>();
    googlePlacesBloc!.add(ResetGooglePlaces());
    
    _initializeLocation();

    final dashboardBloc = context.read<DashboardBloc>();
    final currentState = dashboardBloc.state;
    loggy.info('Current dashboard state: ${currentState.runtimeType}');

    if (currentState is DashboardLoaded &&
        currentState.response.measurements != null) {
      loggy.info('Dashboard already loaded, populating measurements');
      _populateMeasurements(currentState.response.measurements!);
    } else {
      dashboardBloc.add(LoadDashboard());
    }
  }

  Future<void> _initializeLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        loggy.warning('Location services are disabled');
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          loggy.warning('Location permission denied');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        loggy.warning('Location permissions are permanently denied');
        return;
      }

      // Try to get last known position first for quick response
      Position? position = await Geolocator.getLastKnownPosition();
      if (position != null) {
        setState(() {
          _userPosition = position;
        });
        loggy.info('Got last known position: ${position.latitude}, ${position.longitude}');
      }
      
      // Then get current position for more accuracy
      try {
        position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 5),
          ),
        );
        
        setState(() {
          _userPosition = position;
        });
        loggy.info('Got current position: ${position.latitude}, ${position.longitude}');
      } catch (e) {
        loggy.warning('Could not get current position, using last known: $e');
      }
    } catch (e) {
      loggy.error('Error initializing location: $e');
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

  void _filterNearYou() {
    loggy.info('Filtering by Near you');
    setState(() {
      currentFilter = "Near you";
      
      if (_userPosition == null) {
        loggy.warning('No user position available for Near you filter');
        filteredMeasurements = [];
        return;
      }
      
      // Calculate distances to all measurements and get the closest 4
      final measWithDistance = <MapEntry<Measurement, double>>[];
      
      for (final measurement in allMeasurements) {
        final siteDetails = measurement.siteDetails;
        if (siteDetails == null || measurement.siteId == null) continue;
        
        double? latitude = siteDetails.approximateLatitude ?? siteDetails.siteCategory?.latitude;
        double? longitude = siteDetails.approximateLongitude ?? siteDetails.siteCategory?.longitude;
        
        if (latitude == null || longitude == null) continue;
        
        final distance = _calculateDistance(
          _userPosition!.latitude,
          _userPosition!.longitude, 
          latitude, 
          longitude
        );
        
        // Only include locations within the search radius
        if (distance <= _defaultSearchRadius) {
          measWithDistance.add(MapEntry(measurement, distance));
        }
      }
      
      // Sort by distance (closest first) and take the first 4
      measWithDistance.sort((a, b) => a.value.compareTo(b.value));
      filteredMeasurements = measWithDistance.length > _maxNearbyLocations
          ? measWithDistance.sublist(0, _maxNearbyLocations).map((e) => e.key).toList()
          : measWithDistance.map((e) => e.key).toList();
      
      loggy.info('Found ${filteredMeasurements.length} nearby locations within ${_defaultSearchRadius}km');
    });
  }

  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) / 1000; // Convert to kilometers
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

  void _toggleLocationSelection(Measurement measurement, bool selected) {
    final String? siteId = measurement.siteId;

    if (siteId != null) {
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
                        'Maximum of $maxLocations privacy locations reached',
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

          selectedLocations.add(siteId);
          showLocationLimitError = false;

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Location added to privacy zone',
                style: TextStyle(color: Colors.white),
              ),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 1),
              behavior: SnackBarBehavior.floating,
            ),
          );
        } else {
          selectedLocations.remove(siteId);
          showLocationLimitError = false;

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Location removed from privacy zone',
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

  void _saveSelectedLocations() {

    // Return full Measurement objects for privacy zones
    final selectedMeasurements = allMeasurements
        .where((measurement) => selectedLocations.contains(measurement.siteId))
        .toList();
    
    loggy.info('Saving ${selectedMeasurements.length} privacy zone measurements');
    
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

    Navigator.pop(context, selectedMeasurements);
  }

  void _retryLoading() {
    loggy.info('Retry button pressed in AddLocationScreen');
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
          loggy.info('BlocListener: DashboardLoaded received in AddLocationScreen');
          if (state.response.measurements != null) {
            _populateMeasurements(state.response.measurements!);
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
          loggy.error('Dashboard loading error in AddLocationScreen: ${state.message}');

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
            'Add Zone',
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
      return Center(
          child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.9,
                maxHeight: MediaQuery.of(context).size.height * 0.8,
              ),
              child: ErrorPage()));
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
        PrivacyCountriesFilter(
          currentFilter: currentFilter,
          onFilterSelected: _filterByCountry,
          onResetFilter: _resetFilter,
          onNearYouSelected: _filterNearYou,
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
          child: PrivacyLocationListView(
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
              onPressed: selectedLocations.isEmpty
                  ? null
                  : _saveSelectedLocations,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                disabledForegroundColor: Colors.white.withValues(alpha: 0.7),
                disabledBackgroundColor:
                    AppColors.primaryColor.withValues(alpha: 0.5),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
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