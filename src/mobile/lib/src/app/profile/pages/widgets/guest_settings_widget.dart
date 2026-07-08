import 'package:airqo/src/app/feedback/pages/feedback_screen.dart';
import 'package:airqo/src/app/profile/pages/guest_about_page.dart';
import 'package:airqo/src/app/profile/pages/widgets/settings_tile.dart';
import 'package:airqo/src/app/shared/services/feature_flag_service.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

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
    _checkLocationStatus();
  }

  Future<void> _checkLocationStatus() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    final permission = await Geolocator.checkPermission();
    if (mounted) {
      setState(() {
        _locationEnabled = serviceEnabled &&
            permission != LocationPermission.denied &&
            permission != LocationPermission.deniedForever;
      });
    }
  }

  Future<void> _toggleLocation(bool value) async {
    if (value) {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        await Geolocator.openLocationSettings();
        serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: TranslatedText('Location services still disabled.'),
              ),
            );
          }
          return;
        }
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: TranslatedText('Location permission denied.'),
              ),
            );
          }
          return;
        } else if (permission == LocationPermission.deniedForever) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: TranslatedText(
                  'Location permission permanently denied. Please enable it in settings.',
                ),
              ),
            );
          }
          await Geolocator.openAppSettings();
          return;
        }
      }
    }

    if (mounted) {
      setState(() => _locationEnabled = value);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 8),
        SettingsTile(
          switchValue: _locationEnabled,
          iconPath: "assets/images/shared/location_icon.svg",
          title: "Location",
          onChanged: _toggleLocation,
          description:
              "AirQo to use your precise location to locate the Air Quality of your nearest location",
        ),
        if (FeatureFlagService.instance.isEnabled(AppFeatureFlag.feedback))
          SettingsTile(
            iconPath: "assets/images/shared/feedback_icon.svg",
            title: "Send Feedback",
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  settings: const RouteSettings(name: 'feedback'),
                  builder: (context) => const FeedbackScreen(),
                ),
              );
            },
          ),
        SettingsTile(
          iconPath: "assets/images/shared/airqo_story_icon.svg",
          title: "About",
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                settings: const RouteSettings(name: 'guest_about'),
                builder: (context) => const GuestAboutPage(),
              ),
            );
          },
        ),
      ],
    );
  }
}
