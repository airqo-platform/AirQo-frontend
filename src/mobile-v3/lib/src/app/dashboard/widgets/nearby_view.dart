import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_loading.dart';
import 'package:airqo/src/app/dashboard/widgets/measurements_list.dart';
import 'package:airqo/src/app/dashboard/widgets/nearby_view_empty_state.dart';

class NearbyView extends StatefulWidget {
  const NearbyView({super.key});

  @override
  State<NearbyView> createState() => _NearbyViewState();
}

class _NearbyViewState extends State<NearbyView> with UiLoggy {
  bool _checkingPermission = true;
  bool _hasLocationPermission = false;

  @override
  void initState() {
    super.initState();
    _checkLocationPermission();
  }

  Future<void> _checkLocationPermission() async {
    try {
      final status = await Permission.location.status;
      setState(() {
        _hasLocationPermission = status.isGranted;
        _checkingPermission = false;
      });
      
      loggy.info('Location permission status: ${status.name}');
      
      // If permission is granted, we can load data
      if (status.isGranted) {
        context.read<DashboardBloc>().add(LoadDashboard());
      }
    } catch (e) {
      loggy.error('Error checking location permission: $e');
      setState(() {
        _checkingPermission = false;
        _hasLocationPermission = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // If we're still checking the permission, show a loading indicator
    if (_checkingPermission) {
      return Center(
        child: CircularProgressIndicator(),
      );
    }

    // If no location permission, show the empty state
    if (!_hasLocationPermission) {
      return NearbyViewEmptyState();
    }

    // If we have location permission, show the data
    return BlocBuilder<DashboardBloc, DashboardState>(
      builder: (context, state) {
        if (state is DashboardLoading) {
          return DashboardLoadingPage();
        } 
        
        if (state is DashboardLoaded) {
          // For demonstration, show first 4 locations as "nearby"
          // In a real implementation, you'd filter locations based on proximity to user
          final nearbyLocations = state.response.measurements
              ?.where((m) => m.siteDetails?.approximateLatitude != null && 
                           m.siteDetails?.approximateLongitude != null)
              .take(4)
              .toList() ?? [];
          
          if (nearbyLocations.isEmpty) {
            return Center(
              child: Text(
                "No locations found nearby",
                style: TextStyle(
                  fontSize: 18,
                  color: Theme.of(context).textTheme.headlineMedium?.color,
                ),
              ),
            );
          }
          
          return MeasurementsList(measurements: nearbyLocations);
        }
        
        // Error or other states
        return Center(
          child: Text(
            "Unable to load nearby locations",
            style: TextStyle(
              fontSize: 18,
              color: Theme.of(context).textTheme.headlineMedium?.color,
            ),
          ),
        );
      },
    );
  }
}