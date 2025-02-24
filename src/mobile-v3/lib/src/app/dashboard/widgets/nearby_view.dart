import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../meta/utils/colors.dart';
import '../../shared/widgets/page_padding.dart';
import '../bloc/dashboard/dashboard_bloc.dart';
import 'dashboard_loading.dart';
import 'measurements_list.dart';

class NearbyView extends StatelessWidget {
  const NearbyView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DashboardBloc, DashboardState>(
      builder: (context, state) {
        if (state is DashboardLoaded) {
          // For demonstration, show first 4 locations as "nearby"
          final nearbyLocations = state.response.measurements!.take(4).toList();
          
          return MeasurementsList(measurements: nearbyLocations);
        } else if (state is DashboardLoading) {
          return DashboardLoadingPage();
        } else {
          return _buildLocationPermissionRequired(context);
        }
      },
    );
  }

  Widget _buildLocationPermissionRequired(BuildContext context) {
    return PagePadding(
      padding: 16,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.location_off,
              size: 48,
              color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.6),
            ),
            SizedBox(height: 16),
            Text(
              "Location access required",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 8),
            Text(
              "Please enable location services to see air quality data near you",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.7),
              ),
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // Request location permission
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
              ),
              child: Text("Enable Location"),
            ),
          ],
        ),
      ),
    );
  }
}