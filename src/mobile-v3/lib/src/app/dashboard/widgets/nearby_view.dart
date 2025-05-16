import 'package:airqo/src/app/dashboard/widgets/nearby_measurement_card.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/widgets/nearby_view_empty_state.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:async/async.dart';
import 'dart:async';


class NearbyViewStateManager {
  static Position? _userPosition;
  static bool _isLoading = true;
  static String? _errorMessage;

  static Position? get userPosition => _userPosition;
  static bool get isLoading => _isLoading;
  static String? get errorMessage => _errorMessage;

  static void setState({
    Position? position,
    bool? isLoading,
    String? errorMessage,
  }) {
    _userPosition = position ?? _userPosition;
    _isLoading = isLoading ?? _isLoading;
    _errorMessage = errorMessage ?? _errorMessage;
  }

  static void reset() {
    _userPosition = null;
    _isLoading = true;
    _errorMessage = null;
  }
}

class NearbyView extends StatefulWidget {
  final Future<void> Function()? onRefresh;

  const NearbyView({
    super.key,
    this.onRefresh,
  });

  @override
  State<NearbyView> createState() => _NearbyViewState();
}

class _NearbyViewState extends State<NearbyView> with UiLoggy {
  List<MapEntry<Measurement, double>> _nearbyMeasurementsWithDistance = [];
  static const int _maxNearbyLocations = 4;
  static const double _defaultSearchRadius = 10.0;
  bool _isFetchingLocation = false;
  CancelableOperation<Position>? _locationOperation;

  @override
  void initState() {
    super.initState();
    loggy.info('Initializing NearbyViewState');
    _startLocationFetch();
  }

  void _startLocationFetch() {
    if (!_isFetchingLocation && NearbyViewStateManager.userPosition == null) {
      _initializeLocationAndData();
    } else {
      loggy
          .info('Skipping location fetch: already fetching or position exists');
    }
  }

  Future<void> _handleRefresh() async {
    loggy.info('Manually refreshing nearby view data');

    NearbyViewStateManager.reset();
    _nearbyMeasurementsWithDistance = [];

    setState(() {});

    await _initializeLocationAndData();

    return Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> _initializeLocationAndData() async {
    if (_isFetchingLocation) {
      loggy.info('Location fetch already in progress, skipping');
      return;
    }

    _isFetchingLocation = true;
    try {
      NearbyViewStateManager.setState(isLoading: true, errorMessage: null);

      Future.delayed(const Duration(seconds: 6), () {
        if (mounted && NearbyViewStateManager.isLoading) {
          loggy.warning('Forcing UI update after timeout');
          NearbyViewStateManager.setState(
            isLoading: false,
            errorMessage: 'Location request took too long. Please try again.',
          );
          if (mounted) setState(() {});
          _isFetchingLocation = false;
        }
      });

      loggy.info('Starting location fetch');
      context.read<DashboardBloc>().add(LoadDashboard());

      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      loggy.info('Location services enabled: $serviceEnabled');
      if (!serviceEnabled) {
        NearbyViewStateManager.setState(
          isLoading: false,
          errorMessage:
              'Location services are disabled. Please enable location services in your device settings.',
        );
        loggy.info('Set error: Location services disabled');
        _isFetchingLocation = false;
        if (mounted) setState(() {});
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      loggy.info('Location permission: $permission');

      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        loggy.info('Requested permission, new status: $permission');

        if (permission == LocationPermission.denied) {
          NearbyViewStateManager.setState(
            isLoading: false,
            errorMessage:
                'Location permission denied. Please grant location permission to see air quality data near you.',
          );
          loggy.info('Set error: Location permission denied');
          _isFetchingLocation = false;
          if (mounted) setState(() {});
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        NearbyViewStateManager.setState(
          isLoading: false,
          errorMessage:
              'Location permissions are permanently denied. Please enable location in app settings.',
        );
        loggy.info('Set error: Location permission permanently denied');
        _isFetchingLocation = false;
        if (mounted) setState(() {});
        return;
      }

      try {
        loggy.info('Attempting to get current position');
        _locationOperation = CancelableOperation.fromFuture(
          Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.medium,
          ).timeout(
            const Duration(seconds: 5),
            onTimeout: () {
              loggy.error('Location request timed out');
              throw TimeoutException(
                  'Location request timed out after 5 seconds');
            },
          ),
        );

        final position = await _locationOperation!.value;

        if (!mounted) {
          loggy.warning('Widget unmounted before setting position');
          _isFetchingLocation = false;
          return;
        }

        loggy.info(
            'Retrieved user position: ${position.latitude}, ${position.longitude}');

        NearbyViewStateManager.setState(
          position: position,
          isLoading: false,
        );
        if (mounted) setState(() {});
      } catch (e) {
        if (!mounted) {
          loggy.warning('Widget unmounted during location error handling');
          _isFetchingLocation = false;
          return;
        }

        loggy.error('Error getting user position: $e');

        if (e is TimeoutException) {
          NearbyViewStateManager.setState(
            isLoading: false,
            errorMessage:
                'Location request timed out. Please check your location settings and try again.',
          );
          loggy.info('Set error: Location request timed out');
          _isFetchingLocation = false;
          if (mounted) setState(() {});
          return;
        }

        try {
          final lastKnownPosition = await Geolocator.getLastKnownPosition();
          if (lastKnownPosition != null && mounted) {
            loggy.info(
                'Using last known position: ${lastKnownPosition.latitude}, ${lastKnownPosition.longitude}');
            NearbyViewStateManager.setState(
              position: lastKnownPosition,
              isLoading: false,
            );
            if (mounted) setState(() {});
            _isFetchingLocation = false;
            return;
          }
        } catch (fallbackError) {
          loggy.error('Error getting last known position: $fallbackError');
        }

        if (mounted) {
          NearbyViewStateManager.setState(
            isLoading: false,
            errorMessage:
                'Could not determine your location. Please try again.',
          );
          loggy.info('Set error: Could not determine location');
          if (mounted) setState(() {});
        }
      }
    } catch (e) {
      if (!mounted) {
        loggy.warning('Widget unmounted during general error handling');
        _isFetchingLocation = false;
        return;
      }
      loggy.error('Error initializing location: $e');
      NearbyViewStateManager.setState(
        isLoading: false,
        errorMessage:
            'An error occurred while accessing location services: ${e.toString()}',
      );
      loggy.info('Set error: General location error');
      if (mounted) setState(() {});
    } finally {
      _isFetchingLocation = false;
      _locationOperation = null;
    }
  }

  @override
  void dispose() {
    loggy.info('Disposing NearbyView');
    _locationOperation?.cancel();
    _isFetchingLocation = false;
    super.dispose();
  }

  double _calculateDistance(
      double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) / 1000;
  }

  List<MapEntry<Measurement, double>> _findNearbyMeasurementsWithDistance(
      List<Measurement> allMeasurements) {
    if (NearbyViewStateManager.userPosition == null) {
      loggy.warning(
          'No user position available when filtering nearby measurements');
      return [];
    }

    loggy.info(
        'Finding nearby measurements from ${allMeasurements.length} total measurements');
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

      final distance = _calculateDistance(
          NearbyViewStateManager.userPosition!.latitude,
          NearbyViewStateManager.userPosition!.longitude,
          latitude,
          longitude);

      if (distance <= _defaultSearchRadius) {
        measWithDistance.add(MapEntry(measurement, distance));
        loggy.info(
            'Found nearby measurement at ${siteDetails.name ?? "Unknown"}: ${distance.toStringAsFixed(2)}km away');
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

  void _retry() {
    _handleRefresh();
  }

  void _openLocationSettings() async {
    bool didOpen = await Geolocator.openLocationSettings();
    if (didOpen && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Please enable location services and return to the app'),
          duration: Duration(seconds: 5),
        ),
      );
    }
  }

  // Extract UI builders for each state
  Widget _buildPermissionError() {
    loggy.info('Rendering permission error UI');
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        NearbyViewEmptyState(
          errorMessage: NearbyViewStateManager.errorMessage,
          onRetry: _retry,
        ),
      ],
    );
  }

  Widget _buildLocationServicesDisabled() {
    loggy.info('Rendering services disabled error UI');
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.location_off, color: Colors.amber, size: 48),
                const SizedBox(height: 16),
                Text(
                  "Location Services Disabled",
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
        ),
      ],
    );
  }

  Widget _buildTimeoutError() {
    loggy.info('Rendering timeout error UI');
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.7,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Timeout Error'),
                const SizedBox(height: 16),
                Text(
                  NearbyViewStateManager.errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _retry,
                  child: const Text('Try Again'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLoadingLocation() {
    loggy.info('Rendering loading UI');
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.7,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
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
          ),
        ),
      ],
    );
  }

  Widget _buildLoadingDashboard() {
    loggy.info('Rendering dashboard loading UI');
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.7,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(color: AppColors.primaryColor),
                const SizedBox(height: 16),
                Text(
                  "Loading air quality data near you...",
                  style: TextStyle(
                    fontSize: 16,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "Location found: ${NearbyViewStateManager.userPosition!.latitude.toStringAsFixed(4)}, ${NearbyViewStateManager.userPosition!.longitude.toStringAsFixed(4)}",
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNoNearbyStations() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.7,
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                vertical: 90,
                horizontal: 16,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  const Icon(Icons.location_off, color: Colors.amber, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    "No air quality stations found nearby",
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
                  const SizedBox(height: 8),
                  Text(
                    "Your location: ${NearbyViewStateManager.userPosition!.latitude.toStringAsFixed(4)}, ${NearbyViewStateManager.userPosition!.longitude.toStringAsFixed(4)}",
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _retry,
                    icon: const Icon(Icons.refresh, color: Colors.white),
                    label: const Text("Refresh"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNearbyMeasurements() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Icon(Icons.location_on, color: AppColors.primaryColor, size: 18),
              const SizedBox(width: 4),
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
              const Spacer(),
              TextButton.icon(
                onPressed: _retry,
                icon: const Icon(Icons.refresh, size: 18, color: Colors.white),
                label: const Text("Refresh"),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primaryColor,
                  visualDensity: VisualDensity.compact,
                ),
              ),
            ],
          ),
        ),
        if (NearbyViewStateManager.userPosition != null)
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.my_location, color: Colors.blue, size: 16),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      "Your location: ${NearbyViewStateManager.userPosition!.latitude.toStringAsFixed(4)}, ${NearbyViewStateManager.userPosition!.longitude.toStringAsFixed(4)}",
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
        ..._nearbyMeasurementsWithDistance.map((entry) {
          final measurement = entry.key;
          final distance = entry.value;

          return NearbyMeasurementCard(
              measurement: measurement, distance: distance);
        }),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildGenericError() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.7,
          child: Center(
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
                    NearbyViewStateManager.errorMessage!,
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
          ),
        ),
      ],
    );
  }

  Widget _buildPreparingData() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.7,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(
                  color: AppColors.primaryColor,
                  strokeWidth: 3,
                ),
                const SizedBox(height: 16),
                Text(
                  "Preparing air quality data...",
                  style: TextStyle(
                    fontSize: 16,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    loggy.info(
        'NearbyView build - isLoading: ${NearbyViewStateManager.isLoading}, hasError: ${NearbyViewStateManager.errorMessage != null}, hasPosition: ${NearbyViewStateManager.userPosition != null}');

    return SizedBox(
      height: MediaQuery.of(context).size.height,
      child: RefreshIndicator(
        onRefresh: widget.onRefresh ?? _handleRefresh,
        color: AppColors.primaryColor,
        backgroundColor: Theme.of(context).cardColor,
        child: BlocConsumer<DashboardBloc, DashboardState>(
          listener: (context, state) {
            loggy.info('Bloc state changed: $state');
            if (state is DashboardLoaded) {
              loggy.info('DashboardLoaded received, processing measurements');
              if (!mounted) return;
              setState(() {
                NearbyViewStateManager.setState(isLoading: false);
                if (state.response.measurements != null) {
                  _nearbyMeasurementsWithDistance =
                      _findNearbyMeasurementsWithDistance(
                          state.response.measurements!);
                }
              });
            } else if (state is DashboardLoadingError) {
              loggy.error('DashboardLoadingError: ${state.message}');
              if (!mounted) return;
              setState(() {
                NearbyViewStateManager.setState(
                  isLoading: false,
                  errorMessage: state.message,
                );
              });
            } else if (state is DashboardLoading) {
              loggy.info('DashboardLoading state, waiting for DashboardLoaded');
            } else {
              loggy.warning('Unexpected DashboardBloc state: $state');
            }
          },
          builder: (context, state) {
            // Permission error
            if (NearbyViewStateManager.errorMessage != null &&
                NearbyViewStateManager.errorMessage!.contains('permission')) {
              return _buildPermissionError();
            }

            // Location services disabled
            if (NearbyViewStateManager.errorMessage != null &&
                NearbyViewStateManager.errorMessage!.contains('services are disabled')) {
              return _buildLocationServicesDisabled();
            }

            // Timeout error
            if (NearbyViewStateManager.errorMessage != null &&
                NearbyViewStateManager.errorMessage!.contains('timed out')) {
              return _buildTimeoutError();
            }

            // Loading location
            if (NearbyViewStateManager.isLoading) {
              return _buildLoadingLocation();
            }

            // Loading dashboard with position available
            if (state is DashboardLoading &&
                NearbyViewStateManager.userPosition != null) {
              return _buildLoadingDashboard();
            }

            // Dashboard loaded with position but no nearby stations
            if (state is DashboardLoaded &&
                NearbyViewStateManager.userPosition != null) {
              if (_nearbyMeasurementsWithDistance.isEmpty) {
                return _buildNoNearbyStations();
              }
              
              // Dashboard loaded with position and nearby stations
              return _buildNearbyMeasurements();
            }

            // Generic error
            if (NearbyViewStateManager.errorMessage != null) {
              return _buildGenericError();
            }

            // Default fallback state - preparing data
            return _buildPreparingData();
          },
        ),
      ),
    );
  }
}