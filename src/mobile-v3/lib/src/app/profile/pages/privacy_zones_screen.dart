import 'package:flutter/material.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/swipeable_analytics_card.dart';
import 'add_location_screen.dart'; // Import the AddLocationScreen

class PrivacyZonesScreen extends StatefulWidget {
  const PrivacyZonesScreen({super.key});

  @override
  State<PrivacyZonesScreen> createState() => _PrivacyZonesScreenState();
}

class _PrivacyZonesScreenState extends State<PrivacyZonesScreen> {
  final List<Measurement> privacyZones = []; // List of selected privacy zone measurements
  final List<String> availableLocations = []; // List of available locations

  void _removePrivacyZone(String siteId) {
    // Find the measurement by matching the siteId
    Measurement? measurementToRemove;
    for (Measurement measurement in privacyZones) {
      if (measurement.siteId == siteId) {
        measurementToRemove = measurement;
        break;
      }
    }
    
    if (measurementToRemove != null) {
      final locationName = measurementToRemove.siteDetails?.name ?? 
                          measurementToRemove.siteDetails?.formattedName ?? 
                          'Unknown Location';
      
      setState(() {
        privacyZones.remove(measurementToRemove);
      });
      
      final scaffoldMessenger = ScaffoldMessenger.of(context);
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text(
            'Privacy zone "$locationName" removed',
            style: const TextStyle(color: Colors.white),
          ),
          backgroundColor: Colors.orange,
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
          action: SnackBarAction(
            label: 'Undo',
            textColor: Colors.white,
            onPressed: () {
              setState(() {
                privacyZones.add(measurementToRemove!);
              });
            },
          ),
        ),
      );
    }
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
                  : "Add Privacy Zones",
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
              "Set locations where tracking is disabled",
              style: TextStyle(
                fontSize: 16,
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.boldHeadlineColor2
                    : AppColors.secondaryHeadlineColor,
              ),
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
            color: AppColors.primaryColor,
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
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onPressed: () async {
              final scaffoldMessenger = ScaffoldMessenger.of(context);
              final result = await Navigator.push<List<Measurement>>(
                context,
                MaterialPageRoute(
                  builder: (context) => const AddLocationScreen(),
                ),
              );
              
              if (result != null && result.isNotEmpty && mounted) {
                setState(() {
                  privacyZones.addAll(result);
                });
                
                if (mounted) {
                  scaffoldMessenger.showSnackBar(
                    SnackBar(
                      content: Text(
                        'Added ${result.length} location${result.length != 1 ? 's' : ''} to privacy zones',
                        style: const TextStyle(color: Colors.white),
                      ),
                      backgroundColor: Colors.green,
                      duration: const Duration(seconds: 2),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                }
              }
            },
            icon: const Icon(Icons.add_location_alt, color: Colors.white),
            label: const Text("+ Add location"),
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacyZonesList(BuildContext context, List<Measurement> zones) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onPressed: () async {
                final scaffoldMessenger = ScaffoldMessenger.of(context);
                final result = await Navigator.push<List<Measurement>>(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const AddLocationScreen(),
                  ),
                );
                
                if (result != null && result.isNotEmpty && mounted) {
                  setState(() {
                    privacyZones.addAll(result);
                  });
                  
                  if (mounted) {
                    scaffoldMessenger.showSnackBar(
                      SnackBar(
                        content: Text(
                          'Added ${result.length} location${result.length != 1 ? 's' : ''} to privacy zones',
                          style: const TextStyle(color: Colors.white),
                        ),
                        backgroundColor: Colors.green,
                        duration: const Duration(seconds: 2),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  }
                }
              },
              icon: const Icon(Icons.add_location_alt, color: Colors.white),
              label: const Text("+ Add location"),
            ),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: zones.length,
            itemBuilder: (context, index) {
              final measurement = zones[index];
              final locationName = measurement.siteDetails?.name ?? 
                                   measurement.siteDetails?.formattedName ?? 
                                   'Unknown Location';
              return SwipeableAnalyticsCard(
                measurement: measurement,
                onRemove: _removePrivacyZone,
                fallbackLocationName: locationName,
              );
            },
          ),
        ),
      ],
    );
  }
}
