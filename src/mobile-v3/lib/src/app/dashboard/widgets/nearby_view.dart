import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/widgets/nearby_view_empty_state.dart';
import 'package:airqo/src/app/dashboard/widgets/nearby_measurement_card.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'dart:async';

class NearbyView extends StatefulWidget {
  const NearbyView({super.key});

  @override
  State<NearbyView> createState() => _NearbyViewState();
}

class _NearbyViewState extends State<NearbyView> with UiLoggy {
  // Track if we're fetching location
  bool _isRequestingLocation = false;
  
  // Track if we're fetching measurements
  bool _isFetchingData = false;
  
  // Separate states to improve UX feedback
  bool _locationPermissionGranted = false;
  
  // Store error messages
  String? _errorMessage;
  
  // Store user position
  Position? _userPosition;
  
  // Store measurements with distances
  List<MapEntry<Measurement, double>> _nearbyMeasurementsWithDistance = [];
  
  // Constants
  static const int _maxNearbyLocations = 4;
  static const double _defaultSearchRadius = 10.0;
  
  // Timers for timeouts
  Timer? _locationTimer;
  Timer? _dataFetchTimer;

  @override
  void initState() {
    super.initState();
    _checkLocationPermission();
  }

  @override
  void dispose() {
    _locationTimer?.cancel();
    _dataFetchTimer?.cancel();
    super.dispose();
  }

  // Step 1: Check location permission without requesting it yet
  Future<void> _checkLocationPermission() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _errorMessage = 'Location services are disabled. Please enable location services in your device settings.';
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      
      // If we already have permission, proceed to get location
      if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
        setState(() {
          _locationPermissionGranted = true;
        });
        _getUserPosition();
      } else {
        // Show empty state which will have a button to request permission
        setState(() {
          _locationPermissionGranted = false;
          _errorMessage = permission == LocationPermission.denied
              ? 'Location permission is required to see air quality near you.'
              : 'Location permission permanently denied. Please enable it in app settings.';
        });
      }
    } catch (e) {
      loggy.error('Error checking location permission: $e');
      setState(() {
        _errorMessage = 'An error occurred while checking location settings.';
      });
    }
  }

  // Step 2: Request user location with timeout
  Future<void> _getUserPosition() async {
    if (_isRequestingLocation) return;
    
    setState(() {
      _isRequestingLocation = true;
      _errorMessage = null;
    });

    // Set a timeout for location request
    _locationTimer = Timer(const Duration(seconds: 3), () {
      if (_isRequestingLocation && mounted) {
        loggy.warning('Location request timed out after 3 seconds');
        _tryLastKnownPosition();
      }
    });

    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      ).timeout(
        const Duration(seconds: 3),
        onTimeout: () {
          throw TimeoutException('Location request timed out after 3 seconds');
        },
      );

      _locationTimer?.cancel();
      
      if (!mounted) return;
      
      loggy.info('Retrieved user position: ${position.latitude}, ${position.longitude}');
      
      setState(() {
        _userPosition = position;
        _isRequestingLocation = false;
      });

      // Once we have location, fetch data
      _fetchNearbyData();
    } catch (e) {
      _locationTimer?.cancel();
      
      if (!mounted) return;
      
      loggy.error('Error getting user position: $e');
      _tryLastKnownPosition();
    }
  }

  // Fallback to last known position
  Future<void> _tryLastKnownPosition() async {
    try {
      final lastKnownPosition = await Geolocator.getLastKnownPosition();
      if (lastKnownPosition != null && mounted) {
        loggy.info('Using last known position: ${lastKnownPosition.latitude}, ${lastKnownPosition.longitude}');
        setState(() {
          _userPosition = lastKnownPosition;
          _isRequestingLocation = false;
        });

        _fetchNearbyData();
        return;
      }
    } catch (fallbackError) {
      loggy.error('Error getting last known position: $fallbackError');
    }

    if (mounted) {
      setState(() {
        _isRequestingLocation = false;
        _errorMessage = 'Could not determine your location. Please try again.';
      });
    }
  }

  // Step 3: Fetch nearby measurements with timeout
  Future<void> _fetchNearbyData() async {
    if (_isFetchingData || _userPosition == null) return;
    
    setState(() {
      _isFetchingData = true;
    });

    // Start a timer for data fetching
    _dataFetchTimer = Timer(const Duration(seconds: 3), () {
      if (_isFetchingData && mounted) {
        // If taking too long, show partial data
        _processMeasurementsFromCurrentState();
        setState(() {
          _isFetchingData = false;
        });
      }
    });

    // Request dashboard data
    context.read<DashboardBloc>().add(LoadDashboard());
  }

  // Process measurements from current state (used for timeout and normal flow)
  void _processMeasurementsFromCurrentState() {
    final state = context.read<DashboardBloc>().state;
    
    if (state is DashboardLoaded && state.response.measurements != null) {
      setState(() {
        _nearbyMeasurementsWithDistance = _findNearbyMeasurementsWithDistance(
            state.response.measurements!);
        _isFetchingData = false;
      });
    }
  }

  // Calculate distance between two points
  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) / 1000;
  }

  // Find nearby measurements based on user location with distances
  List<MapEntry<Measurement, double>> _findNearbyMeasurementsWithDistance(
      List<Measurement> allMeasurements) {
    if (_userPosition == null) {
      loggy.warning('No user position available when filtering nearby measurements');
      return [];
    }

    loggy.info('Finding nearby measurements from ${allMeasurements.length} total measurements');
    final measWithDistance = <MapEntry<Measurement, double>>[];
    int skippedMeasurements = 0;

    for (final measurement in allMeasurements) {
      final siteDetails = measurement.siteDetails;
      if (siteDetails == null) {
        skippedMeasurements++;
        continue;
      }

      double? latitude = siteDetails.approximateLatitude;
      double? longitude = siteDetails.approximateLongitude;

      if (latitude == null || longitude == null) {
        latitude = siteDetails.siteCategory?.latitude;
        longitude = siteDetails.siteCategory?.longitude;
      }

      if (latitude == null || longitude == null) {
        skippedMeasurements++;
        continue;
      }

      final distance = _calculateDistance(_userPosition!.latitude,
          _userPosition!.longitude, latitude, longitude);

      if (distance <= _defaultSearchRadius) {
        measWithDistance.add(MapEntry(measurement, distance));
      }
    }

    measWithDistance.sort((a, b) => a.value.compareTo(b.value));

    final result = measWithDistance.length > _maxNearbyLocations
        ? measWithDistance.sublist(0, _maxNearbyLocations)
        : measWithDistance;

    loggy.info(
        'Found ${result.length} nearby measurements within ${_defaultSearchRadius}km (skipped $skippedMeasurements invalid measurements)');
    return result;
  }

  // Handle retry action
  void _retry() {
    setState(() {
      _errorMessage = null;
    });
    if (_locationPermissionGranted) {
      _getUserPosition();
    } else {
      _checkLocationPermission();
    }
  }

  // Open location settings
  void _openLocationSettings() async {
    bool didOpen = await Geolocator.openLocationSettings();
    if (didOpen) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enable location services and return to the app'),
          duration: Duration(seconds: 5),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // If permission isn't granted, show empty state with request button
    if (!_locationPermissionGranted && _errorMessage != null && _errorMessage!.contains('permission')) {
      return NearbyViewEmptyState(
        errorMessage: _errorMessage,
        onRetry: () {
          _checkLocationPermission();
        },
      );
    }

    // If location services are disabled, show a specific UI
    if (_errorMessage != null && _errorMessage!.contains('services are disabled')) {
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

    return BlocConsumer<DashboardBloc, DashboardState>(
      listener: (context, state) {
        if (state is DashboardLoaded) {
          _processMeasurementsFromCurrentState();
          _dataFetchTimer?.cancel();
        } else if (state is DashboardLoadingError) {
          setState(() {
            _isFetchingData = false;
            _errorMessage = state.message;
          });
          _dataFetchTimer?.cancel();
        }
      },
      builder: (context, state) {
        // Instead of a full screen loader when requesting location,
        // show skeleton content right away to reduce user anxiety
        if (_isRequestingLocation && _userPosition == null) {
          return _buildLocationSkeletonState();
        }

        // If we have a position but are waiting for measurements, show position with loading
        if (_isFetchingData && _userPosition != null && _nearbyMeasurementsWithDistance.isEmpty) {
          return _buildLocationWithLoadingState();
        }

        // If we have measurements, show them
        if (_userPosition != null && _nearbyMeasurementsWithDistance.isNotEmpty) {
          return _buildMeasurementsList();
        }
        
        // If we have position but no nearby measurements found
        if (_userPosition != null && !_isFetchingData && _nearbyMeasurementsWithDistance.isEmpty) {
          return _buildNoNearbyMeasurementsState();
        }

        // Generic error handler
        if (_errorMessage != null) {
          return _buildErrorState();
        }

        // Default loading state with skeletons, not spinners
        return _buildLocationSkeletonState();
      },
    );
  }

  // UI Builder methods for different states
  // Build skeleton UI instead of showing a loader
  Widget _buildLocationSkeletonState() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Skeleton measurement cards
          ...List.generate(3, (index) => 
            Container(
              margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              height: 220,
              decoration: BoxDecoration(
                color: Theme.of(context).highlightColor,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Location title skeleton
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 200,
                          height: 24,
                          decoration: BoxDecoration(
                            color: Colors.grey.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        SizedBox(height: 8),
                        Container(
                          width: 160,
                          height: 14,
                          decoration: BoxDecoration(
                            color: Colors.grey.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  Divider(),
                  
                  // Air quality data skeleton
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 80,
                              height: 18,
                              decoration: BoxDecoration(
                                color: Colors.grey.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                            SizedBox(height: 8),
                            Container(
                              width: 120,
                              height: 36,
                              decoration: BoxDecoration(
                                color: Colors.grey.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ],
                        ),
                        
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.grey.withOpacity(0.15),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )
          ),
        ],
      ),
    );
  }
  
  // This method is kept for backward compatibility but we avoid using it
  Widget _buildProgressIndicator(String message) {
    return _buildLocationSkeletonState();
  }

  Widget _buildLocationWithLoadingState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Subtle location indicator without drawing too much attention
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Icon(Icons.location_on, color: AppColors.primaryColor, size: 18),
              SizedBox(width: 4),
              Flexible(
                child: Text(
                  "Nearby air quality stations",
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
              ),
            ],
          ),
        ),
        
        // Small user location indicator without making it prominent
        Padding(
          padding: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.05),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.blue.withOpacity(0.1)),
            ),
            child: Row(
              children: [
                Icon(Icons.my_location, color: Colors.blue.shade300, size: 14),
                SizedBox(width: 6),
                Expanded(
                  child: Text(
                    "Your location: ${_userPosition!.latitude.toStringAsFixed(4)}, ${_userPosition!.longitude.toStringAsFixed(4)}",
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.blue.shade400,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),

        // Measurement skeleton cards without loading text
        ...List.generate(3, (index) => 
          Container(
            margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            height: 220,
            decoration: BoxDecoration(
              color: Theme.of(context).highlightColor,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 4,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Location title skeleton
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 180 + (index * 20), // Varied widths for more natural look
                        height: 24,
                        decoration: BoxDecoration(
                          color: Colors.grey.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      SizedBox(height: 8),
                      Container(
                        width: 140 + (index * 10),
                        height: 14,
                        decoration: BoxDecoration(
                          color: Colors.grey.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
                
                Divider(),
                
                // Air quality data skeleton
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 80,
                            height: 18,
                            decoration: BoxDecoration(
                              color: Colors.grey.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                          SizedBox(height: 8),
                          Container(
                            width: 120,
                            height: 36,
                            decoration: BoxDecoration(
                              color: Colors.grey.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ],
                      ),
                      
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.grey.withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          )
        ),
      ],
    );
  }

  Widget _buildMeasurementsList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Icon(Icons.location_on, color: AppColors.primaryColor, size: 18),
              SizedBox(width: 4),
              Flexible(
                child: Text(
                  "Showing ${_nearbyMeasurementsWithDistance.length} locations near you",
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
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
        Padding(
          padding: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
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

        ListView.builder(
          itemCount: _nearbyMeasurementsWithDistance.length,
          padding: EdgeInsets.only(bottom: 16),
          shrinkWrap: true, 
          physics: NeverScrollableScrollPhysics(),
          itemBuilder: (context, index) {
            final entry = _nearbyMeasurementsWithDistance[index];
            final measurement = entry.key;
            final distance = entry.value;

            return NearbyMeasurementCard(
                measurement: measurement, distance: distance);
          },
        ),
      ],
    );
  }

  Widget _buildNoNearbyMeasurementsState() {
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
                color: Theme.of(context).textTheme.headlineMedium?.color,
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
            SizedBox(height: 8),
            Text(
              "Your location: ${_userPosition!.latitude.toStringAsFixed(4)}, ${_userPosition!.longitude.toStringAsFixed(4)}",
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey,
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

  Widget _buildErrorState() {
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
}