import 'package:airqo/src/app/dashboard/widgets/nearby_measurement_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/widgets/nearby_view_empty_state.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class NearbyView extends StatefulWidget {
  const NearbyView({super.key});

  @override
  State<NearbyView> createState() => _NearbyViewState();
}

class _NearbyViewState extends State<NearbyView> with UiLoggy {
  bool _isLoading = true;
  String? _errorMessage;
  Position? _userPosition;
  List<MapEntry<Measurement, double>> _nearbyMeasurementsWithDistance = [];
  static const int _maxNearbyLocations = 4;
  static const double _defaultSearchRadius = 10.0;

  @override
  void initState() {
    super.initState();
    _initializeLocationAndData();
  }

  Future<void> _initializeLocationAndData() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      // First check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _isLoading = false;
          _errorMessage =
              'Location services are disabled. Please enable location services in your device settings.';
        });
        return;
      }

      // Check permission status
      LocationPermission permission = await Geolocator.checkPermission();

      if (permission == LocationPermission.denied) {
        // Request permission
        permission = await Geolocator.requestPermission();

        if (permission == LocationPermission.denied) {
          setState(() {
            _isLoading = false;
            _errorMessage =
                'Location permission denied. Please grant location permission to see air quality data near you.';
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _isLoading = false;
          _errorMessage =
              'Location permissions are permanently denied. Please enable location in app settings.';
        });
        return;
      }

      // Get user position
      try {
        final position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 15),
        );

        loggy.info(
            'Retrieved user position: ${position.latitude}, ${position.longitude}');

        setState(() {
          _userPosition = position;
        });

        // Load dashboard data
        context.read<DashboardBloc>().add(LoadDashboard());
      } catch (e) {
        loggy.error('Error getting user position: $e');
        setState(() {
          _isLoading = false;
          _errorMessage =
              'Could not determine your location. Please try again.';
        });
      }
    } catch (e) {
      loggy.error('Error initializing location: $e');
      setState(() {
        _isLoading = false;
        _errorMessage =
            'An error occurred while accessing location services: ${e.toString()}';
      });
    }
  }

  // Calculate distance between two coordinates using Geolocator
  double _calculateDistance(
      double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) /
        1000; // Convert meters to kilometers
  }

  // Find nearby measurements based on user location with distances
  List<MapEntry<Measurement, double>> _findNearbyMeasurementsWithDistance(
      List<Measurement> allMeasurements) {
    if (_userPosition == null) {
      loggy.warning(
          'No user position available when filtering nearby measurements');
      return [];
    }

    final measWithDistance = <MapEntry<Measurement, double>>[];

    // Calculate distances for all measurements with valid coordinates
    for (final measurement in allMeasurements) {
      final siteDetails = measurement.siteDetails;
      if (siteDetails == null) continue;

      double? latitude = siteDetails.approximateLatitude;
      double? longitude = siteDetails.approximateLongitude;

      // If no coordinates in siteDetails, try getting from siteCategory
      if (latitude == null || longitude == null) {
        latitude = siteDetails.siteCategory?.latitude;
        longitude = siteDetails.siteCategory?.longitude;
      }

      // Skip if no valid coordinates
      if (latitude == null || longitude == null) continue;

      // Calculate distance to user
      final distance = _calculateDistance(_userPosition!.latitude,
          _userPosition!.longitude, latitude, longitude);

      // Only include if within search radius
      if (distance <= _defaultSearchRadius) {
        measWithDistance.add(MapEntry(measurement, distance));
      }
    }

    // Sort by distance
    measWithDistance.sort((a, b) => a.value.compareTo(b.value));

    // Take the nearest ones (up to max)
    final result = measWithDistance.length > _maxNearbyLocations
        ? measWithDistance.sublist(0, _maxNearbyLocations)
        : measWithDistance;

    loggy.info(
        'Found ${result.length} nearby measurements within ${_defaultSearchRadius}km');
    return result;
  }

  void _retry() {
    _initializeLocationAndData();
  }


  void _openLocationSettings() async {
    bool didOpen = await Geolocator.openLocationSettings();
    if (didOpen) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Please enable location services and return to the app'),
          duration: Duration(seconds: 5),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<DashboardBloc, DashboardState>(
      listener: (context, state) {
        if (state is DashboardLoaded) {
          setState(() {
            _isLoading = false;
            if (state.response.measurements != null) {
              _nearbyMeasurementsWithDistance =
                  _findNearbyMeasurementsWithDistance(
                      state.response.measurements!);
            }
          });
        } else if (state is DashboardLoadingError) {
          setState(() {
            _isLoading = false;
            _errorMessage = state.message;
          });
        }
      },
      builder: (context, state) {
        // If location permission hasn't been granted yet
        if (_errorMessage != null && _errorMessage!.contains('permission')) {
          return NearbyViewEmptyState(
            errorMessage: _errorMessage,
            onRetry: _retry,
          );
        }

        // If location services are disabled
        if (_errorMessage != null &&
            _errorMessage!.contains('services are disabled')) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.location_off, color: Colors.amber, size: 48),
                  SizedBox(height: 16),
                  Text(
                    "Location Services Disabled",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).textTheme.headlineMedium?.color,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    "Please enable location services in your device settings to see air quality data near you.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Theme.of(context).textTheme.bodyMedium?.color,
                    ),
                  ),
                  SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _openLocationSettings,
                    icon: Icon(Icons.settings),
                    label: Text("Open Location Settings"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        // Loading state (Either getting location or loading dashboard)
        if (_isLoading || state is DashboardLoading) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(color: AppColors.primaryColor),
                SizedBox(height: 16),
                Text(
                  state is DashboardLoading
                      ? "Loading air quality data..."
                      : "Getting your location...",
                  style: TextStyle(
                    fontSize: 16,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
              ],
            ),
          );
        }

        // If dashboard is loaded but we have an error
        if (_errorMessage != null) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, color: Colors.red, size: 48),
                  SizedBox(height: 16),
                  Text(
                    "Error",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).textTheme.headlineMedium?.color,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    _errorMessage!,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Theme.of(context).textTheme.bodyMedium?.color,
                    ),
                  ),
                  SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _retry,
                    icon: Icon(Icons.refresh),
                    label: Text("Try Again"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        // Dashboard is loaded but no measurements found
        if (state is DashboardLoaded) {
          if (_nearbyMeasurementsWithDistance.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.location_off, color: Colors.amber, size: 48),
                    SizedBox(height: 16),
                    Text(
                      "No air quality stations found nearby",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color:
                            Theme.of(context).textTheme.headlineMedium?.color,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      "There are no air quality monitoring stations within ${_defaultSearchRadius.toInt()} km of your location.",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: Theme.of(context).textTheme.bodyMedium?.color,
                      ),
                    ),
                    SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _retry,
                      icon: Icon(Icons.refresh),
                      label: Text("Refresh"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryColor,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          // Display the list of nearby measurements with distance information
          return SizedBox(
            // Fixed height container to solve the layout issue
            height: MediaQuery.of(context).size.height,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with location count and refresh button
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      Icon(Icons.location_on,
                          color: AppColors.primaryColor, size: 18),
                      SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          "Showing ${_nearbyMeasurementsWithDistance.length} locations near you",
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color:
                                Theme.of(context).textTheme.bodyMedium?.color,
                          ),
                        ),
                      ),
                      Spacer(),
                      TextButton.icon(
                        onPressed: _retry,
                        icon: Icon(Icons.refresh, size: 18),
                        label: Text("Refresh"),
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.primaryColor,
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                    ],
                  ),
                ),
                // User location indicator
                if (_userPosition != null)
                  Padding(
                    padding:
                        const EdgeInsets.only(left: 16, right: 16, bottom: 12),
                    child: Container(
                      padding:
                          EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue.withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.my_location, color: Colors.blue, size: 16),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              "Your location: ${_userPosition!.latitude.toStringAsFixed(4)}, ${_userPosition!.longitude.toStringAsFixed(4)}",
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.blue.shade700,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // List of measurements - fixed: use Flexible instead of Expanded
                Flexible(
                  child: ListView.builder(
                    itemCount: _nearbyMeasurementsWithDistance.length,
                    padding: EdgeInsets.only(bottom: 16),
                    itemBuilder: (context, index) {
                      final entry = _nearbyMeasurementsWithDistance[index];
                      final measurement = entry.key;
                      final distance = entry.value;

                      return NearbyMeasurementCard(measurement: measurement, distance: distance);
                    },
                  ),
                ),
              ],
            ),
          );
        }

        // Default fallback for unexpected states
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: AppColors.primaryColor),
              SizedBox(height: 16),
              Text(
                "Loading air quality data...",
                style: TextStyle(
                  fontSize: 16,
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                ),
              ),
            ],
          ),
        );
      },
    );
  }





  
}
