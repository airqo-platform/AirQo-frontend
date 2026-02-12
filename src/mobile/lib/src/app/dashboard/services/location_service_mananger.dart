import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';

/// LocationResult containing the position and status information
class LocationResult {
  final Position? position;
  final LocationStatus status;
  final String? error;

  LocationResult({
    this.position,
    required this.status,
    this.error,
  });

  bool get isSuccess => status == LocationStatus.success;
  bool get needsPermission => status == LocationStatus.permissionDenied || 
                             status == LocationStatus.permissionDeniedForever;
  bool get needsService => status == LocationStatus.serviceDisabled;
}

/// Possible status values for location operations
enum LocationStatus {
  success,
  permissionDenied,
  permissionDeniedForever,
  serviceDisabled,
  timeout,
  error
}

/// A manager class for handling location-related operations
class LocationServiceManager with UiLoggy {
  // Singleton instance
  static final LocationServiceManager _instance = LocationServiceManager._internal();
  factory LocationServiceManager() => _instance;
  LocationServiceManager._internal();

  // The last known user position
  Position? _lastKnownPosition;
  
  // Getters
  Position? get lastKnownPosition => _lastKnownPosition;
  
  /// Checks if location services are enabled and permissions are granted
  Future<LocationResult> checkLocationPermission() async {
    try {
      // First check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        loggy.info('Location services are disabled');
        return LocationResult(
          status: LocationStatus.serviceDisabled,
          error: 'Location services are disabled',
        );
      }

      // Check current permission status
      LocationPermission permission = await Geolocator.checkPermission();
      
      if (permission == LocationPermission.denied) {
        loggy.info('Location permission is denied');
        return LocationResult(
          status: LocationStatus.permissionDenied,
          error: 'Location permission is denied',
        );
      }

      if (permission == LocationPermission.deniedForever) {
        loggy.info('Location permission is permanently denied');
        return LocationResult(
          status: LocationStatus.permissionDeniedForever,
          error: 'Location permission is permanently denied',
        );
      }

      // Permission is granted
      loggy.info('Location permission is granted: ${permission.toString()}');
      return LocationResult(
        status: LocationStatus.success,
      );
    } catch (e) {
      loggy.error('Error checking location permission: $e');
      return LocationResult(
        status: LocationStatus.error,
        error: 'Error checking location permission: $e',
      );
    }
  }

  /// Requests location permission from the user
  Future<LocationResult> requestLocationPermission() async {
    try {
      // First check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        loggy.info('Location services are disabled');
        return LocationResult(
          status: LocationStatus.serviceDisabled,
          error: 'Location services are disabled',
        );
      }

      // Request permission
      LocationPermission permission = await Geolocator.requestPermission();
      
      if (permission == LocationPermission.denied) {
        loggy.info('Location permission denied by user');
        return LocationResult(
          status: LocationStatus.permissionDenied,
          error: 'Location permission denied by user',
        );
      }

      if (permission == LocationPermission.deniedForever) {
        loggy.info('Location permission permanently denied');
        return LocationResult(
          status: LocationStatus.permissionDeniedForever,
          error: 'Location permission permanently denied',
        );
      }

      // Permission granted
      loggy.info('Location permission granted: ${permission.toString()}');
      return LocationResult(
        status: LocationStatus.success,
      );
    } catch (e) {
      loggy.error('Error requesting location permission: $e');
      return LocationResult(
        status: LocationStatus.error,
        error: 'Error requesting location permission: $e',
      );
    }
  }

  /// Gets the current user position
  Future<LocationResult> getCurrentPosition({
    LocationAccuracy accuracy = LocationAccuracy.high,
    Duration timeout = const Duration(seconds: 15),
  }) async {
    try {
      // Check permission first
      final permissionResult = await checkLocationPermission();
      if (!permissionResult.isSuccess) {
        return permissionResult;
      }

      // Get current position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: accuracy,
        timeLimit: timeout,
      );
      
      loggy.info('Current position obtained: ${position.latitude}, ${position.longitude}');
      
      // Store as last known position
      _lastKnownPosition = position;
      
      return LocationResult(
        position: position,
        status: LocationStatus.success,
      );
    } on TimeoutException {
      loggy.warning('Timeout getting current position');
      return LocationResult(
        status: LocationStatus.timeout,
        error: 'Timeout getting current position',
      );
    } catch (e) {
      loggy.error('Error getting current position: $e');
      return LocationResult(
        status: LocationStatus.error,
        error: 'Error getting current position: $e',
      );
    }
  }

  /// Calculates distance between two points in kilometers
  double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) / 1000; // Convert meters to kilometers
  }
  
  /// Opens the location settings page
  Future<bool> openLocationSettings() async {
    return await Geolocator.openLocationSettings();
  }
  
  /// Opens the application settings page (for permission settings)
  Future<bool> openAppSettings() async {
    return await Geolocator.openAppSettings();
  }
}