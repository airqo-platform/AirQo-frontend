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
      _loadSelectedMeasurements();
    }
  }

  void _loadSelectedMeasurements() {
    final state = context.read<DashboardBloc>().state;
    if (state is DashboardLoaded) {
      if (widget.userPreferences != null && 
          widget.userPreferences!.selectedSites.isNotEmpty &&
          state.response.measurements != null) {
        
        final selectedIds = widget.userPreferences!.selectedSites
            .map((site) => site.id)
            .toSet();
        
        loggy.info('Loading ${selectedIds.length} selected sites from preferences');
        
        // Find measurements that match the selected site IDs
        final matchingMeasurements = state.response.measurements!
            .where((m) => m.id != null && selectedIds.contains(m.id))
            .toList();
        
        loggy.info('Found ${matchingMeasurements.length} matching measurements');
        
        setState(() {
          selectedMeasurements = matchingMeasurements;
        });
      } else {
        loggy.info('No selected sites in user preferences');
        setState(() {
          selectedMeasurements = [];
        });
      }
    }
  }

  void _removeLocation(String id) {
    setState(() {
      selectedMeasurements.removeWhere((m) => m.id == id);
    });
    
    // Update user preferences when a location is removed
    final remainingIds = selectedMeasurements
        .map((m) => m.id)
        .where((id) => id != null)
        .cast<String>()
        .toList();
    
    // Dispatch event to update preferences
    context.read<DashboardBloc>().add(UpdateSelectedLocations(remainingIds));
    
    // Show feedback to the user
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Location removed and preferences updated'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _navigateToLocationSelection() async {
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
      
      // Force reload dashboard data to get fresh measurements and preferences
      context.read<DashboardBloc>().add(LoadDashboard());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (selectedMeasurements.isEmpty)
          _buildEmptyState()
        else
          ...selectedMeasurements.map((measurement) => 
            SwipeableAnalyticsCard(
              measurement: measurement,
              onRemove: _removeLocation,
            )
          ).toList(),
        
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
                selectedMeasurements.isEmpty ? 'Add Locations' : 'Manage Locations',
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