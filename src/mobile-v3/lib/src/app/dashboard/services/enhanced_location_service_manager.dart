import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:airqo/src/app/profile/models/privacy_zone_model.dart';
import 'package:airqo/src/app/profile/repository/privacy_repository.dart';

class EnhancedLocationServiceManager with UiLoggy {
  static final EnhancedLocationServiceManager _instance =
      EnhancedLocationServiceManager._internal();
  factory EnhancedLocationServiceManager() => _instance;
  EnhancedLocationServiceManager._internal();

  final PrivacyRepository _privacyRepository = PrivacyRepository();
  Position? _lastKnownPosition;
  bool _isTrackingActive = false;
  bool _isTrackingPaused = false;
  List<PrivacyZone> _privacyZones = [];
  final StreamController<bool> _trackingStatusController =
      StreamController<bool>.broadcast();
  final StreamController<Position?> _locationController =
      StreamController<Position?>.broadcast();
  Timer? _trackingTimer;

  // Getters
  Position? get lastKnownPosition => _lastKnownPosition;
  bool get isTrackingActive => _isTrackingActive;
  bool get isTrackingPaused => _isTrackingPaused;
  Stream<bool> get trackingStatusStream => _trackingStatusController.stream;
  Stream<Position?> get locationStream => _locationController.stream;

  // Privacy zones are now managed through the repository
  Future<List<PrivacyZone>> get privacyZones async => 
      await _privacyRepository.getPrivacyZones();

  // Initialize the service
  Future<void> initialize() async {
    await _loadPrivacyZones();
    await _loadTrackingSettings();
  }

  Future<void> _loadPrivacyZones() async {
    try {
      _privacyZones = await _privacyRepository.getPrivacyZones();
      loggy.info('Loaded ${_privacyZones.length} privacy zones');
    } catch (e) {
      loggy.error('Failed to load privacy zones from repository: $e');
      _privacyZones = [];
      loggy.info('Initialized empty privacy zones list');
    }
  }

  // Tracking Control
  Future<void> startLocationTracking() async {
    if (_isTrackingActive) return;

    final permissionResult = await checkLocationPermission();
    if (!permissionResult.isSuccess) {
      throw Exception('Location permission required');
    }

    _isTrackingActive = true;
    _trackingStatusController.add(true);

    _trackingTimer = Timer.periodic(Duration(minutes: 5), (timer) async {
      if (!_isTrackingPaused) {
        await _captureLocationPoint();
      }
    });

    await _saveTrackingSettings();
    loggy.info('Location tracking started');
  }

  Future<void> stopLocationTracking() async {
    _isTrackingActive = false;
    _trackingTimer?.cancel();
    _trackingStatusController.add(false);
    await _saveTrackingSettings();
    loggy.info('Location tracking stopped');
  }

  Future<void> pauseLocationTracking() async {
    _isTrackingPaused = true;
    _trackingStatusController.add(false);
    loggy.info('Location tracking paused');
  }

  Future<void> resumeLocationTracking() async {
    _isTrackingPaused = false;
    if (_isTrackingActive) {
      _trackingStatusController.add(true);
    }
    loggy.info('Location tracking resumed');
  }

  Future<void> _captureLocationPoint() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: Duration(seconds: 10),
      );

      // Check if current location is in a privacy zone
      if (await _isInPrivacyZone(position.latitude, position.longitude)) {
        loggy.info('Location not recorded - in privacy zone');
        return;
      }

      _lastKnownPosition = position;
      _locationController.add(position);

      loggy.info(
          'Location point captured: ${position.latitude}, ${position.longitude}');
    } catch (e) {
      loggy.error('Error capturing location: $e');
    }
  }

  Future<bool> _isInPrivacyZone(double latitude, double longitude) async {
    final zones = await _privacyRepository.getPrivacyZones();
    for (final zone in zones) {
      final distance = Geolocator.distanceBetween(
          latitude, longitude, zone.latitude, zone.longitude);
      if (distance <= zone.radius) {
        return true;
      }
    }
    return false;
  }

  Future<void> _saveTrackingSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_tracking_active', _isTrackingActive);
    await prefs.setBool('is_tracking_paused', _isTrackingPaused);
  }

  Future<void> _loadTrackingSettings() async {
    final prefs = await SharedPreferences.getInstance();
    _isTrackingActive = prefs.getBool('is_tracking_active') ?? false;
    _isTrackingPaused = prefs.getBool('is_tracking_paused') ?? false;

    if (_isTrackingActive && !_isTrackingPaused) {
      await startLocationTracking();
    }
  }


  // Original methods from LocationServiceManager
  Future<LocationResult> checkLocationPermission() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return LocationResult(
          status: LocationStatus.serviceDisabled,
          error: 'Location services are disabled',
        );
      }

      LocationPermission permission = await Geolocator.checkPermission();

      if (permission == LocationPermission.denied) {
        return LocationResult(
          status: LocationStatus.permissionDenied,
          error: 'Location permission is denied',
        );
      }

      if (permission == LocationPermission.deniedForever) {
        return LocationResult(
          status: LocationStatus.permissionDeniedForever,
          error: 'Location permission is permanently denied',
        );
      }

      return LocationResult(status: LocationStatus.success);
    } catch (e) {
      return LocationResult(
        status: LocationStatus.error,
        error: 'Error checking location permission: $e',
      );
    }
  }

  Future<LocationResult> requestLocationPermission() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return LocationResult(
          status: LocationStatus.serviceDisabled,
          error: 'Location services are disabled',
        );
      }

      LocationPermission permission = await Geolocator.requestPermission();

      if (permission == LocationPermission.denied) {
        return LocationResult(
          status: LocationStatus.permissionDenied,
          error: 'Location permission denied by user',
        );
      }

      if (permission == LocationPermission.deniedForever) {
        return LocationResult(
          status: LocationStatus.permissionDeniedForever,
          error: 'Location permission permanently denied',
        );
      }

      return LocationResult(status: LocationStatus.success);
    } catch (e) {
      return LocationResult(
        status: LocationStatus.error,
        error: 'Error requesting location permission: $e',
      );
    }
  }

  Future<LocationResult> getCurrentPosition({
    LocationAccuracy accuracy = LocationAccuracy.high,
    Duration timeout = const Duration(seconds: 15),
  }) async {
    try {
      final permissionResult = await checkLocationPermission();
      if (!permissionResult.isSuccess) {
        return permissionResult;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: accuracy,
        timeLimit: timeout,
      );

      _lastKnownPosition = position;

      return LocationResult(
        position: position,
        status: LocationStatus.success,
      );
    } on TimeoutException {
      return LocationResult(
        status: LocationStatus.timeout,
        error: 'Timeout getting current position',
      );
    } catch (e) {
      return LocationResult(
        status: LocationStatus.error,
        error: 'Error getting current position: $e',
      );
    }
  }

  void dispose() {
    _trackingTimer?.cancel();
    _trackingStatusController.close();
    _locationController.close();
  }
}

// Keep original classes for compatibility
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
}

enum LocationStatus {
  success,
  permissionDenied,
  permissionDeniedForever,
  serviceDisabled,
  timeout,
  error
}
