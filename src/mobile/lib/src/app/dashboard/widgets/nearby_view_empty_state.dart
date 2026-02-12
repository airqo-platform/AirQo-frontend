import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:geolocator/geolocator.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:loggy/loggy.dart';

class NearbyViewEmptyState extends StatefulWidget {
  final String? errorMessage;
  final VoidCallback? onRetry;

  const NearbyViewEmptyState({
    super.key, 
    this.errorMessage,
    this.onRetry,
  });

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
      // First check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _showLocationServicesDisabledDialog();
        setState(() {
          _isLoading = false;
        });
        return;
      }

      // Check current permission status
      LocationPermission permission = await Geolocator.checkPermission();
      
      // If already granted, just continue
      if (permission == LocationPermission.always || 
          permission == LocationPermission.whileInUse) {
        loggy.info('Location permission already granted: ${permission.toString()}');
        
        if (widget.onRetry != null) {
          widget.onRetry!();
        } else {
          // Refresh dashboard data with location
          context.read<DashboardBloc>().add(LoadDashboard());
        }
        setState(() {
          _isLoading = false;
        });
        return;
      }
      
      // Request permission if not already granted
      permission = await Geolocator.requestPermission();

      if (permission == LocationPermission.always || 
          permission == LocationPermission.whileInUse) {
        loggy.info('Location permission granted: ${permission.toString()}');
        
        // Refresh dashboard data with location
        if (widget.onRetry != null) {
          widget.onRetry!();
        } else {
          context.read<DashboardBloc>().add(LoadDashboard());
        }
      } else if (permission == LocationPermission.denied) {
        loggy.warning('Location permission denied');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Location permission was denied. Please try again.'),
            duration: Duration(seconds: 3),
          ),
        );
      } else if (permission == LocationPermission.deniedForever) {
        loggy.warning('Location permission permanently denied');
        // Show dialog to open app settings
        _showOpenSettingsDialog();
      }
    } catch (e) {
      loggy.error('Error requesting location permission: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('An error occurred: ${e.toString()}'),
          duration: Duration(seconds: 3),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showLocationServicesDisabledDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Location Services Disabled'),
        content: Text(
          'Location services are disabled on your device. '
          'Please enable location services to see air quality data near you.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Geolocator.openLocationSettings();
            },
            child: Text('Open Settings'),
          ),
        ],
      ),
    );
  }

  void _showOpenSettingsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Location Permission Required'),
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
          
          // Error message if provided
          if (widget.errorMessage != null) ...[
            SizedBox(height: 16),
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.error_outline, color: Colors.red, size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      widget.errorMessage!,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.red,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          
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
                  borderRadius: BorderRadius.circular(8),
                ),
                disabledBackgroundColor: AppColors.primaryColor.withOpacity(0.5),
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