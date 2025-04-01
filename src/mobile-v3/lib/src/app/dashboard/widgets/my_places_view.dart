import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/swipeable_analytics_card.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/shared/services/notification_manager.dart';

class MyPlacesView extends StatefulWidget {
  final UserPreferencesModel? userPreferences;

  const MyPlacesView({
    super.key,
    this.userPreferences,
  });

  @override
  State<MyPlacesView> createState() => _MyPlacesViewState();
}

class _MyPlacesViewState extends State<MyPlacesView> with UiLoggy {
  List<Measurement> selectedMeasurements = [];
  List<SelectedSite> unmatchedSites = [];
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    loggy.info('Initializing MyPlacesView');
    _debugUserPreferences();
    _debugDashboardState();
    _loadSelectedMeasurements();
  }

  @override
  void didUpdateWidget(MyPlacesView oldWidget) {
    super.didUpdateWidget(oldWidget);

    // If user preferences changed, reload measurements
    if (widget.userPreferences != oldWidget.userPreferences) {
      loggy.info('User preferences updated, reloading measurements');
      _loadSelectedMeasurements();
    }
  }

  void _loadSelectedMeasurements() {
    final state = context.read<DashboardBloc>().state;

    loggy.info('Loading measurements. Dashboard state: ${state.runtimeType}');

    // First clear previous state
    setState(() {
      isLoading = true;
      selectedMeasurements = [];
      unmatchedSites = [];
    });

    // Check if we have preferences with selected sites
    if (widget.userPreferences == null ||
        widget.userPreferences!.selectedSites.isEmpty) {
      loggy.info('No selected sites in user preferences');
      setState(() {
        isLoading = false;
      });
      return;
    }

    // Debug log all selected sites
    for (var site in widget.userPreferences!.selectedSites) {
      loggy.info('Selected site in preferences: ${site.name} (ID: ${site.id})');
    }

    // If dashboard is loaded, try to match sites with measurements
    if (state is DashboardLoaded) {
      loggy.info('Dashboard is loaded');

      if (state.response.measurements == null ||
          state.response.measurements!.isEmpty) {
        loggy.warning('No measurements available in dashboard state');
        // All sites are unmatched
        setState(() {
          unmatchedSites = List.from(widget.userPreferences!.selectedSites);
          isLoading = false;
        });
        return;
      }

      loggy.info(
          'Total measurements available: ${state.response.measurements!.length}');

      // Debug log first few measurements to check ID format
      final sampleSize = min(3, state.response.measurements!.length);
      for (var i = 0; i < sampleSize; i++) {
        final m = state.response.measurements![i];
        loggy.info(
            'Sample measurement $i: ID=${m.id}, siteId=${m.siteId}, siteDetails.id=${m.siteDetails?.id}');
      }

      // Find measurements that match the selected site IDs
      final matched = <Measurement>[];
      final unmatched = <SelectedSite>[];

      // Create a map of measurements by ID for faster lookups
      final measurementsById = <String, Measurement>{};
      final measurementsBySiteId = <String, Measurement>{};
      final measurementsBySiteDetailsId = <String, Measurement>{};

      // Map measurements by all possible ID fields
      for (final measurement in state.response.measurements!) {
        if (measurement.id != null) {
          measurementsById[measurement.id!] = measurement;
        }
        if (measurement.siteId != null) {
          measurementsBySiteId[measurement.siteId!] = measurement;
        }
        if (measurement.siteDetails?.id != null) {
          measurementsBySiteDetailsId[measurement.siteDetails!.id!] =
              measurement;
        }
      }

      for (final site in widget.userPreferences!.selectedSites) {
        bool found = false;

        // Check all ID maps for matches
        if (measurementsById.containsKey(site.id)) {
          loggy.info(
              'Found match in measurementsById for site: ${site.name} (ID: ${site.id})');
          matched.add(measurementsById[site.id]!);
          found = true;
        } else if (measurementsBySiteId.containsKey(site.id)) {
          loggy.info(
              'Found match in measurementsBySiteId for site: ${site.name} (ID: ${site.id})');
          matched.add(measurementsBySiteId[site.id]!);
          found = true;
        } else if (measurementsBySiteDetailsId.containsKey(site.id)) {
          loggy.info(
              'Found match in measurementsBySiteDetailsId for site: ${site.name} (ID: ${site.id})');
          matched.add(measurementsBySiteDetailsId[site.id]!);
          found = true;
        }

        // If not found by ID, try name matching as fallback
        if (!found) {
          loggy.info(
              'No ID match found for site: ${site.name} (ID: ${site.id}), trying name match');

          for (final measurement in state.response.measurements!) {
            // Match by site name (case insensitive)
            if (measurement.siteDetails?.name != null &&
                measurement.siteDetails!.name!.toLowerCase() ==
                    site.name.toLowerCase()) {
              loggy.info('Found name match for site: ${site.name}');
              matched.add(measurement);
              found = true;
              break;
            }

            // Try matching with search name too
            if (measurement.siteDetails?.searchName != null &&
                site.searchName != null &&
                measurement.siteDetails!.searchName!.toLowerCase() ==
                    site.searchName!.toLowerCase()) {
              loggy.info(
                  'Found search name match for site: ${site.name} (searchName: ${site.searchName})');
              matched.add(measurement);
              found = true;
              break;
            }
          }
        }

        // If still not found, try coordinates as last resort
        if (!found && site.latitude != null && site.longitude != null) {
          loggy.info('Trying coordinates match for site: ${site.name}');

          for (final measurement in state.response.measurements!) {
            // Get coordinates from measurement
            double? measLat = measurement.siteDetails?.approximateLatitude;
            double? measLong = measurement.siteDetails?.approximateLongitude;

            // If not in siteDetails, try siteCategory
            if (measLat == null || measLong == null) {
              measLat = measurement.siteDetails?.siteCategory?.latitude;
              measLong = measurement.siteDetails?.siteCategory?.longitude;
            }

            // Match with tolerance (approximately 100 meters)
            const tolerance = 0.001;
            if (measLat != null &&
                measLong != null &&
                (measLat - site.latitude!).abs() < tolerance &&
                (measLong - site.longitude!).abs() < tolerance) {
              loggy.info(
                  'Found coordinate match for site: ${site.name} at approx. lat/long: $measLat/$measLong');
              matched.add(measurement);
              found = true;
              break;
            }
          }
        }

        if (!found) {
          loggy.warning(
              'No matching measurement found for site: ${site.name} (ID: ${site.id})');
          unmatched.add(site);
        }
      }

      loggy.info('Successfully matched ${matched.length} measurements');
      loggy.info('Unable to match ${unmatched.length} sites');

      // Add debug logging for the matched measurements
      for (final m in matched) {
        loggy.info(
            'Matched measurement: ID=${m.id}, Name=${m.siteDetails?.name}');
      }

      // Update state with the results
      setState(() {
        selectedMeasurements = matched;
        unmatchedSites = unmatched;
        isLoading = false;
      });

      // If we couldn't match any measurements but have selected sites, request a refresh
      if (matched.isEmpty && widget.userPreferences!.selectedSites.isNotEmpty) {
        loggy.warning(
            'No measurements matched with selected sites, requesting refresh');
        _requestMeasurementsRefresh();
      }
    } else {
      // Dashboard not loaded yet
      loggy.info('Dashboard is not in loaded state, requesting data');
      _requestMeasurementsRefresh();
    }
  }

// Add this debugging method to the _MyPlacesViewState class to help diagnose issues
  void _debugUserPreferences() {
    if (widget.userPreferences == null) {
      loggy.warning('🔴 User preferences are NULL');
      return;
    }

    loggy.info('🔍 User Preferences Debug Info:');
    loggy.info('ID: ${widget.userPreferences!.id}');
    loggy.info('User ID: ${widget.userPreferences!.userId}');
    loggy.info(
        'Selected Sites Count: ${widget.userPreferences!.selectedSites.length}');

    for (int i = 0; i < widget.userPreferences!.selectedSites.length; i++) {
      final site = widget.userPreferences!.selectedSites[i];
      loggy.info('Site $i:');
      loggy.info('  - ID: ${site.id}');
      loggy.info('  - Name: ${site.name}');
      loggy.info('  - Search Name: ${site.searchName}');
      loggy.info('  - Coordinates: ${site.latitude}, ${site.longitude}');
    }
  }

// Add this debugging method to inspect the dashboard state
  void _debugDashboardState() {
    final state = context.read<DashboardBloc>().state;

    loggy.info('🔍 Dashboard State Debug Info:');
    loggy.info('State Type: ${state.runtimeType}');

    if (state is DashboardLoaded) {
      final response = state.response;
      final userPrefs = state.userPreferences;

      loggy.info('Response Success: ${response.success}');
      loggy.info('Response Message: ${response.message}');
      loggy.info('Measurements Count: ${response.measurements?.length ?? 0}');
      loggy.info('Has User Preferences: ${userPrefs != null}');

      if (userPrefs != null) {
        loggy.info('User Preferences ID: ${userPrefs.id}');
        loggy.info(
            'Selected Sites in Preferences: ${userPrefs.selectedSites.length}');

        final selectedIds = state.selectedLocationIds;
        loggy.info('Selected Location IDs: ${selectedIds.join(', ')}');
      }
    }
  }

  // Helper to get the min of two integers
  int min(int a, int b) => a < b ? a : b;

  void _requestMeasurementsRefresh() {
    loggy.info('Requesting measurements refresh');
    // Request a dashboard reload to get measurements
    context.read<DashboardBloc>().add(LoadDashboard());
  }

  void _removeLocation(String id) {
    loggy.info('Removing location with ID: $id');

    String locationName = "Location";
    for (var m in selectedMeasurements) {
      if (m.id == id || m.siteId == id || m.siteDetails?.id == id) {
        locationName = m.siteDetails?.name ?? "Location";
        break;
      }
    }
    for (var s in unmatchedSites) {
      if (s.id == id) {
        locationName = s.name;
        break;
      }
    }

    setState(() {
      selectedMeasurements.removeWhere(
          (m) => m.id == id || m.siteId == id || m.siteDetails?.id == id);
      unmatchedSites.removeWhere((s) => s.id == id);
    });

    if (widget.userPreferences == null) {
      loggy.warning('Cannot update preferences: userPreferences is null');
      return;
    }

    final remainingSiteIds = widget.userPreferences!.selectedSites
        .where((site) => site.id != id)
        .map((site) => site.id)
        .toList();

    loggy.info('Filtered preferences by name: $locationName');
    loggy.info('Remaining IDs: $remainingSiteIds');

    final dashboardBloc = context.read<DashboardBloc>();
    dashboardBloc.add(UpdateSelectedLocations(remainingSiteIds));
    dashboardBloc.add(LoadUserPreferences()); // Ensure state refreshes

    NotificationManager().showNotification(
      context,
      message: '"$locationName" has been removed from your places',
      isSuccess: true,
    );
  }

  void _navigateToLocationSelection() async {
    loggy.info('Navigating to location selection screen');

    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const LocationSelectionScreen()),
    );

    if (result != null && mounted) {
      loggy.info('Returned from location selection with result');
      setState(() {
        isLoading = true;
      });
      context.read<DashboardBloc>().add(LoadDashboard());
      // Wait for state to update via BlocListener, not synchronously
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<DashboardBloc, DashboardState>(
      listener: (context, state) {
        loggy.info('Dashboard state changed to ${state.runtimeType}');
        if (state is DashboardLoaded) {
          _loadSelectedMeasurements();
        }
      },
      child: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 0),
            child: Column(
              children: [
                if (isLoading)
                  _buildLoadingState()
                else if (selectedMeasurements.isEmpty && unmatchedSites.isEmpty)
                  _buildEmptyState()
                else ...[
                  // Show matched measurements with analytics cards
                  ...selectedMeasurements
                      .map((measurement) => Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: SwipeableAnalyticsCard(
                              measurement: measurement,
                              onRemove: _removeLocation,
                            ),
                          )),

                  // Show basic cards for unmatched sites
                  ...unmatchedSites.map((site) => Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: _buildUnmatchedSiteCard(site),
                      )),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUnmatchedSiteCard(SelectedSite site) {
    return Dismissible(
      key: Key(site.id),
      background: Container(
        color: Colors.red,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(
          Icons.delete,
          color: Colors.white,
        ),
      ),
      direction: DismissDirection.endToStart,
      onDismissed: (direction) {
        _removeLocation(site.id);
      },
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
        child: Padding(
          padding: const EdgeInsets.all(16),
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
                        Row(
                          children: [
                            Icon(Icons.location_on,
                                color: AppColors.primaryColor),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                site.name,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        if (site.searchName != null &&
                            site.searchName!.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(left: 32, top: 4),
                            child: Text(
                              site.searchName!,
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 14,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  Chip(
                    label: const Text('Loading data'),
                    backgroundColor: Colors.amber.shade100,
                    labelStyle: TextStyle(
                      color: Colors.amber.shade900,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (site.latitude != null && site.longitude != null)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Lat: ${site.latitude!.toStringAsFixed(6)}',
                      style: const TextStyle(fontSize: 12),
                    ),
                    Text(
                      'Long: ${site.longitude!.toStringAsFixed(6)}',
                      style: const TextStyle(fontSize: 12),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Container(
      padding: const EdgeInsets.all(24),
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade800),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(
            'Loading your locations...',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.headlineMedium?.color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16, top: 24, bottom: 8),
          child: Text(
            'Add places you love',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.headlineMedium?.color,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(left: 16, bottom: 24),
          child: Text(
            'Start by adding locations you care about.',
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
          ),
        ),
        // First container - identical to the second one
        _buildAddLocationContainer(),
        // Second container - identical to the first one
        _buildAddLocationContainer(),
      ],
    );
  }

// Helper method to create the identical containers
  Widget _buildAddLocationContainer() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: DottedBorder(
        borderType: BorderType.RRect,
        radius: const Radius.circular(12),
        color: AppColors.primaryColor,
        strokeWidth: 1.5,
        dashPattern: const [8, 6],
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: _navigateToLocationSelection,
              child: Container(
                height: 160,
                width: double.infinity,
                alignment: Alignment.center,
                child: Text(
                  '+Add Location',
                  style: TextStyle(
                    color: AppColors.primaryColor,
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}