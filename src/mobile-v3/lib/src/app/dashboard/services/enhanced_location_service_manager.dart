
import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class PrivacyZone {
  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final double radius; 
  final DateTime createdAt;

  PrivacyZone({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.radius,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'latitude': latitude,
    'longitude': longitude,
    'radius': radius,
    'createdAt': createdAt.toIso8601String(),
  };

  factory PrivacyZone.fromJson(Map<String, dynamic> json) => PrivacyZone(
    id: json['id'],
    name: json['name'],
    latitude: json['latitude'],
    longitude: json['longitude'],
    radius: json['radius'],
    createdAt: DateTime.parse(json['createdAt']),
  );
}

class LocationDataPoint {
  final String id;
  final double latitude;
  final double longitude;
  final DateTime timestamp;
  final double? accuracy;
  final bool isSharedWithResearchers;

  LocationDataPoint({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.timestamp,
    this.accuracy,
    this.isSharedWithResearchers = true,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'latitude': latitude,
    'longitude': longitude,
    'timestamp': timestamp.toIso8601String(),
    'accuracy': accuracy,
    'isSharedWithResearchers': isSharedWithResearchers,
  };

  factory LocationDataPoint.fromJson(Map<String, dynamic> json) => LocationDataPoint(
    id: json['id'],
    latitude: json['latitude'],
    longitude: json['longitude'],
    timestamp: DateTime.parse(json['timestamp']),
    accuracy: json['accuracy'],
    isSharedWithResearchers: json['isSharedWithResearchers'] ?? true,
  );
}

class EnhancedLocationServiceManager with UiLoggy {
  static final EnhancedLocationServiceManager _instance = EnhancedLocationServiceManager._internal();
  factory EnhancedLocationServiceManager() => _instance;
  EnhancedLocationServiceManager._internal();

  Position? _lastKnownPosition;
  bool _isTrackingActive = false;
  bool _isTrackingPaused = false;
  List<PrivacyZone> _privacyZones = [];
  List<LocationDataPoint> _locationHistory = [];
  final StreamController<bool> _trackingStatusController = StreamController<bool>.broadcast();
  final StreamController<Position?> _locationController = StreamController<Position?>.broadcast();
  Timer? _trackingTimer;

  // Getters
  Position? get lastKnownPosition => _lastKnownPosition;
  bool get isTrackingActive => _isTrackingActive;
  bool get isTrackingPaused => _isTrackingPaused;
  List<PrivacyZone> get privacyZones => List.unmodifiable(_privacyZones);
  List<LocationDataPoint> get locationHistory => List.unmodifiable(_locationHistory);
  Stream<bool> get trackingStatusStream => _trackingStatusController.stream;
  Stream<Position?> get locationStream => _locationController.stream;

  // Initialize the service
  Future<void> initialize() async {
    await _loadPrivacyZones();
    await _loadLocationHistory();
    await _loadTrackingSettings();
  }

  // Privacy Zone Management
  Future<void> addPrivacyZone(String name, double lat, double lng, double radius) async {
    final zone = PrivacyZone(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      latitude: lat,
      longitude: lng,
      radius: radius,
      createdAt: DateTime.now(),
    );
    
    _privacyZones.add(zone);
    await _savePrivacyZones();
    loggy.info('Added privacy zone: $name');
  }

  Future<void> removePrivacyZone(String zoneId) async {
    _privacyZones.removeWhere((zone) => zone.id == zoneId);
    await _savePrivacyZones();
    loggy.info('Removed privacy zone: $zoneId');
  }

  Future<void> _savePrivacyZones() async {
    final prefs = await SharedPreferences.getInstance();
    final zonesJson = _privacyZones.map((zone) => zone.toJson()).toList();
    await prefs.setString('privacy_zones', jsonEncode(zonesJson));
  }

  Future<void> _loadPrivacyZones() async {
    final prefs = await SharedPreferences.getInstance();
    final zonesString = prefs.getString('privacy_zones');
    if (zonesString != null) {
      final zonesList = jsonDecode(zonesString) as List;
      _privacyZones = zonesList.map((json) => PrivacyZone.fromJson(json)).toList();
    }
  }

  // Location Data Management
  Future<void> _saveLocationHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final historyJson = _locationHistory.map((point) => point.toJson()).toList();
    await prefs.setString('location_history', jsonEncode(historyJson));
  }

  Future<void> _loadLocationHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final historyString = prefs.getString('location_history');
    if (historyString != null) {
      final historyList = jsonDecode(historyString) as List;
      _locationHistory = historyList.map((json) => LocationDataPoint.fromJson(json)).toList();
    }
  }

  Future<void> deleteLocationPoint(String pointId) async {
    _locationHistory.removeWhere((point) => point.id == pointId);
    await _saveLocationHistory();
    loggy.info('Deleted location point: $pointId');
  }

  Future<void> deleteLocationPointsInRange(DateTime start, DateTime end) async {
    _locationHistory.removeWhere((point) => 
      point.timestamp.isAfter(start) && point.timestamp.isBefore(end));
    await _saveLocationHistory();
    loggy.info('Deleted location points between $start and $end');
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
      if (_isInPrivacyZone(position.latitude, position.longitude)) {
        loggy.info('Location not recorded - in privacy zone');
        return;
      }

      final dataPoint = LocationDataPoint(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: DateTime.now(),
        accuracy: position.accuracy,
      );

      _locationHistory.add(dataPoint);
      _lastKnownPosition = position;
      _locationController.add(position);
      
      await _saveLocationHistory();
      
      loggy.info('Location point captured: ${position.latitude}, ${position.longitude}');
    } catch (e) {
      loggy.error('Error capturing location: $e');
    }
  }

  bool _isInPrivacyZone(double latitude, double longitude) {
    for (final zone in _privacyZones) {
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

  // Data Sharing Control
  List<LocationDataPoint> getDataForResearchers() {
    return _locationHistory.where((point) => point.isSharedWithResearchers).toList();
  }

  Future<void> updateDataSharingConsent(String pointId, bool shareWithResearchers) async {
    final index = _locationHistory.indexWhere((point) => point.id == pointId);
    if (index != -1) {
      _locationHistory[index] = LocationDataPoint(
        id: _locationHistory[index].id,
        latitude: _locationHistory[index].latitude,
        longitude: _locationHistory[index].longitude,
        timestamp: _locationHistory[index].timestamp,
        accuracy: _locationHistory[index].accuracy,
        isSharedWithResearchers: shareWithResearchers,
      );
      await _saveLocationHistory();
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