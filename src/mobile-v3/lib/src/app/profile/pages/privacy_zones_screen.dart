import 'package:flutter/material.dart';
import 'package:dotted_border/dotted_border.dart';
import 'add_location_screen.dart'; // Import the AddLocationScreen

class PrivacyZonesScreen extends StatefulWidget {
  const PrivacyZonesScreen({super.key});

  @override
  State<PrivacyZonesScreen> createState() => _PrivacyZonesScreenState();
}

class _PrivacyZonesScreenState extends State<PrivacyZonesScreen> {
  final List<String> privacyZones = []; // List of selected privacy zones
  final List<String> availableLocations = []; // List of available locations

  void _showDeleteConfirmation(BuildContext context, String zone) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Delete Privacy Zone"),
        content: Text("Are you sure you want to delete \"$zone\"?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                privacyZones.remove(zone);
              });
              Navigator.pop(context);
            },
            child: const Text("Delete"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Privacy Zones"),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              privacyZones.isEmpty
                  ? "No privacy zones configured"
                  : "Manage your privacy zones below",
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              "Add privacy zones to automatically disable tracking in sensitive areas",
              style: TextStyle(color: Colors.black87),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: privacyZones.isEmpty
                  ? _buildEmptyState(context)
                  : _buildPrivacyZonesList(context, privacyZones),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          DottedBorder(
            borderType: BorderType.Circle,
            color: Colors.blue,
            dashPattern: const [6, 3],
            strokeWidth: 2,
            child: Container(
              width: 120,
              height: 120,
              alignment: Alignment.center,
              child: const Icon(Icons.shield, size: 60, color: Colors.grey),
            ),
          ),
          const SizedBox(height: 25),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => AddLocationScreen(),
                ),
              );
            },
            icon: const Icon(Icons.add_location_alt, color: Colors.white),
            label: const Text("+ Add location"),
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacyZonesList(BuildContext context, List<String> zones) {
    return ListView.builder(
      itemCount: zones.length,
      itemBuilder: (context, index) {
        return ListTile(
          leading: const Icon(Icons.location_on),
          title: Text(zones[index]),
          trailing: IconButton(
            icon: const Icon(Icons.delete, color: Colors.red),
            onPressed: () => _showDeleteConfirmation(context, zones[index]),
          ),
        );
      },
    );
  }
}

class _AddLocationDialog extends StatefulWidget {
  final List<String> availableLocations;
  final Function(List<String>) onSave;

  const _AddLocationDialog({
    required this.availableLocations,
    required this.onSave,
  });

  @override
  State<_AddLocationDialog> createState() => _AddLocationDialogState();
}

class _AddLocationDialogState extends State<_AddLocationDialog> {
  final List<String> selectedLocations = [];

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Zone'),
      content: SingleChildScrollView(
        child: Column(
          children: widget.availableLocations.map((location) {
            return CheckboxListTile(
              title: Text(location),
              value: selectedLocations.contains(location),
              onChanged: (bool? value) {
                setState(() {
                  if (value == true) {
                    selectedLocations.add(location);
                  } else {
                    selectedLocations.remove(location);
                  }
                });
              },
            );
          }).toList(),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: selectedLocations.isNotEmpty
              ? () {
                  widget.onSave(selectedLocations);
                  Navigator.pop(context);
                }
              : null,
          child: const Text('Save Locations'),
        ),
      ],
    );
  }
}
