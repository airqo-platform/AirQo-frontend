import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_app_bar.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_header.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';

class ClockExposurePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final strokeWidth = 12.0;
    
    // Paint for background segments
    final backgroundPaint = Paint()
      ..color = Colors.grey.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;
    
    // Calculate angle per hour (360° / 24 hours = 15° per hour)
    final anglePerHour = 2 * math.pi / 24;
    final segmentGap = 0.02; // Small gap between segments
    
    // Draw 24 hour segments
    for (int hour = 0; hour < 24; hour++) {
      final startAngle = (hour * anglePerHour) - (math.pi / 2) + segmentGap;
      final sweepAngle = anglePerHour - (2 * segmentGap);
      
      // Initial state - all segments are inactive
      final paint = backgroundPaint;
      
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius - strokeWidth / 2),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

class ExposureDashboardView extends StatefulWidget {
  const ExposureDashboardView({super.key});

  @override
  State<ExposureDashboardView> createState() => _ExposureDashboardViewState();
}

class _ExposureDashboardViewState extends State<ExposureDashboardView> {
  int _selectedTabIndex = 0; // 0 for Today, 1 for This week
  bool _isRequestingPermission = false;
  final EnhancedLocationServiceManager _locationService = EnhancedLocationServiceManager();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: DashboardAppBar(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Dashboard header
            DashboardHeader(),
            
            // Exposure content
            Padding(
              padding: const EdgeInsets.fromLTRB(24.0, 0, 24.0, 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                
                // Tab selector
                Container(
                  height: 44,
                  alignment: Alignment.centerLeft,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildTabButton(
                        label: "Today",
                        isSelected: _selectedTabIndex == 0,
                        onTap: () => setState(() => _selectedTabIndex = 0),
                      ),
                      const SizedBox(width: 8),
                      _buildTabButton(
                        label: "This week",
                        isSelected: _selectedTabIndex == 1,
                        onTap: () => setState(() => _selectedTabIndex = 1),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 25),
                
                // Title
                Text(
                  'Monitor your pollution exposure',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                  textAlign: TextAlign.left,
                ),
                
                const SizedBox(height: 12),
                
                // Subtitle
                Text(
                  'Allow access to your location to start.',
                  style: TextStyle(
                    fontSize: 16,
                    color: const Color.fromARGB(137, 10, 6, 6),
                  ),
                  textAlign: TextAlign.left,
                ),
                
                const SizedBox(height: 40),
                
                // 24-hour clock chart
                Center(
                  child: SizedBox(
                    width: 200,
                    height: 200,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Custom 24-hour clock painter
                        SizedBox(
                          width: 220,
                          height: 220,
                          child: CustomPaint(
                            painter: ClockExposurePainter(),
                          ),
                        ),
                        
                        // Inner circle background
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.grey.withValues(alpha: 0.15),
                          ),
                          child: Icon(
                            Icons.person_outline,
                            size: 50,
                            color: Colors.grey.withValues(alpha: 0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 30),
                
                // Allow access button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isRequestingPermission ? null : _requestLocationPermission,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: _isRequestingPermission
                        ? Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              ),
                              SizedBox(width: 12),
                              Text(
                                'Requesting permission...',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          )
                        : Text(
                            'Allow access to location',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),
                
                const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _requestLocationPermission() async {
    if (_isRequestingPermission) return;

    setState(() {
      _isRequestingPermission = true;
    });

    try {
      final result = await _locationService.requestLocationPermission();
      
      if (!mounted) return;

      setState(() {
        _isRequestingPermission = false;
      });

      if (result.isSuccess) {
        // Permission granted successfully
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Location permission granted! You can now track your exposure.'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );
        
        // Initialize location service and potentially start tracking
        await _locationService.initialize();
      } else {
        // Handle different error states
        String errorMessage;
        String actionText = 'OK';
        VoidCallback? action;

        switch (result.status) {
          case LocationStatus.permissionDenied:
            errorMessage = 'Location permission is required to track your pollution exposure. Please allow location access to continue.';
            actionText = 'Try Again';
            action = () => _requestLocationPermission();
            break;
          case LocationStatus.permissionDeniedForever:
            errorMessage = 'Location permission has been permanently denied. Please enable it in your device settings to track exposure.';
            actionText = 'Open Settings';
            action = () => _openAppSettings();
            break;
          case LocationStatus.serviceDisabled:
            errorMessage = 'Location services are disabled. Please enable location services in your device settings.';
            actionText = 'Open Settings';
            action = () => _openAppSettings();
            break;
          default:
            errorMessage = result.error ?? 'Unable to request location permission. Please try again.';
        }

        // Show error dialog
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Location Access Required'),
            content: Text(errorMessage),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text('Cancel'),
              ),
              if (action != null)
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    action!();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: Text(actionText),
                ),
            ],
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      
      setState(() {
        _isRequestingPermission = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error requesting location permission: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _openAppSettings() async {
    // This would typically use a plugin like app_settings
    // For now, show instructions to user
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Open Settings'),
        content: Text('Please go to Settings > Apps > AirQo > Permissions and enable Location access.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  Widget _buildTabButton({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryColor
              : Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkHighlight
                  : AppColors.dividerColorlight,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : Colors.black87,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}