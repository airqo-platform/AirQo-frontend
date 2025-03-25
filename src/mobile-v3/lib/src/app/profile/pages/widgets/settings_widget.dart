import 'package:airqo/src/app/auth/pages/welcome_screen.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:airqo/src/app/profile/pages/widgets/settings_tile.dart';
import 'package:flutter_svg/svg.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:geolocator/geolocator.dart';

class SettingsWidget extends StatefulWidget {
  const SettingsWidget({super.key});

  @override
  State<SettingsWidget> createState() => _SettingsWidgetState();
}

class _SettingsWidgetState extends State<SettingsWidget> {
  String _appVersion = '';
  bool _locationEnabled = false;
  //bool _notificationsEnabled = true;

  @override
  void initState() {
    super.initState();
    _getAppVersion();
    _checkLocationStatus();
  }

  Future<void> _getAppVersion() async {
    final packageInfo = await PackageInfo.fromPlatform();
    setState(() {
      _appVersion = '${packageInfo.version}(${packageInfo.buildNumber})';
    });
  }

  Future<void> _checkLocationStatus() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    LocationPermission permission = await Geolocator.checkPermission();

    setState(() {
      _locationEnabled = serviceEnabled &&
          permission != LocationPermission.denied &&
          permission != LocationPermission.deniedForever;
    });
  }

  Future<void> _toggleLocation(bool value) async {
    if (value) {
      // Enable location
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        // Prompt user to enable location services
        bool openedSettings = await Geolocator.openLocationSettings();
        if (!openedSettings) {
          _showSnackBar('Please enable location services in settings.');
          return;
        }
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _showSnackBar('Location permission denied.');
          return;
        } else if (permission == LocationPermission.deniedForever) {
          _showSnackBar(
              'Location permission permanently denied. Please enable it in settings.');
          await Geolocator.openAppSettings();
          return;
        }
      }
    }

    setState(() {
      _locationEnabled = value;
    });
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  void _showLogoutConfirmation() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('Confirm Logout'),
        content: Text('Are you sure you want to log out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () => _handleLogout(dialogContext),
            child: Text('Log Out'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleLogout(BuildContext dialogContext) async {
    Navigator.pop(dialogContext); // Close confirmation dialog

    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      // Trigger logout event
      context.read<AuthBloc>().add(LogoutUser());

      // Listen to state changes
      await for (final state in context.read<AuthBloc>().stream) {
        if (state is GuestUser) {
          Navigator.pop(context); // Close loading dialog
          await Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const WelcomeScreen()),
            (route) => false,
          );
          break;
        } else if (state is AuthLoadingError) {
          Navigator.pop(context); // Close loading dialog
          _showSnackBar(state.message);
          break;
        }
      }
    } catch (e) {
      Navigator.pop(context); // Close loading dialog
      _showSnackBar('An unexpected error occurred during logout');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: screenHeight * 0.02),

            // Location Setting
            SettingsTile(
              switchValue: _locationEnabled,
              iconPath: "assets/images/shared/location_icon.svg",
              title: "Location",
              onChanged: _toggleLocation,
              description:
                  "AirQo to use your precise location to locate the Air Quality of your nearest location",
            ),

            // Logout Button
            Padding(
              padding: EdgeInsets.symmetric(vertical: screenHeight * 0.05),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  minimumSize: Size.fromHeight(screenHeight * 0.07),
                ),
                onPressed: _showLogoutConfirmation,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.logout, color: Colors.white, size: 20),
                    SizedBox(width: 10),
                    Text(
                      "Log out",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: screenHeight * 0.01),

            // App Info
            Center(
              child: Column(
                children: [
                  SvgPicture.asset(
                    "assets/images/shared/logo.svg",
                    height: screenHeight * 0.05,
                  ),
                  SizedBox(height: screenHeight * 0.01),
                  Text(
                    _appVersion,
                    style: TextStyle(
                      color: isDarkMode ? Colors.grey[400] : Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.01),
                  Text(
                    "A PROJECT BY",
                    style: TextStyle(
                      color: isDarkMode ? Colors.grey[400] : Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    "Makerere University".toUpperCase(),
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: isDarkMode ? Colors.white : Colors.black,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}