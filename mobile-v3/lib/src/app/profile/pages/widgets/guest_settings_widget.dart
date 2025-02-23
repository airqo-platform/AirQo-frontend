import 'package:airqo/src/app/profile/pages/widgets/settings_tile.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

class GuestSettingsWidget extends StatefulWidget {
  const GuestSettingsWidget({super.key});

  @override
  State<GuestSettingsWidget> createState() => _GuestSettingsWidgetState();
}

class _GuestSettingsWidgetState extends State<GuestSettingsWidget> {
  bool _locationEnabled = false;

  @override
  void initState() {
    super.initState();
    _getInitialLocationStatus();
  }

  Future<void> _getInitialLocationStatus() async {
    final status = await Permission.location.status;
    setState(() {
      _locationEnabled = status.isGranted;
    });
  }

  Future<void> _toggleLocation(bool value) async {
    if (value) {
      // Check current permission status.
      var status = await Permission.location.status;
      if (!status.isGranted) {
        // Request the location permission.
        status = await Permission.location.request();
        if (!status.isGranted) {
          // If permission is not granted, notify the user and exit early.
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Location permission not granted")),
          );
          return;
        }
      }
    }
    // If we get here, permission is granted (or the user is turning location off)
    setState(() {
      _locationEnabled = value;
    });
    print("Location setting: $value");
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(height: 8),
        SettingsTile(
            switchValue: _locationEnabled,
            iconPath: "assets/images/shared/location_icon.svg",
            title: "Location",
            onChanged: (value) async {
              await _toggleLocation(value);
            },
            description:
                "AirQo to use your precise location to locate the Air Quality of your nearest location"),
        // SettingsTile(
        //     iconPath: "assets/icons/notification.svg",
        //     title: "Notifications",
        //     onChanged: (value) {
        //       print(value);
        //     },
        //     description: "Create an account to get air quality alerts"),
        SettingsTile(
          iconPath: "assets/images/shared/feedback_icon.svg",
          title: "Send Feedback",
          onChanged: (value) {
            print(value);
          },
        ),
        SettingsTile(
          iconPath: "assets/images/shared/airqo_story_icon.svg",
          title: "Our Story",
          onChanged: (value) {
            print(value);
          },
        ),
        SettingsTile(
          iconPath: "assets/images/shared/terms_and_privacy.svg",
          title: "Terms and Privacy Policy",
          onChanged: (value) {
            print(value);
          },
        ),
      ],
    );
  }
}
