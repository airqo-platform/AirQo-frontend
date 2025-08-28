import 'package:flutter/material.dart';
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
            const Text(
              "Allow Location Access",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              "Get air quality data for nearby locations and pollution exposure insights.",
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
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline, color: Colors.blue),
                    const SizedBox(width: 8),
                    Expanded(
                      child: const Text(
                        "Enable location access to get personalized air quality information and pollution exposure insights. Your data will be used solely for research not in anyway that causes harm.",
                        style: TextStyle(fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),

            // Show advanced settings for both "While Using the App" and "Always"
            if (_selectedOption == "WhileUsing" ||
                _selectedOption == "Always") ...[
              const Divider(height: 32),
              const Text(
                "Privacy & Data",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ListTile(
                leading: const Icon(Icons.location_off_outlined),
                title: const Text("Privacy zones"),
                subtitle:
                    const Text("Set locations where tracking is disabled"),
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
                title: const Text("Add Location"),
                subtitle:
                    const Text("Add a new location to your privacy zones"),
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
                title: const Text("Location history"),
                subtitle: const Text("View and manage your location data"),
                onTap: () {
                  // TODO: Add Location History screen
                },
              ),
              ListTile(
                leading: const Icon(Icons.share),
                title: const Text("Data Sharing"),
                subtitle:
                    const Text("Control how your data contributes to research"),
                onTap: () {
                  // TODO: Add Data Sharing screen
                },
              ),
            ],
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: () {
                Navigator.pop(context, _selectedOption);
              },
              child: const Text("Save"),
            ),
          ],
        ),
      ),
    );
  }
}
