
import 'package:airqo/src/app/profile/pages/widgets/privacy_dialogs.dart';
import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/profile/pages/widgets/settings_tile.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/app/profile/pages/location_data_view_screen.dart';
import 'package:airqo/src/app/profile/pages/data_sharing_screen.dart';

class LocationPrivacyScreen extends StatefulWidget {
  const LocationPrivacyScreen({super.key});

  @override
  State<LocationPrivacyScreen> createState() => _LocationPrivacyScreenState();
}

class _LocationPrivacyScreenState extends State<LocationPrivacyScreen> {
  final EnhancedLocationServiceManager _locationManager = EnhancedLocationServiceManager();
  bool _isTrackingActive = false;
  bool _isTrackingPaused = false;

  @override
  void initState() {
    super.initState();
    _initializeLocationManager();
    _setupTrackingListener();
  }

  Future<void> _initializeLocationManager() async {
    await _locationManager.initialize();
    setState(() {
      _isTrackingActive = _locationManager.isTrackingActive;
      _isTrackingPaused = _locationManager.isTrackingPaused;
    });
  }

  void _setupTrackingListener() {
    _locationManager.trackingStatusStream.listen((isActive) {
      if (mounted) {
        setState(() {
          _isTrackingActive = isActive;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
      appBar: AppBar(
        title: const Text('Location Privacy'),
        backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Real-time tracking status
            _buildTrackingStatusCard(),
            const SizedBox(height: 20),
            
            // Tracking controls
            _buildTrackingControlsSection(),
            const SizedBox(height: 20),
            
            // Privacy zones
            _buildPrivacyZonesSection(),
            const SizedBox(height: 20),
            
            // Location data management
            _buildLocationDataSection(),
            const SizedBox(height: 20),
            
            // Data sharing controls
            _buildDataSharingSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildTrackingStatusCard() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final isActive = _isTrackingActive && !_isTrackingPaused;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDarkMode ? AppColors.primaryColor.withOpacity(0.1) : AppColors.primaryColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isActive ? Colors.green : Colors.orange,
          width: 2,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: isActive ? Colors.green : Colors.orange,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Location Tracking Status',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDarkMode ? Colors.white : Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isActive ? 'Currently tracking your location' : 
                  _isTrackingPaused ? 'Tracking paused' : 'Tracking stopped',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDarkMode ? Colors.white70 : Colors.black54,
                  ),
                ),
              ],
            ),
          ),
          if (isActive)
            const Icon(
              Icons.radio_button_checked,
              color: Colors.green,
              size: 20,
            ),
        ],
      ),
    );
  }

  Widget _buildTrackingControlsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tracking Controls',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Theme.of(context).textTheme.headlineSmall?.color,
          ),
        ),
        const SizedBox(height: 12),
        
        SettingsTile(
          switchValue: _isTrackingActive,
          iconPath: "assets/images/shared/location_icon.svg",
          title: "Location Tracking",
          description: "Enable location tracking for pollution exposure research",
          onChanged: (value) async {
            if (value) {
              try {
                await _locationManager.startLocationTracking();
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Failed to start tracking: $e')),
                );
              }
            } else {
              await _locationManager.stopLocationTracking();
            }
          },
        ),
        
        if (_isTrackingActive)
          SettingsTile(
            switchValue: _isTrackingPaused,
            iconPath: "assets/icons/pause.svg",
            title: "Pause Tracking",
            description: "Temporarily pause location tracking",
            onChanged: (value) async {
              if (value) {
                await _locationManager.pauseLocationTracking();
              } else {
                await _locationManager.resumeLocationTracking();
              }
              setState(() {
                _isTrackingPaused = value;
              });
            },
          ),
      ],
    );
  }

  Widget _buildPrivacyZonesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Privacy Zones',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).textTheme.headlineSmall?.color,
              ),
            ),
            TextButton.icon(
              onPressed: () => _showAddPrivacyZoneDialog(),
              icon: const Icon(Icons.add),
              label: const Text('Add Zone'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Locations where tracking is automatically disabled',
          style: TextStyle(
            fontSize: 14,
            color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.7),
          ),
        ),
        const SizedBox(height: 12),
        
        if (_locationManager.privacyZones.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text('No privacy zones configured'),
          )
        else
          ..._locationManager.privacyZones.map((zone) => _buildPrivacyZoneCard(zone)),
      ],
    );
  }

  Widget _buildPrivacyZoneCard(PrivacyZone zone) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Colors.red.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Icon(
              Icons.shield,
              color: Colors.red,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  zone.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  '${zone.radius.toInt()}m radius',
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => _removePrivacyZone(zone.id),
            icon: const Icon(Icons.delete_outline),
            color: Colors.red,
          ),
        ],
      ),
    );
  }

  Widget _buildLocationDataSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Location Data',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Theme.of(context).textTheme.headlineSmall?.color,
          ),
        ),
        const SizedBox(height: 12),
        
        ListTile(
          leading: const Icon(Icons.visibility),
          title: const Text('View My Data'),
          subtitle: Text('${_locationManager.locationHistory.length} location points recorded'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => _showLocationDataView(),
        ),
        
        ListTile(
          leading: const Icon(Icons.delete_sweep),
          title: const Text('Delete Data Range'),
          subtitle: const Text('Remove specific time periods'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => _showDeleteDataRangeDialog(),
        ),
      ],
    );
  }

  Widget _buildDataSharingSection() {
    final sharedCount = _locationManager.getDataForResearchers().length;
    final totalCount = _locationManager.locationHistory.length;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Data Sharing',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Theme.of(context).textTheme.headlineSmall?.color,
          ),
        ),
        const SizedBox(height: 12),
        
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Research Contribution',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Theme.of(context).textTheme.headlineSmall?.color,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '$sharedCount of $totalCount location points will be shared with researchers',
                style: TextStyle(
                  fontSize: 14,
                  color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.7),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => _showDataSharingDetails(),
                child: const Text('Manage Sharing Preferences'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showAddPrivacyZoneDialog() {
    showDialog(
      context: context,
      builder: (context) => AddPrivacyZoneDialog(
        onAddZone: (name, lat, lng, radius) async {
          await _locationManager.addPrivacyZone(name, lat, lng, radius);
          setState(() {});
        },
      ),
    );
  }

  void _removePrivacyZone(String zoneId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Privacy Zone'),
        content: const Text('Are you sure you want to remove this privacy zone?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Remove', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _locationManager.removePrivacyZone(zoneId);
      setState(() {});
    }
  }

  void _showLocationDataView() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LocationDataViewScreen(
          locationHistory: _locationManager.locationHistory,
          onDeletePoint: (pointId) async {
            await _locationManager.deleteLocationPoint(pointId);
            setState(() {});
          },
        ),
      ),
    );
  }

  void _showDeleteDataRangeDialog() {
    showDialog(
      context: context,
      builder: (context) => DeleteDataRangeDialog(
        onDeleteRange: (start, end) async {
          await _locationManager.deleteLocationPointsInRange(start, end);
          setState(() {});
        },
      ),
    );
  }

  void _showDataSharingDetails() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DataSharingScreen(
          locationHistory: _locationManager.locationHistory,
          onUpdateSharing: (pointId, share) async {
            await _locationManager.updateDataSharingConsent(pointId, share);
            setState(() {});
          },
        ),
      ),
    );
  }

  @override
  void dispose() {
    // Note: Don't dispose the singleton location manager here
    super.dispose();
  }
}