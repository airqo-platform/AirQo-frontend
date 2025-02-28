import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/widgets/nearby_view_empty_state.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/shared/services/notification_manager.dart';

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
  static const double _defaultSearchRadius = 50.0; // 50km radius
  
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
          _errorMessage = 'Location services are disabled. Please enable location services in your device settings.';
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
            _errorMessage = 'Location permission denied. Please grant location permission to see air quality data near you.';
          });
          return;
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Location permissions are permanently denied. Please enable location in app settings.';
        });
        return;
      }
      
      // Get user position
      try {
        final position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 15),
        );
        
        loggy.info('Retrieved user position: ${position.latitude}, ${position.longitude}');
        
        setState(() {
          _userPosition = position;
        });
        
        // Load dashboard data
        context.read<DashboardBloc>().add(LoadDashboard());
        
      } catch (e) {
        loggy.error('Error getting user position: $e');
        setState(() {
          _isLoading = false;
          _errorMessage = 'Could not determine your location. Please try again.';
        });
      }
    } catch (e) {
      loggy.error('Error initializing location: $e');
      setState(() {
        _isLoading = false;
        _errorMessage = 'An error occurred while accessing location services: ${e.toString()}';
      });
    }
  }

  // Calculate distance between two coordinates using Geolocator
  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) / 1000; // Convert meters to kilometers
  }
  
  // Find nearby measurements based on user location with distances
  List<MapEntry<Measurement, double>> _findNearbyMeasurementsWithDistance(List<Measurement> allMeasurements) {
    if (_userPosition == null) {
      loggy.warning('No user position available when filtering nearby measurements');
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
      final distance = _calculateDistance(
        _userPosition!.latitude, 
        _userPosition!.longitude,
        latitude, 
        longitude
      );
      
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
    
    loggy.info('Found ${result.length} nearby measurements within ${_defaultSearchRadius}km');
    return result;
  }
  
  void _retry() {
    _initializeLocationAndData();
  }

  void _openAppSettings() async {
    bool didOpen = await Geolocator.openAppSettings();
    if (didOpen) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please grant location permission and return to the app'),
          duration: Duration(seconds: 5),
        ),
      );
    }
  }

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
    return BlocConsumer<DashboardBloc, DashboardState>(
      listener: (context, state) {
        if (state is DashboardLoaded) {
          setState(() {
            _isLoading = false;
            if (state.response.measurements != null) {
              _nearbyMeasurementsWithDistance = 
                _findNearbyMeasurementsWithDistance(state.response.measurements!);
            }
          });
        } else if (state is DashboardLoadingError) {
          setState(() {
            _isLoading = false;
            _errorMessage = state.message;
          });
          
          NotificationManager().showNotification(
            context,
            message: 'Error loading air quality data: ${state.message}',
            isSuccess: false,
          );
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
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with location count and refresh button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    Icon(Icons.location_on, color: AppColors.primaryColor, size: 18),
                    SizedBox(width: 4),
                    Text(
                      "Showing ${_nearbyMeasurementsWithDistance.length} locations near you",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Theme.of(context).textTheme.bodyMedium?.color,
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
              
              // List of measurements
              Expanded(
                child: ListView.builder(
                  itemCount: _nearbyMeasurementsWithDistance.length,
                  padding: EdgeInsets.only(bottom: 16),
                  itemBuilder: (context, index) {
                    final entry = _nearbyMeasurementsWithDistance[index];
                    final measurement = entry.key;
                    final distance = entry.value;
                    
                    return _buildMeasurementCard(measurement, distance);
                  },
                ),
              ),
            ],
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
  
  Widget _buildMeasurementCard(Measurement measurement, double distance) {
    return InkWell(
      onTap: () => _showAnalyticsDetails(measurement),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Theme.of(context).highlightColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 4,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(
                  left: 16, right: 16, bottom: 4, top: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                SvgPicture.asset(Theme.of(context).brightness ==
                                        Brightness.light
                                    ? "assets/images/shared/pm_rating_white.svg"
                                    : 'assets/images/shared/pm_rating.svg'),
                                const SizedBox(width: 2),
                                Text(
                                  " PM2.5",
                                  style: TextStyle(
                                    color: Theme.of(context).textTheme.headlineSmall?.color,
                                  ),
                                ),
                              ],
                            ),
                            Row(children: [
                              Text(
                                measurement.pm25?.value != null
                                    ? measurement.pm25!.value!
                                        .toStringAsFixed(1)
                                    : "-",
                                style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 36,
                                    color: Theme.of(context).textTheme.headlineLarge?.color
                                ),
                              ),
                              Text(" μg/m³",
                                  style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 18,
                                      color: Theme.of(context).textTheme.headlineLarge?.color
                                  )
                              )
                            ]),
                          ]),
                      SizedBox(
                        child: Center(
                          child: measurement.pm25?.value != null 
                            ? SvgPicture.asset(
                                getAirQualityIcon(measurement, measurement.pm25!.value!),
                                height: 86,
                                width: 86,
                              )
                            : Icon(
                                Icons.help_outline,
                                size: 60,
                                color: Colors.grey,
                              ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Divider(
                thickness: .5,
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.black
                    : Colors.white),
            Padding(
              padding: const EdgeInsets.only(
                  left: 16, right: 16, bottom: 16, top: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              measurement.siteDetails?.name ?? "Unknown Location",
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: Theme.of(context).textTheme.headlineSmall?.color,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(
                                  Icons.location_on,
                                  size: 14,
                                  color: AppColors.primaryColor,
                                ),
                                SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    _getLocationDescription(measurement),
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.7),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(
                                  Icons.near_me,
                                  size: 14,
                                  color: AppColors.primaryColor,
                                ),
                                SizedBox(width: 4),
                                Text(
                                  "${distance.toStringAsFixed(1)} km away",
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.primaryColor,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Column(
                        children: [
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: _getAqiColor(measurement).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              measurement.aqiCategory ?? "Unknown",
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: _getAqiColor(measurement),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (measurement.healthTips != null && measurement.healthTips!.isNotEmpty) ...[
                    SizedBox(height: 12),
                    Text(
                      measurement.healthTips![0].description ?? "No health tips available",
                      style: TextStyle(
                        fontSize: 14,
                        fontStyle: FontStyle.italic,
                        color: Theme.of(context).textTheme.bodyMedium?.color,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  void _showAnalyticsDetails(Measurement measurement) {
    showBottomSheet(
      backgroundColor: Colors.transparent,
      context: context,
      builder: (context) {
        return AnalyticsDetails(
          measurement: measurement,
        );
      }
    );
  }
  
  // Helper method to get a description of the location
  String _getLocationDescription(Measurement measurement) {
    final siteDetails = measurement.siteDetails;
    if (siteDetails == null) return "Unknown location";
    
    // Try to build a meaningful location string
    final List<String> locationParts = [];
    
    if (siteDetails.city != null && siteDetails.city!.isNotEmpty) {
      locationParts.add(siteDetails.city!);
    } else if (siteDetails.town != null && siteDetails.town!.isNotEmpty) {
      locationParts.add(siteDetails.town!);
    }
    
    if (siteDetails.region != null && siteDetails.region!.isNotEmpty) {
      locationParts.add(siteDetails.region!);
    } else if (siteDetails.county != null && siteDetails.county!.isNotEmpty) {
      locationParts.add(siteDetails.county!);
    }
    
    if (siteDetails.country != null && siteDetails.country!.isNotEmpty) {
      locationParts.add(siteDetails.country!);
    }
    
    return locationParts.isNotEmpty 
        ? locationParts.join(", ") 
        : siteDetails.locationName ?? siteDetails.formattedName ?? "Unknown location";
  }
  
  // Helper method to get color based on AQI category
  Color _getAqiColor(Measurement measurement) {
    if (measurement.aqiColor != null) {
      // Try to parse the color from the API response
      try {
        final colorStr = measurement.aqiColor!.replaceAll('#', '');
        return Color(int.parse('0xFF$colorStr'));
      } catch (e) {
        loggy.warning('Failed to parse AQI color: ${measurement.aqiColor}');
      }
    }
    
    // Fallback based on category
    switch (measurement.aqiCategory?.toLowerCase() ?? '') {
      case 'good':
        return Colors.green;
      case 'moderate':
        return Colors.yellow.shade700;
      case 'unhealthy for sensitive groups':
      case 'u4sg':
        return Colors.orange;
      case 'unhealthy':
        return Colors.red;
      case 'very unhealthy':
        return Colors.purple;
      case 'hazardous':
        return Colors.brown;
      default:
        return AppColors.primaryColor;
    }
  }
  
//   String getAirQualityIcon(Measurement measurement, double value) {
//     // This function should be imported from utils.dart
//     // For this implementation, I'm creating a placeholder version
//     String baseIconPath = "assets/images/shared/";
    
//     if (measurement.aqiCategory == null) {
//       if (value <= 12.0) {
//         return "${baseIconPath}good_air.svg";
//       } else if (value <= 35.4) {
//         return "${baseIconPath}moderate_air.svg";
//       } else if (value <= 55.4) {
//         return "${baseIconPath}u4sg_air.svg";
//       } else if (value <= 150.4) {
//         return "${baseIconPath}unhealthy_air.svg";
//       } else if (value <= 250.4) {
//         return "${baseIconPath}very_unhealthy_air.svg";
//       } else {
//         return "${baseIconPath}hazardous_air.svg";
//       }
//     }
    
//     // Use AQI category if available
//     switch (measurement.aqiCategory!.toLowerCase()) {
//       case 'good':
//         return "${baseIconPath}good_air.svg";
//       case 'moderate':
//         return "${baseIconPath}moderate_air.svg";
//       case 'unhealthy for sensitive groups':
//       case 'u4sg':
//         return "${baseIconPath}u4sg_air.svg";
//       case 'unhealthy':
//         return "${baseIconPath}unhealthy_air.svg";
//       case 'very unhealthy':
//         return "${baseIconPath}very_unhealthy_air.svg";
//       case 'hazardous':
//         return "${baseIconPath}hazardous_air.svg";
//       default:
//         return "${baseIconPath}moderate_air.svg";
//     }
//   }
 }