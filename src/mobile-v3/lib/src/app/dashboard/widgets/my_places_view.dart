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

    if (widget.userPreferences != oldWidget.userPreferences) {
      loggy.info('User preferences updated, reloading measurements');
      _loadSelectedMeasurements();
    }
  }

  void _loadSelectedMeasurements() {
    final state = context.read<DashboardBloc>().state;

    loggy.info('Processing ${state.runtimeType} state');

    setState(() {
      isLoading = true;
      selectedMeasurements = [];
      unmatchedSites = [];
    });

    if (widget.userPreferences == null ||
        widget.userPreferences!.selectedSites.isEmpty) {
      loggy.info('No selected sites in user preferences');
      setState(() {
        isLoading = false;
      });
      return;
    }

    for (var site in widget.userPreferences!.selectedSites) {
      loggy.info('Selected site in preferences: ${site.name} (ID: ${site.id})');
    }

    if (state is DashboardLoaded) {
      if (state.response.measurements == null ||
          state.response.measurements!.isEmpty) {
        setState(() {
          unmatchedSites = List.from(widget.userPreferences!.selectedSites);
          isLoading = false;
        });
        return;
      }

      final measurementsBySiteId = <String, Measurement>{};
      for (final measurement in state.response.measurements!) {
        if (measurement.siteId != null && measurement.siteId!.isNotEmpty) {
          measurementsBySiteId[measurement.siteId!] = measurement;
        }
      }

      final matched = <Measurement>[];
      final unmatched = <SelectedSite>[];

      for (final site in widget.userPreferences!.selectedSites) {
        if (measurementsBySiteId.containsKey(site.id)) {
          loggy.info('Found match for site: ${site.name} (ID: ${site.id})');
          matched.add(measurementsBySiteId[site.id]!);
        } else {
          loggy
              .warning('No matching measurement found for site ID: ${site.id}');
          unmatched.add(site);
        }
      }

      setState(() {
        selectedMeasurements = matched;
        unmatchedSites = unmatched;
        isLoading = false;
      });
    }
  }

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

  void _removeLocation(String id) {
    if ((selectedMeasurements.length + unmatchedSites.length) <= 1) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(
            "Cannot Remove Default Location",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.headlineSmall?.color,
            ),
          ),
          content: Text(
            "You need to have at least one location in My Places. Add another location before removing this one.",
            style: TextStyle(
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                "OK",
                style: TextStyle(
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          backgroundColor: Theme.of(context).cardColor,
        ),
      );
      NotificationManager().showNotification(
        context,
        message:
            'Cannot remove the last location. Please add another location first.',
        isSuccess: false,
      );
      return;
    }

    String locationName = "Location";
    for (var m in selectedMeasurements) {
      if (m.siteId == id) {
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
      selectedMeasurements.removeWhere((m) => m.siteId == id);
      unmatchedSites.removeWhere((s) => s.id == id);
    });

    if (widget.userPreferences == null) {
      return;
    }

    final remainingSiteIds = widget.userPreferences!.selectedSites
        .where((site) => site.id != id)
        .map((site) => site.id)
        .toList();

    loggy.info(
        'Remaining ${remainingSiteIds.length} locations: $remainingSiteIds');

    if (remainingSiteIds.isNotEmpty || widget.userPreferences != null) {
      final dashboardBloc = context.read<DashboardBloc>();
      dashboardBloc.add(UpdateSelectedLocations(remainingSiteIds));
      Future.delayed(Duration(milliseconds: 300), () {
        if (mounted) {
          dashboardBloc.add(LoadUserPreferences());
        }
      });
    }

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
                  ...selectedMeasurements.map((measurement) => Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: SwipeableAnalyticsCard(
                          measurement: measurement,
                          onRemove: _removeLocation,
                        ),
                      )),

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
                        if (site.searchName.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(left: 32, top: 4),
                            child: Text(
                              site.searchName,
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
        _buildAddLocationContainer(),
        _buildAddLocationContainer(),
      ],
    );
  }

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
