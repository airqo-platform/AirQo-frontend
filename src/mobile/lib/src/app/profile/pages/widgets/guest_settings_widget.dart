import 'package:airqo/src/app/profile/pages/widgets/settings_tile.dart';
import 'package:flutter/material.dart';

class GuestSettingsWidget extends StatelessWidget {
  const GuestSettingsWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 8),
        SettingsTile(
            switchValue: true,
            iconPath: "assets/images/shared/location_icon.svg",
            title: "Location",
            onChanged: (_) {},
            description:
            "AirQo to use your precise location to locate the Air Quality of your nearest location"),
        SettingsTile(
            iconPath: "assets/icons/notification.svg",
            title: "Notifications",
            onChanged: (_) {},
            description:
            "Create an account to get air quality alerts"),
        SettingsTile(
          iconPath: "assets/images/shared/feedback_icon.svg",
          title: "Send Feedback",
          onChanged: (_) {},
        ),
        SettingsTile(
          iconPath: "assets/images/shared/airqo_story_icon.svg",
          title: "Our Story",
          onChanged: (_) {},
        ),
        SettingsTile(
          iconPath: "assets/images/shared/terms_and_privacy.svg",
          title: "Terms and Privacy Policy",
          onChanged: (_) {},
        ),
      ],
    );
  }
}
