import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../meta/utils/colors.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/shared/utils/connectivity_helper.dart';
import 'package:airqo/src/app/dashboard/repository/user_preferences_repository.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/swipeable_analytics_card.dart';
import 'package:loggy/loggy.dart';

class MyPlacesView extends StatefulWidget {
  const MyPlacesView({super.key});

  @override
  State<MyPlacesView> createState() => _MyPlacesViewState();
}

class _MyPlacesViewState extends State<MyPlacesView> with UiLoggy {
  List<String>? selectedLocationIds;
  bool isLoading = false;
  final UserPreferencesRepository _preferencesRepo = UserPreferencesImpl();
  String? currentUserId;
  
  // Flag to avoid duplicate dashboard loads
  // bool _dashboardLoadTriggered = false;

  @override
  void initState() {
    super.initState();
    _initializeUserData();
    
    // Make sure we listen to dashboard state changes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final dashboardState = context.read<DashboardBloc>().state;
      if (dashboardState is! DashboardLoaded) {
        loggy.info('Dashboard not loaded in initState, triggering load');
        context.read<DashboardBloc>().add(LoadDashboard());
      } else {
        loggy.info('Dashboard already loaded in initState');
      }
    });
  }

  Future<void> _initializeUserData() async {
    try {
      setState(() {
        isLoading = true;
      });
      
      final userId = await AuthHelper.getCurrentUserId();
      loggy.info('Retrieved user ID: $userId');
      
      if (userId != null) {
        setState(() {
          currentUserId = userId;
        });
        

        await _loadUserPreferences(userId);
      } else {
        loggy.warning('No user ID found - user might not be logged in');
      }
    } catch (e) {
      loggy.error('Error initializing user data: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _loadUserPreferences(String userId) async {
    try {
      final response = await _preferencesRepo.getUserPreferences(userId);

      if (response['success'] == true && response['data'] != null) {
        final prefsData = response['data'];
        
        if (prefsData['selected_sites'] != null && prefsData['selected_sites'] is List) {
          setState(() {
            selectedLocationIds = (prefsData['selected_sites'] as List)
                .map((site) => site['_id'].toString())
                .toList()
                .cast<String>();
          });
          
          loggy.info('Loaded ${selectedLocationIds?.length ?? 0} previously selected locations');
          
          // If we have locations, make sure the dashboard is loaded
          if (selectedLocationIds != null && selectedLocationIds!.isNotEmpty) {
            final dashboardBloc = context.read<DashboardBloc>();
            if (dashboardBloc.state is! DashboardLoaded) {
              dashboardBloc.add(LoadDashboard());
            }
          }
        }
      }
    } catch (e) {
      loggy.error('Error loading user preferences: $e');
    }
  }
  
  // Remove a location from saved locations
  Future<void> _removeLocation(String locationId) async {
    if (currentUserId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot remove location: User not logged in')),
      );
      return;
    }
    
    // Check connectivity first
    final hasConnection = await ConnectivityHelper.isConnected();
    if (!hasConnection) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No internet connection. Please try again when connected.')),
      );
      return;
    }
    
    try {
      setState(() {
        isLoading = true;
      });
      
      // Remove the location ID from our local list
      setState(() {
        selectedLocationIds?.remove(locationId);
      });
      
      // Create updated selected sites list for the API
      final dashboardBloc = context.read<DashboardBloc>();
      if (dashboardBloc.state is DashboardLoaded) {
        final dashboardState = dashboardBloc.state as DashboardLoaded;
        final measurements = dashboardState.response.measurements ?? [];
        
        // Find measurements corresponding to remaining IDs
        final List<Map<String, dynamic>> updatedSites = (selectedLocationIds ?? []).map((id) {
          // Find the corresponding measurement
          final measurement = measurements.firstWhere(
            (m) => m.id == id,
            orElse: () => throw Exception('Measurement not found for ID $id'),
          );
          
          // Create site entry
          return {
            "_id": id,
            "name": measurement.siteDetails?.name ?? 'Unknown Location',
            "search_name": measurement.siteDetails?.searchName ?? 
                measurement.siteDetails?.name ?? 'Unknown Location',
            "latitude": measurement.siteDetails?.approximateLatitude ??
                measurement.siteDetails?.approximateLatitude,
            "longitude": measurement.siteDetails?.approximateLongitude ??
                measurement.siteDetails?.approximateLongitude,
          };
        }).toList();
        
        // Prepare the request body
        final Map<String, dynamic> requestBody = {
          "user_id": currentUserId,
          "selected_sites": updatedSites,
        };
        
        // Update preferences
        final response = await _preferencesRepo.replacePreference(requestBody);
        
        if (response['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location removed successfully')),
          );
        } else {
          // If API request fails, restore the removed ID
          setState(() {
            if (selectedLocationIds != null && !selectedLocationIds!.contains(locationId)) {
              selectedLocationIds!.add(locationId);
            }
          });
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to remove location: ${response["message"]}')),
          );
        }
      }
    } catch (e) {
      loggy.error('Error removing location: $e');
      
      // Restore the ID if there was an error
      setState(() {
        if (selectedLocationIds != null && !selectedLocationIds!.contains(locationId)) {
          selectedLocationIds!.add(locationId);
        }
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('An error occurred: ${e.toString()}')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Add places you love",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).textTheme.headlineLarge?.color,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Start by adding locations you care about.",
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
          ),
          const SizedBox(height: 24),

          // Show loading indicator when fetching user data
          if (isLoading)
            Center(
              child: CircularProgressIndicator(
                color: AppColors.primaryColor,
              ),
            )
          else ...[
            // Show saved locations if any
            if (selectedLocationIds != null && selectedLocationIds!.isNotEmpty)
              _buildSavedLocationsSection(),
            
            // Show card options if no locations are saved
            if (selectedLocationIds == null || selectedLocationIds!.isEmpty) ...[
              _buildAddLocationCard(context),
              const SizedBox(height: 16),
              _buildAddLocationCardWithFAB(context),
            ],
          ],
        ],
      ),
    );
  }
  
  Widget _buildSavedLocationsSection() {
    // Get the dashboard state to access measurements
    final dashboardState = context.watch<DashboardBloc>().state;
    
    loggy.info('Building saved locations with ${selectedLocationIds?.length ?? 0} IDs');
    
    if (dashboardState is DashboardLoaded) {
      loggy.info('Dashboard is loaded with ${dashboardState.response.measurements?.length ?? 0} measurements');
      
      // Log all IDs for debugging
      if (dashboardState.response.measurements != null) {
        loggy.info('Available measurement IDs: ${dashboardState.response.measurements!.map((m) => m.id).toList()}');
      }
      
      if (selectedLocationIds != null) {
        loggy.info('Selected location IDs: $selectedLocationIds');
      }
      
      // Find measurements that match our selected IDs
      final selectedMeasurements = dashboardState.response.measurements
          ?.where((measurement) {
            final isSelected = selectedLocationIds?.contains(measurement.id) ?? false;
            if (isSelected) {
              loggy.info('Found matching measurement: ${measurement.id}');
            }
            return isSelected;
          })
          .toList() ?? [];
      
      loggy.info('Found ${selectedMeasurements.length} matching measurements');
      
      if (selectedMeasurements.isEmpty) {
        // If we have IDs but no matching measurements, trigger a dashboard reload
        if (selectedLocationIds != null && selectedLocationIds!.isNotEmpty) {
          loggy.info('No matching measurements found for IDs, triggering dashboard reload');
          Future.microtask(() => context.read<DashboardBloc>().add(LoadDashboard()));
        }
        return _buildEmptySavedLocationsView();
      }
      
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Your saved locations",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Theme.of(context).textTheme.titleLarge?.color,
                ),
              ),
              OutlinedButton(
                onPressed: () => _navigateToLocationSelection(context),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppColors.primaryColor),
                ),
                child: Text(
                  "Manage",
                  style: TextStyle(
                    color: AppColors.primaryColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Analytics cards for selected locations
          ...selectedMeasurements.map((measurement) => Column(
            children: [
              SwipeableAnalyticsCard(
                measurement: measurement,
                onRemove: _removeLocation,
              ),
              const SizedBox(height: 16),
            ],
          )),
          
          // Add more locations button
          if (selectedMeasurements.length < 4)
            OutlinedButton.icon(
              onPressed: () => _navigateToLocationSelection(context),
              icon: Icon(Icons.add, color: AppColors.primaryColor),
              label: Text(
                "Add more locations",
                style: TextStyle(
                  color: AppColors.primaryColor,
                ),
              ),
              style: OutlinedButton.styleFrom(
                minimumSize: Size(double.infinity, 48),
                side: BorderSide(color: AppColors.primaryColor),
              ),
            ),
        ],
      );
    } else {
      return _buildEmptySavedLocationsView();
    }
  }
  
  Widget _buildEmptySavedLocationsView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Your saved locations",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Theme.of(context).textTheme.titleLarge?.color,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          selectedLocationIds != null && selectedLocationIds!.isNotEmpty
              ? "Loading your locations..."
              : "You haven't saved any locations yet.",
          style: TextStyle(
            color: Theme.of(context).textTheme.bodyMedium?.color,
          ),
        ),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: () => _navigateToLocationSelection(context),
          icon: Icon(Icons.add, color: AppColors.primaryColor),
          label: Text(
            "Add locations",
            style: TextStyle(
              color: AppColors.primaryColor,
            ),
          ),
          style: OutlinedButton.styleFrom(
            minimumSize: Size(double.infinity, 48),
            side: BorderSide(color: AppColors.primaryColor),
          ),
        ),
        const SizedBox(height: 24),
        _buildAddLocationCard(context),
      ],
    );
  }

  // Open location selection screen
  void _navigateToLocationSelection(BuildContext context) async {
    // Check for internet connection
    final hasConnection = await ConnectivityHelper.isConnected();
    if (!hasConnection) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No internet connection. Please try again when connected.'),
        ),
      );
      return;
    }

    final dashboardBloc = context.read<DashboardBloc>();
    if (dashboardBloc.state is! DashboardLoaded) {
      dashboardBloc.add(LoadDashboard());
    }

    final result = await Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const LocationSelectionScreen())
    );
    
    // Handle the returned selected locations
    if (result != null) {
      loggy.info('Received locations from selection screen: $result');
      
      // Force the list to be treated as a List<String>
      final List<String> locationIds = List<String>.from(result);
      
      setState(() {
        selectedLocationIds = locationIds;
      });
      
      loggy.info('Selected locations updated: $selectedLocationIds');
      
      // Make sure dashboard is loaded to display these locations
      final dashboardBloc = context.read<DashboardBloc>();
      if (dashboardBloc.state is! DashboardLoaded) {
        dashboardBloc.add(LoadDashboard());
      }
      
      // Show a success message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Successfully updated your locations'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  Widget _buildAddLocationCard(BuildContext context) {
    return DottedBorder(
      color: AppColors.primaryColor,
      strokeWidth: 2,
      dashPattern: const [8, 4], // Dash and gap size
      borderType: BorderType.RRect,
      radius: const Radius.circular(8),
      child: Container(
        height: 150,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          //color: const Color(0xFF2E2F33), // Background color inside dashed border
          borderRadius: BorderRadius.circular(8),
        ),
        child: TextButton(
          onPressed: () => _navigateToLocationSelection(context),
          child: Text(
            "+Add Location",
            style: TextStyle(
              fontSize: 18,
              color: AppColors.primaryColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAddLocationCardWithFAB(BuildContext context) {
    return Stack(
      children: [
        DottedBorder(
          color: AppColors.primaryColor,
          strokeWidth: 2,
          dashPattern: const [8, 4], 
          borderType: BorderType.RRect,
          radius: const Radius.circular(8),
          child: Container(
            height: 150,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              //color: Color(0xFF2E2F33),  Background color inside dashed border
              borderRadius: BorderRadius.circular(8),
            ),
            child: TextButton(
              onPressed: () => _navigateToLocationSelection(context),
              child: Text(
                "+Add Location",
                style: TextStyle(
                  fontSize: 18,
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ),
        Positioned(
          right: 0,
          bottom: 0,
          child: Container(
            margin: const EdgeInsets.all(8),
            child: FloatingActionButton(
              onPressed: () => _navigateToLocationSelection(context),
              backgroundColor: AppColors.primaryColor,
              mini: false,
              child: const Icon(Icons.add, color: Colors.white),
            ),
          ),
        ),
      ],
    );
  }
}