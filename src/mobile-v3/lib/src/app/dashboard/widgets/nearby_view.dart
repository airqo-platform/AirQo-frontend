import 'package:airqo/src/app/dashboard/widgets/nearby_measurement_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive/hive.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/widgets/nearby_view_empty_state.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';

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
  late CacheManager _cacheManager;
  static const String _cachedNearbyLocationsKey = 'nearby_locations';

  @override
  void initState() {
    super.initState();
    _cacheManager = CacheManager();
    _initializeLocationAndData();
  }

  Future<void> _initializeLocationAndData() async {
    try {
      // Try to load cached nearby locations first for immediate display
      await _loadCachedNearbyLocations();
      
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

      // Try to get last known position first for quick response
      Position? position = await Geolocator.getLastKnownPosition();
      if (position != null) {
        setState(() {
          _userPosition = position;
          _isLoading = false;
        });
        
        // Update nearby locations with this position
        await _updateNearbyLocations();
      }
      
      // Then get current position for more accuracy
      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 5),
        );
        
        setState(() {
          _userPosition = position;
          _isLoading = false;
        });
        
        // Update nearby locations with the more accurate position
        await _updateNearbyLocations();
      } catch (e) {
        // If current position fails but we have last known, that's fine
        if (_userPosition != null) {
          loggy.warning('Could not get current position, using last known: $e');
        } else {
          throw e; // Re-throw if we don't have any position
        }
      }

      if (kDebugMode) {
        loggy.info(
            'Retrieved user position: ${_userPosition?.latitude}, ${_userPosition?.longitude}');
      }

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
  
  // Load cached nearby locations from previous sessions
  Future<void> _loadCachedNearbyLocations() async {
    try {
      final cachedData = await _cacheManager.get<List<dynamic>>(
        boxName: CacheBoxName.location,
        key: _cachedNearbyLocationsKey,
        fromJson: (json) {
          return json['locations'] as List<dynamic>;
        },
      );
      
      if (cachedData != null && cachedData.data.isNotEmpty) {
        final cachedMeasurements = <MapEntry<Measurement, double>>[];
        
        for (var item in cachedData.data) {
          final siteId = item['siteId'] as String;
          final distance = (item['distance'] as num).toDouble();
          
          // Get the cached measurement for this site
          final measurementCache = await _cacheManager.get<Measurement>(
            boxName: CacheBoxName.location,
            key: 'site_measurement_$siteId',
            fromJson: (json) => Measurement.fromJson(json),
          );
          
          if (measurementCache != null) {
            cachedMeasurements.add(MapEntry(measurementCache.data, distance));
          }
        }
        
        if (cachedMeasurements.isNotEmpty) {
          loggy.info('Loaded ${cachedMeasurements.length} cached nearby locations');
          
          // Sort by distance
          cachedMeasurements.sort((a, b) => a.value.compareTo(b.value));
          
          setState(() {
            _nearbyMeasurementsWithDistance = cachedMeasurements;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      loggy.error('Error loading cached nearby locations: $e');
      // Continue without cached data - not critical
    }
  }

  double _calculateDistance(
      double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) / 1000;
  }

  Future<void> _updateNearbyLocations() async {
    if (_userPosition == null) {
      loggy.warning('No user position available when filtering nearby measurements');
      return;
    }
    
    final state = context.read<DashboardBloc>().state;
    if (state is! DashboardLoaded || state.response.measurements == null) {
      return;
    }
    
    final allMeasurements = state.response.measurements!;
    if (allMeasurements.hashCode == _lastMeasurementsHash && 
        _nearbyMeasurementsWithDistance.isNotEmpty) {
      return;
    }
    
    _lastMeasurementsHash = allMeasurements.hashCode;
    
    final measWithDistance = <MapEntry<Measurement, double>>[];
    final nearbyInfo = <Map<String, dynamic>>[];
    
    for (final measurement in allMeasurements) {
      final siteDetails = measurement.siteDetails;
      if (siteDetails == null || measurement.siteId == null) continue;

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
        
        await _cacheManager.put<Measurement>(
          boxName: CacheBoxName.location,
          key: 'site_measurement_${measurement.siteId}',
          data: measurement,
          toJson: (data) => data.toJson(),
        );
        
        nearbyInfo.add({
          'siteId': measurement.siteId!,
          'distance': distance,
        });
      }
    }

    measWithDistance.sort((a, b) => a.value.compareTo(b.value));
    final visibleMeasurements = measWithDistance.length > _maxNearbyLocations
        ? measWithDistance.sublist(0, _maxNearbyLocations)
        : measWithDistance;
    
    await _cacheManager.put<Map<String, dynamic>>(
      boxName: CacheBoxName.location,
      key: _cachedNearbyLocationsKey,
      data: {'locations': nearbyInfo},
      toJson: (data) => data,
    );

    if (kDebugMode) {
      loggy.info(
          'Found ${visibleMeasurements.length} nearby measurements within ${_defaultSearchRadius}km');
    }
    
    if (mounted) {
      setState(() {
        _nearbyMeasurementsWithDistance = visibleMeasurements;
      });
    }
  }
  
  Future<void> _expandFromCache() async {
    if (_nearbyMeasurementsWithDistance.length >= _maxNearbyLocations || 
        _userPosition == null) {
      return;
    }
    
    try {
      final box = await Hive.openBox(CacheBoxName.location.toString());
      final keys = box.keys.where((k) => k.toString().startsWith('site_measurement_')).toList();
      
      for (final key in keys) {
        final siteId = key.toString().replaceFirst('site_measurement_', '');
        if (_nearbyMeasurementsWithDistance.any((e) => e.key.siteId == siteId)) {
          continue;
        }
        
        final cachedData = await _cacheManager.get<Measurement>(
          boxName: CacheBoxName.location,
          key: key.toString(),
          fromJson: (json) => Measurement.fromJson(json),
        );
        
        if (cachedData == null || cachedData.data.siteDetails == null) continue;
        
        final siteDetails = cachedData.data.siteDetails!;
        
        double? latitude = siteDetails.approximateLatitude ?? 
                          siteDetails.siteCategory?.latitude;
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
          setState(() {
            _nearbyMeasurementsWithDistance.add(MapEntry(cachedData.data, distance));
          });
          
          if (_nearbyMeasurementsWithDistance.length >= _maxNearbyLocations) {
            break;
          }
        }
      }

      if (_nearbyMeasurementsWithDistance.isNotEmpty) {
        setState(() {
          _nearbyMeasurementsWithDistance.sort((a, b) => a.value.compareTo(b.value));
        });
      }
    } catch (e) {
      loggy.error('Error expanding from cache: $e');
    }
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
    return BlocListener<DashboardBloc, DashboardState>(
      listener: (context, state) {
        if (state is DashboardLoaded) {
          _updateNearbyLocations();
          
          if (_nearbyMeasurementsWithDistance.length < 2) {
            _expandFromCache();
          }
        }
      },
      child: BlocSelector<DashboardBloc, DashboardState, dynamic>(
        selector: (state) {
          if (state is DashboardLoaded) {
            return {
              'isLoading': false,
              'error': null,
            };
          } else if (state is DashboardLoadingError) {
            return {
              'isLoading': false,
              'error': state.message,
            };
          } else if (state is DashboardLoading) {
            return {
              'isLoading': _nearbyMeasurementsWithDistance.isEmpty,
              'error': null,
            };
          }
          return {
            'isLoading': _isLoading && _nearbyMeasurementsWithDistance.isEmpty,
            'error': _errorMessage,
          };
        },
        builder: (context, selectedState) {
          final isLoading = selectedState['isLoading'] as bool;
          final error = selectedState['error'] as String? ?? _errorMessage;

          if (error != null && error.contains('permission') && _nearbyMeasurementsWithDistance.isEmpty) {
            return NearbyViewEmptyState(
              errorMessage: error,
              onRetry: _retry,
            );
          }

          if (error != null && error.contains('services are disabled') && _nearbyMeasurementsWithDistance.isEmpty) {
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

          if (isLoading && _nearbyMeasurementsWithDistance.isEmpty) {
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

          if (_nearbyMeasurementsWithDistance.isEmpty) {
            _expandFromCache();
            
            if (_nearbyMeasurementsWithDistance.isEmpty) {
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
                    // child: Row(
                    //   children: [
                    //     const Icon(Icons.my_location,
                    //         color: Colors.blue, size: 16),
                    //     const SizedBox(width: 6),
                    //     Expanded(
                    //       child: Text(
                    //         "Your location: ${_userPosition!.latitude.toStringAsFixed(4)}, ${_userPosition!.longitude.toStringAsFixed(4)}",
                    //         textAlign: TextAlign.center,
                    //         style: TextStyle(
                    //           fontSize: 12,
                    //           color: Colors.blue.shade700,
                    //         ),
                    //         overflow: TextOverflow.ellipsis,
                    //       ),
                    //     ),
                    //   ],
                    // ),
                  ),
                ),
              ListView.builder(
                itemCount: _nearbyMeasurementsWithDistance.length,
                padding: const EdgeInsets.only(bottom: 16),
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  final entry = _nearbyMeasurementsWithDistance[index];
                  return NearbyMeasurementCard(
                    measurement: entry.key,
                    distance: entry.value,
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }
}