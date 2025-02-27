import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/swipeable_analytics_card.dart';
import 'package:airqo/src/meta/utils/colors.dart';

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
    if (widget.userPreferences == null || widget.userPreferences!.selectedSites.isEmpty) {
      loggy.info('No selected sites in user preferences');
      setState(() {
        isLoading = false;
      });
      return;
    }
    
    // Debug log all selected sites
    for (var site in widget.userPreferences!.selectedSites) {
      loggy.info('Selected site: ${site.name} (ID: ${site.id})');
    }
    
    // If dashboard is loaded, try to match sites with measurements
    if (state is DashboardLoaded) {
      loggy.info('Dashboard is loaded');
      
      if (state.response.measurements == null || state.response.measurements!.isEmpty) {
        loggy.warning('No measurements available in dashboard state');
        // All sites are unmatched
        setState(() {
          unmatchedSites = List.from(widget.userPreferences!.selectedSites);
          isLoading = false;
        });
        return;
      }
      
      loggy.info('Total measurements available: ${state.response.measurements!.length}');
      
      // Debug log first few measurements to check ID format
      final sampleSize = min(3, state.response.measurements!.length);
      for (var i = 0; i < sampleSize; i++) {
        final m = state.response.measurements![i];
        loggy.info('Sample measurement $i: ID=${m.id}, siteId=${m.siteId}, name=${m.siteDetails?.name}');
      }
      
      // Find measurements that match the selected site IDs
      final matched = <Measurement>[];
      final unmatched = <SelectedSite>[];
      
      for (final site in widget.userPreferences!.selectedSites) {
        bool found = false;
        
        // First look for exact match by ID
        for (final measurement in state.response.measurements!) {
          // Try matching with measurement.id
          if (measurement.id == site.id) {
            loggy.info('Found exact ID match for site: ${site.name} (ID: ${site.id})');
            matched.add(measurement);
            found = true;
            break;
          }
          
          // Try matching with siteDetails.id
          if (measurement.siteDetails?.id == site.id) {
            loggy.info('Found match with siteDetails.id for site: ${site.name} (ID: ${site.id})');
            matched.add(measurement);
            found = true;
            break;
          }
          
          // Try matching with siteId
          if (measurement.siteId == site.id) {
            loggy.info('Found match with siteId for site: ${site.name} (ID: ${site.id})');
            matched.add(measurement);
            found = true;
            break;
          }
        }
        
        // If still not found, try matching by name or location
        if (!found) {
          // Try matching by site name
          for (final measurement in state.response.measurements!) {
            // Match by site name from siteDetails
            if (measurement.siteDetails?.name != null && 
                measurement.siteDetails!.name!.toLowerCase() == site.name.toLowerCase()) {
              loggy.info('Found name match for site: ${site.name}');
              matched.add(measurement);
              found = true;
              break;
            }
          }
        }
        
        // If still not found, try matching by coordinates
        if (!found && site.latitude != null && site.longitude != null) {
          for (final measurement in state.response.measurements!) {
            // First try coordinates from siteDetails
            double? measLat = measurement.siteDetails?.approximateLatitude;
            double? measLong = measurement.siteDetails?.approximateLongitude;
            
            // Also try coordinates from siteCategory
            if (measLat == null || measLong == null) {
              measLat = measurement.siteDetails?.siteCategory?.latitude;
              measLong = measurement.siteDetails?.siteCategory?.longitude;
            }
            
            // Match with small tolerance
            const tolerance = 0.0001; // About 10 meters
            if (measLat != null && measLong != null &&
                (measLat - site.latitude!).abs() < tolerance &&
                (measLong - site.longitude!).abs() < tolerance) {
              
              loggy.info('Found coordinate match for site: ${site.name}');
              matched.add(measurement);
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          loggy.warning('No matching measurement found for site: ${site.name}');
          unmatched.add(site);
        }
      }
      
      loggy.info('Successfully matched ${matched.length} measurements');
      loggy.info('Unable to match ${unmatched.length} sites');
      
      setState(() {
        selectedMeasurements = matched;
        unmatchedSites = unmatched;
        isLoading = false;
      });
      
      // If we couldn't match any measurements but have selected sites, request a refresh
      if (matched.isEmpty && widget.userPreferences!.selectedSites.isNotEmpty) {
        loggy.warning('No measurements matched with selected sites, requesting refresh');
        _requestMeasurementsRefresh();
      }
    } else {
      // Dashboard not loaded yet
      loggy.info('Dashboard is not in loaded state, requesting data');
      _requestMeasurementsRefresh();
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
    
    // Update measurements list
    setState(() {
      selectedMeasurements.removeWhere((m) => m.id == id);
      unmatchedSites.removeWhere((s) => s.id == id);
    });
    
    if (widget.userPreferences == null) {
      loggy.warning('Cannot update preferences: userPreferences is null');
      return;
    }
    
    // Get all remaining site IDs
    final remainingSiteIds = widget.userPreferences!.selectedSites
        .where((site) => site.id != id)
        .map((site) => site.id)
        .toList();
    
    loggy.info('Updating preferences with remaining IDs: $remainingSiteIds');
    
    // Dispatch event to update preferences
    context.read<DashboardBloc>().add(UpdateSelectedLocations(remainingSiteIds));
    
    // Show feedback to the user
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Location removed'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _navigateToLocationSelection() async {
    loggy.info('Navigating to location selection screen');
    
    // Navigate to location selection screen
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const LocationSelectionScreen(),
      ),
    );
    
    // If we get a result back, reload measurements
    if (result != null) {
      loggy.info('Returned from location selection with result');
      
      setState(() {
        isLoading = true;
      });
      
      // Force reload dashboard data to get fresh measurements and preferences
      context.read<DashboardBloc>().add(LoadDashboard());
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
      child: Column(
        children: [
          if (isLoading)
            _buildLoadingState()
          else if (selectedMeasurements.isEmpty && unmatchedSites.isEmpty)
            _buildEmptyState()
          else
            ...[
              // Show matched measurements with analytics cards
              ...selectedMeasurements.map((measurement) => 
                SwipeableAnalyticsCard(
                  measurement: measurement,
                  onRemove: _removeLocation,
                )
              ),
              
              // Show basic cards for unmatched sites
              ...unmatchedSites.map((site) => 
                _buildUnmatchedSiteCard(site)
              ),
            ],
          
          const SizedBox(height: 20),
          
          // Add location button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _navigateToLocationSelection,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  selectedMeasurements.isEmpty && unmatchedSites.isEmpty 
                      ? 'Add Locations' 
                      : 'Manage Locations',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
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
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                            Icon(Icons.location_on, color: AppColors.primaryColor),
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
                        if (site.searchName != null && site.searchName!.isNotEmpty)
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
          Icon(
            Icons.location_on_outlined,
            size: 64,
            color: Colors.grey.shade500,
          ),
          const SizedBox(height: 16),
          Text(
            'No saved locations',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.headlineMedium?.color,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add locations to monitor air quality in places that matter to you',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Theme.of(context).textTheme.bodySmall?.color,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}