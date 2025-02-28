import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:loggy/loggy.dart';

class NearbyViewEmptyState extends StatefulWidget {
  const NearbyViewEmptyState({super.key});

  @override
  State<NearbyViewEmptyState> createState() => _NearbyViewEmptyStateState();
}

class _NearbyViewEmptyStateState extends State<NearbyViewEmptyState> with UiLoggy {
  bool _isLoading = false;

  Future<void> _requestLocationPermission() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Request permission
      final status = await Permission.location.request();

      if (status.isGranted) {
        loggy.info('Location permission granted');
        // Refresh dashboard data with location
        context.read<DashboardBloc>().add(LoadDashboard());
      } else if (status.isDenied) {
        loggy.warning('Location permission denied');
        // Could show a message here
      } else if (status.isPermanentlyDenied) {
        loggy.warning('Location permission permanently denied');
        // Show dialog to open app settings
        _showOpenSettingsDialog();
      }
    } catch (e) {
      loggy.error('Error requesting location permission: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showOpenSettingsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Location Required'),
        content: Text(
          'Location permission is required to show air quality data near you. '
          'Please enable location in app settings.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              openAppSettings();
            },
            child: Text('Open Settings'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 30.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // SVG Location Icon arrangement
          Stack(
            alignment: Alignment.center,
            children: [
              // Container to establish the appropriate size
              Container(
                height: 120,
                width: 180,
                // Use Stack instead of Row for more control
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Left location pin (faded)
                    Positioned(
                      left: 10,
                      bottom: 30,
                      child: Opacity(
                        opacity: 0.4,
                        child: SvgPicture.asset(
                          "assets/profile/places.svg",
                          height: 60,
                          width: 60,
                        ),
                      ),
                    ),
                    
                    // Right location pin (faded)
                    Positioned(
                      right: 10,
                      bottom: 30,
                      child: Opacity(
                        opacity: 0.4,
                        child: SvgPicture.asset(
                          "assets/profile/places.svg",
                          height: 60,
                          width: 60,
                        ),
                      ),
                    ),
                    
                    // Center location pin (main, highlighted, positioned above and slightly forward)
                    Positioned(
                      bottom: 5, // Positioned higher up (more "ahead")
                      child: SvgPicture.asset(
                        "assets/profile/places.svg",
                        height: 80,
                        width: 80,
                        color: AppColors.primaryColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          SizedBox(height: 24),
          
          // Title
          Text(
            "See Air Quality Around You",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).textTheme.headlineLarge?.color,
            ),
            textAlign: TextAlign.center,
          ),
          
          SizedBox(height: 16),
          
          // Description
          Text(
            "Get real-time air quality updates for your current location and nearby areas",
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).textTheme.headlineMedium?.color,
            ),
            textAlign: TextAlign.center,
          ),
          
          SizedBox(height: 40),
          
          // Enable Location Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _requestLocationPermission,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              child: _isLoading
                  ? SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : Text(
                      "Enable Location",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}