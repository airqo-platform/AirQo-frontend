import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:flutter/material.dart';
import '../../../meta/utils/colors.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class MyPlacesView extends StatelessWidget {
  const MyPlacesView({super.key});

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
          SizedBox(height: 8),
          Text(
            "Start by adding locations you care about.",
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
          ),
          SizedBox(height: 24),

          // Add Location Card
          _buildAddLocationCard(context),
          SizedBox(height: 16),

          // Add Location Card with Floating Action Button
          _buildAddLocationCardWithFAB(context),
        ],
      ),
    );
  }

  // Open location selection screen
  void _navigateToLocationSelection(BuildContext context) async {
    // Ensure DashboardBloc has the latest data before navigation
    final dashboardBloc = context.read<DashboardBloc>();
    if (dashboardBloc.state is! DashboardLoaded) {
      dashboardBloc.add(LoadDashboard());
    }
    
    // Navigate to the location selection screen
    final result = await Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => LocationSelectionScreen())
    );
    
    // Handle the returned selected locations if needed
    if (result != null) {
      // Result will be a List<String> of selected location IDs
      print('Selected locations: $result');
      // Process the selected locations as needed
    }
  }

  Widget _buildAddLocationCard(BuildContext context) {
    return DottedBorder(
      color: AppColors.primaryColor,
      strokeWidth: 2,
      dashPattern: [8, 4], // Dash and gap size
      borderType: BorderType.RRect,
      radius: Radius.circular(8),
      child: Container(
        height: 150,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Color(0xFF2E2F33), // Background color inside dashed border
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
          dashPattern: [8, 4], // Dash and gap size
          borderType: BorderType.RRect,
          radius: Radius.circular(8),
          child: Container(
            height: 150,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Color(0xFF2E2F33), // Background color inside dashed border
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
            margin: EdgeInsets.all(8),
            child: FloatingActionButton(
              onPressed: () => _navigateToLocationSelection(context),
              backgroundColor: AppColors.primaryColor,
              mini: false,
              child: Icon(Icons.add, color: Colors.white),
            ),
          ),
        ),
      ],
    );
  }
}