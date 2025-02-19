import 'package:airqo/src/app/auth/pages/welcome_screen.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:airqo/src/app/profile/pages/widgets/settings_tile.dart';
import 'package:flutter_svg/svg.dart';
import 'package:package_info_plus/package_info_plus.dart';

class SettingsWidget extends StatefulWidget {
  const SettingsWidget({super.key});

  @override
  State<SettingsWidget> createState() => _SettingsWidgetState();
}

class _SettingsWidgetState extends State<SettingsWidget> {
  String _appVersion = '';
  bool _locationEnabled = true;
  bool _notificationsEnabled = true;

  @override
  void initState() {
    super.initState();
    _getAppVersion();
  }

  Future<void> _getAppVersion() async {
    final packageInfo = await PackageInfo.fromPlatform();
    setState(() {
      _appVersion = '${packageInfo.version}(${packageInfo.buildNumber})';
    });
  }

  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Logout'),
        content: const Text('Are you sure you want to log out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              context.read<AuthBloc>().add(LogoutUser());
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => WelcomeScreen()),
              );
            },
            child: const Text('Log Out'),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    final TextEditingController passwordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Account'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'WARNING: This action cannot be undone. All your data will be permanently deleted.',
              style: TextStyle(color: Colors.red),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Enter Password to Confirm',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement actual account deletion logic
              // Validate password, call backend deletion endpoint
              Navigator.of(context).pushReplacementNamed('/login');
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete Account'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
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
              onChanged: (value) {
                setState(() {
                  _locationEnabled = value;
                });
                print("Location setting: $value");
              },
              description:
                  "AirQo to use your precise location to locate the Air Quality of your nearest location",
            ),

            // Notifications Setting
            SettingsTile(
              switchValue: _notificationsEnabled,
              iconPath: "assets/icons/notification.svg",
              title: "Notifications",
              onChanged: (value) {
                setState(() {
                  _notificationsEnabled = value;
                });
                print("Notifications setting: $value");
              },
              description:
                  "AirQo to send you in-app & push notifications & spike alerts.",
            ),

            // Send Feedback
            SettingsTile(
              iconPath: "assets/images/shared/feedback_icon.svg",
              title: "Send Feedback",
              onChanged: (value) {
                print("Send Feedback tapped");
              },
            ),

            // Our Story
            SettingsTile(
              iconPath: "assets/images/shared/airqo_story_icon.svg",
              title: "Our Story",
              onChanged: (value) {
                print("Our Story tapped");
              },
            ),

            // Terms and Privacy Policy
            SettingsTile(
              iconPath: "assets/images/shared/terms_and_privacy.svg",
              title: "Terms and Privacy Policy",
              onChanged: (value) {
                print("Terms and Privacy Policy tapped");
              },
            ),

            // Logout Button
            Padding(
              padding: EdgeInsets.symmetric(vertical: screenHeight * 0.05),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  minimumSize: Size.fromHeight(screenHeight * 0.07),
                ),
                onPressed: _showLogoutConfirmation,
                child: const Text(
                  "Log out",
                  style: TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            // Delete Account Section
            Padding(
              padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.3),
              child: InkWell(
                onTap: _showDeleteAccountDialog,
                child: Text(
                  "Delete Account",
                  style: TextStyle(
                    color: Colors.red.shade300,
                    fontWeight: FontWeight.bold,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ),

            SizedBox(height: screenHeight * 0.03),

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
                    style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.01),
                  const Text(
                    "A PROJECT BY",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    "Makerere University".toUpperCase(),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: Colors.white,
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
