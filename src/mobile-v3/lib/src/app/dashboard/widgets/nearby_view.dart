import 'package:airqo/src/app/dashboard/widgets/nearby_measurement_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
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
  int? _lastMeasurementsHash;

  @override
  void initState() {
    super.initState();
    _initializeLocationAndData();
  }

  Future<void> _initializeLocationAndData() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _isLoading = false;
          _errorMessage =
              'Location services are disabled. Please enable location services in your device settings.';
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
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

      Position? position = await Geolocator.getLastKnownPosition();
      position ??= await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 5),
        );

      if (kDebugMode) {
        loggy.info(
            'Retrieved user position: ${position.latitude}, ${position.longitude}');
      }

      setState(() {
        _userPosition = position;
        _isLoading = false;
      });

      final dashboardState = context.read<DashboardBloc>().state;
      if (dashboardState is! DashboardLoaded) {
        context.read<DashboardBloc>().add(LoadDashboard());
      }
    } catch (e) {
      if (kDebugMode) {
        loggy.error('Error initializing location: $e');
      }
      setState(() {
        _isLoading = false;
        _errorMessage =
            'An error occurred while accessing location services: ${e.toString()}';
      });
    }
  }

  double _calculateDistance(
      double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) / 1000;
  }

  List<MapEntry<Measurement, double>> _findNearbyMeasurementsWithDistance(
      List<Measurement> allMeasurements) {
    if (_userPosition == null) {
      if (kDebugMode) {
        loggy.warning(
            'No user position available when filtering nearby measurements');
      }
      return [];
    }

    if (_nearbyMeasurementsWithDistance.isNotEmpty &&
        allMeasurements.hashCode == _lastMeasurementsHash) {
      return _nearbyMeasurementsWithDistance;
    }

    final measWithDistance = <MapEntry<Measurement, double>>[];
    for (final measurement in allMeasurements) {
      final siteDetails = measurement.siteDetails;
      if (siteDetails == null) continue;

      double? latitude =
          siteDetails.approximateLatitude ?? siteDetails.siteCategory?.latitude;
      double? longitude = siteDetails.approximateLongitude ??
          siteDetails.siteCategory?.longitude;

      if (latitude == null || longitude == null) continue;

      final distance = _calculateDistance(
        _userPosition!.latitude,
        _userPosition!.longitude,
        latitude,
        longitude,
      );

      if (distance <= _defaultSearchRadius) {
        measWithDistance.add(MapEntry(measurement, distance));
      }
    }

    measWithDistance.sort((a, b) => a.value.compareTo(b.value));
    _lastMeasurementsHash = allMeasurements.hashCode;
    _nearbyMeasurementsWithDistance =
        measWithDistance.length > _maxNearbyLocations
            ? measWithDistance.sublist(0, _maxNearbyLocations)
            : measWithDistance;

    if (kDebugMode) {
      loggy.info(
          'Found ${_nearbyMeasurementsWithDistance.length} nearby measurements within ${_defaultSearchRadius}km');
    }
    return _nearbyMeasurementsWithDistance;
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
    return BlocSelector<DashboardBloc, DashboardState, dynamic>(
      selector: (state) {
        if (state is DashboardLoaded) {
          return {
            'measurements': state.response.measurements,
            'isLoading': false,
            'error': null,
          };
        } else if (state is DashboardLoadingError) {
          return {
            'measurements': null,
            'isLoading': false,
            'error': state.message,
          };
        } else if (state is DashboardLoading) {
          return {
            'measurements': null,
            'isLoading': true,
            'error': null,
          };
        }
        return {
          'measurements': null,
          'isLoading': _isLoading,
          'error': _errorMessage,
        };
      },
      builder: (context, selectedState) {
        final measurements =
            selectedState['measurements'] as List<Measurement>?;
        final isLoading = selectedState['isLoading'] as bool;
        final error = selectedState['error'] as String? ?? _errorMessage;

        if (error != null && error.contains('permission')) {
          return NearbyViewEmptyState(
            errorMessage: error,
            onRetry: _retry,
          );
        }

        if (error != null && error.contains('services are disabled')) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.location_off, color: Colors.amber, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    "Location Services Disabled",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).textTheme.headlineMedium?.color,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Please enable location services in your device settings to see air quality data near you.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Theme.of(context).textTheme.bodyMedium?.color,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _openLocationSettings,
                    icon: const Icon(Icons.settings),
                    label: const Text("Open Location Settings"),
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

        if (isLoading) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 120),
                CircularProgressIndicator(color: AppColors.primaryColor),
                const SizedBox(height: 16),
                Text(
                  "Getting your location...",
                  style: TextStyle(
                    fontSize: 16,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
              ],
            ),
          );
        }

        if (error != null) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    "Error",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).textTheme.headlineMedium?.color,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    error,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Theme.of(context).textTheme.bodyMedium?.color,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _retry,
                    icon: const Icon(Icons.refresh),
                    label: const Text("Try Again"),
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

        final nearbyMeasurements = measurements != null
            ? _findNearbyMeasurementsWithDistance(measurements)
            : <MapEntry<Measurement, double>>[];

        if (nearbyMeasurements.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.location_off, color: Colors.amber, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    "No air quality stations found nearby",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).textTheme.headlineMedium?.color,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "There are no air quality monitoring stations within ${_defaultSearchRadius.toInt()} km of your location.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Theme.of(context).textTheme.bodyMedium?.color,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _retry,
                    icon: const Icon(Icons.refresh),
                    label: const Text("Refresh"),
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

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_userPosition != null)
              Padding(
                padding: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.my_location,
                          color: Colors.blue, size: 16),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          "Your location: ${_userPosition!.latitude.toStringAsFixed(4)}, ${_userPosition!.longitude.toStringAsFixed(4)}",
                          textAlign: TextAlign.center,
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
              itemCount: nearbyMeasurements.length,
              padding: const EdgeInsets.only(bottom: 16),
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemBuilder: (context, index) {
                final entry = nearbyMeasurements[index];
                return NearbyMeasurementCard(
                  measurement: entry.key,
                  distance: entry.value,
                );
              },
            ),
          ],
        );
      },
    );
  }
}
