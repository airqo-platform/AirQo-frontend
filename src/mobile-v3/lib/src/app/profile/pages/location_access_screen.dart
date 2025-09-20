import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'privacy_zones_screen.dart'; // Import the PrivacyZonesScreen
import 'add_location_screen.dart'; // Import the AddLocationScreen

class LocationAccessScreen extends StatefulWidget {
  const LocationAccessScreen({super.key});

  @override
  State<LocationAccessScreen> createState() => _LocationAccessScreenState();
}

class _LocationAccessScreenState extends State<LocationAccessScreen> {
  String _selectedOption = "Never";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Location")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Allow Location Access",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : AppColors.boldHeadlineColor4,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Get air quality data for nearby locations and pollution exposure insights.",
              style: TextStyle(
                fontSize: 16,
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.boldHeadlineColor2
                    : AppColors.secondaryHeadlineColor,
              ),
            ),
            const SizedBox(height: 20),

            // Radio options
            RadioListTile<String>(
              title: const Text("Never"),
              value: "Never",
              groupValue: _selectedOption,
              onChanged: (value) {
                setState(() {
                  _selectedOption = value!;
                });
              },
            ),
            RadioListTile<String>(
              title: const Text("While Using the App"),
              value: "WhileUsing",
              groupValue: _selectedOption,
              onChanged: (value) {
                setState(() {
                  _selectedOption = value!;
                });
              },
            ),
            RadioListTile<String>(
              title: const Text("Always"),
              subtitle: const Text(
                "Recommended for continuous pollution exposure tracking",
              ),
              value: "Always",
              groupValue: _selectedOption,
              onChanged: (value) {
                setState(() {
                  _selectedOption = value!;
                });
              },
            ),

            const SizedBox(height: 16),

            // Show popup when "Never" is selected
            if (_selectedOption == "Never")
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(top: 8),
                decoration: BoxDecoration(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppColors.darkHighlight
                      : AppColors.lightHighlight,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? AppColors.dividerColordark
                        : AppColors.dividerColorlight,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.info_outline, color: AppColors.primaryColor),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        "Enable location access to get personalized air quality information and pollution exposure insights. Your data will be used solely for research not in anyway that causes harm.",
                        style: TextStyle(
                          fontSize: 14,
                          color: Theme.of(context).brightness == Brightness.dark
                              ? AppColors.boldHeadlineColor2
                              : AppColors.secondaryHeadlineColor,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            // Show advanced settings for both "While Using the App" and "Always"
            if (_selectedOption == "WhileUsing" ||
                _selectedOption == "Always") ...[
              const Divider(height: 32),
              Text(
                "Privacy & Data",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.white
                      : AppColors.boldHeadlineColor4,
                ),
              ),
              const SizedBox(height: 8),
              ListTile(
                leading: const Icon(Icons.location_off_outlined),
                title: Text(
                  "Privacy zones",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.white
                        : AppColors.boldHeadlineColor4,
                  ),
                ),
                subtitle: Text(
                  "Set locations where tracking is disabled",
                  style: TextStyle(
                    fontSize: 14,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? AppColors.boldHeadlineColor2
                        : AppColors.secondaryHeadlineColor,
                  ),
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const PrivacyZonesScreen()),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.add_location),
                title: Text(
                  "Add Location",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.white
                        : AppColors.boldHeadlineColor4,
                  ),
                ),
                subtitle: Text(
                  "Add a new location to your privacy zones",
                  style: TextStyle(
                    fontSize: 14,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? AppColors.boldHeadlineColor2
                        : AppColors.secondaryHeadlineColor,
                  ),
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const AddLocationScreen(),
                    ),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.history),
                title: Text(
                  "Location history",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.white
                        : AppColors.boldHeadlineColor4,
                  ),
                ),
                subtitle: Text(
                  "View and manage your location data",
                  style: TextStyle(
                    fontSize: 14,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? AppColors.boldHeadlineColor2
                        : AppColors.secondaryHeadlineColor,
                  ),
                ),
                onTap: () {
                  // TODO: Add Location History screen
                },
              ),
              ListTile(
                leading: const Icon(Icons.share),
                title: Text(
                  "Data Sharing",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.white
                        : AppColors.boldHeadlineColor4,
                  ),
                ),
                subtitle: Text(
                  "Control how your data contributes to research",
                  style: TextStyle(
                    fontSize: 14,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? AppColors.boldHeadlineColor2
                        : AppColors.secondaryHeadlineColor,
                  ),
                ),
                onTap: () {
                  // TODO: Add Data Sharing screen
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
