import 'package:flutter/material.dart';
import 'package:airqo/src/app/profile/pages/widgets/settings_tile.dart';
import 'package:flutter_svg/svg.dart';

class SettingsWidget extends StatelessWidget {
  const SettingsWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: screenHeight * 0.02),

            // Location Setting
            SettingsTile(
              switchValue: true,
              iconPath: "assets/images/shared/location_icon.svg",
              title: "Location",
              onChanged: (value) {
                print("Location setting: \$value");
              },
              description:
                  "AirQo to use your precise location to locate the Air Quality of your nearest location",
            ),

            // Notifications Setting
            SettingsTile(
              switchValue: true,
              iconPath: "assets/icons/notification.svg",
              title: "Notifications",
              onChanged: (value) {
                print("Notifications setting: \$value");
              },
              description:
                  "AirQo to send you in-app & push notifications & spike alerts.",
            ),

            // Send Feedback
            SettingsTile(
                iconPath: "assets/images/shared/feedback_icon.svg",
                title: "Send Feedback",
                onChanged: (value) {
                  print("Send Feedback setting: \$value");
                }),

            // Our Story
            SettingsTile(
              iconPath: "assets/images/shared/airqo_story_icon.svg",
              title: "Our Story",
              onChanged: (value) {
                print("Our Story setting: \$value");
              },
            ),

            // Terms and Privacy Policy
            SettingsTile(
              iconPath: "assets/images/shared/terms_and_privacy.svg",
              title: "Terms and Privacy Policy",
              onChanged: (value) {
                print("Terms and Privacy Policy setting: \$value");
              },
            ),

            // Logout Button
            Padding(
              padding: EdgeInsets.symmetric(vertical: screenHeight * 0.02),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  minimumSize: Size.fromHeight(screenHeight * 0.07),
                ),
                onPressed: () {
                  print("Logout tapped");
                },
                child: const Text(
                  "Log out",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            // Delete Account Section
            Padding(
              padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.04),
              child: InkWell(
                onTap: () {
                  print("Delete Account tapped");
                },
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
                  const Text(
                    "3.40.1(1)",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.005),
                  const Text(
                    "A PROJECT BY",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  const Text(
                    "Makerere University",
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
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
