import 'package:airqo/src/app/dashboard/pages/location_selection/components/swipeable_analytics_card.dart';
import 'package:airqo/src/app/dashboard/widgets/unmatched_site_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/shared/services/notification_manager.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';

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
  late CacheManager _cacheManager;

  @override
  void initState() {
    super.initState();
    loggy.info('Initializing MyPlacesView');
    _cacheManager = CacheManager();
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

  Future<void> _loadSelectedMeasurements() async {
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
        await _loadAllFromCache();
        return;
      }

      final measurementsBySiteId = <String, Measurement>{};
      for (final measurement in state.response.measurements!) {
        if (measurement.siteId != null && measurement.siteId!.isNotEmpty) {
          measurementsBySiteId[measurement.siteId!] = measurement;

          await _cacheMeasurement(measurement.siteId!, measurement);
        }
      }

      final matched = <Measurement>[];
      final unmatched = <SelectedSite>[];

      for (final site in widget.userPreferences!.selectedSites) {
        if (measurementsBySiteId.containsKey(site.id)) {
          matched.add(measurementsBySiteId[site.id]!);
        } else {
          final cachedMeasurement = await _getCachedMeasurement(site.id);
          if (cachedMeasurement != null) {
            loggy.info(
                'Found cached measurement for site: ${site.name} (ID: ${site.id})');
            matched.add(cachedMeasurement);
          } else {
            loggy.warning(
                'No matching measurement found for site ID: ${site.id}');
            unmatched.add(site);
          }
        }
      }

      setState(() {
        selectedMeasurements = matched;
        unmatchedSites = unmatched;
        isLoading = false;
      });
    } else {
      await _loadAllFromCache();
    }
  }

  Future<void> _cacheMeasurement(String siteId, Measurement measurement) async {
    try {
      await _cacheManager.put<Measurement>(
        boxName: CacheBoxName.location,
        key: 'site_measurement_$siteId',
        data: measurement,
        toJson: (data) => data.toJson(),
      );
    } catch (e) {
      loggy.error('Error caching measurement: $e');
    }
  }

  Future<Measurement?> _getCachedMeasurement(String siteId) async {
    try {
      final cachedData = await _cacheManager.get<Measurement>(
        boxName: CacheBoxName.location,
        key: 'site_measurement_$siteId',
        fromJson: (json) => Measurement.fromJson(json),
      );

      if (cachedData != null) {
        return cachedData.data;
      }
    } catch (e) {
      loggy.error('Error getting cached measurement: $e');
    }
    return null;
  }

  Future<void> _loadAllFromCache() async {
    if (widget.userPreferences == null ||
        widget.userPreferences!.selectedSites.isEmpty) {
      setState(() {
        isLoading = false;
      });
      return;
    }

    final matched = <Measurement>[];
    final unmatched = <SelectedSite>[];

    for (final site in widget.userPreferences!.selectedSites) {
      final cachedMeasurement = await _getCachedMeasurement(site.id);
      if (cachedMeasurement != null) {
        loggy.info('Loaded from cache: ${site.name} (ID: ${site.id})');
        matched.add(cachedMeasurement);
      } else {
        loggy.warning('No cached measurement for site ID: ${site.id}');
        unmatched.add(site);
      }
    }

    setState(() {
      selectedMeasurements = matched;
      unmatchedSites = unmatched;
      isLoading = false;
    });
  }

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
        locationName =
            m.siteDetails?.searchName ?? m.siteDetails?.name ?? "---";
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
      loggy.warning('Cannot update preferences: userPreferences is null');
      return;
    }

    final remainingSiteIds = <String>[];

    for (var site in widget.userPreferences!.selectedSites) {
      if (site.id != id) {
        remainingSiteIds.add(site.id);
      }
    }

    loggy.info(
        'Removing location with ID: $id. Remaining ${remainingSiteIds.length} locations: $remainingSiteIds');

    if (widget.userPreferences != null) {
      final dashboardBloc = context.read<DashboardBloc>();

      dashboardBloc.add(UpdateSelectedLocations(remainingSiteIds));
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
      final expectedLocationIds = (result as List<String>);
      final expectedCount = expectedLocationIds.length;
      loggy.info('Returned from location selection with ${expectedCount} locations: $expectedLocationIds');
      
      setState(() {
        isLoading = true;
      });
      
      context.read<DashboardBloc>().add(LoadDashboard());
      
      // Verify the result after giving time for state to update
      Future.delayed(Duration(seconds: 2), () {
        if (mounted) {
          final actualCount = selectedMeasurements.length + unmatchedSites.length;
          loggy.info('Expected: $expectedCount locations, Actual: $actualCount locations');
          
          if (actualCount != expectedCount) {
            loggy.warning('Location count mismatch detected');
            NotificationManager().showNotification(
              context,
              message: 'Some locations may not have been saved properly. Please verify your selections.',
              isSuccess: false,
            );
          } else {
            loggy.info('Location count verification passed');
          }
        }
      });
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
            child: SingleChildScrollView(
              child: Column(
                children: [
                  if (isLoading)
                    _buildLoadingState()
                  else if (selectedMeasurements.isEmpty &&
                      unmatchedSites.isEmpty)
                    _buildEmptyState()
                  else ...[
                    ...selectedMeasurements.map((measurement) {
                      String? preferenceLocationName;
                      if (widget.userPreferences != null) {
                        for (var site in widget.userPreferences!.selectedSites) {
                          if (site.id == measurement.siteId) {
                            preferenceLocationName = site.name;
                            break;
                          }
                        }
                      }
                      
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: SwipeableAnalyticsCard(
                          measurement: measurement,
                          onRemove: _removeLocation,
                          fallbackLocationName: preferenceLocationName,
                        ),
                      );
                    }),
                    ...unmatchedSites.map((site) => Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: UnmatchedSiteCard(
                            site: site,
                            onRemove: _removeLocation,
                          ),
                        )),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildLoadingState() {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.all(16),
      child: Center(
        child: Column(
          children: [
            SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor:
                    AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
              ),
            ),
          ],
        ),
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
