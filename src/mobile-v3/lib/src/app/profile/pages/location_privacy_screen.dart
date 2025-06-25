import 'package:airqo/src/app/profile/pages/widgets/privacy_dialogs.dart';
import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/app/profile/pages/location_data_view_screen.dart';
import 'package:airqo/src/app/profile/pages/data_sharing_screen.dart';
import 'package:geolocator/geolocator.dart';

class LocationPrivacyScreen extends StatefulWidget {
  const LocationPrivacyScreen({super.key});

  @override
  State<LocationPrivacyScreen> createState() => _LocationPrivacyScreenState();
}

class _LocationPrivacyScreenState extends State<LocationPrivacyScreen> {
  final EnhancedLocationServiceManager _locationManager = EnhancedLocationServiceManager();
  bool _isTrackingActive = false;
  bool _isTrackingPaused = false;
  bool _locationEnabled = false;

  @override
  void initState() {
    super.initState();
    _initializeLocationManager();
    _setupTrackingListener();
    _checkLocationStatus();
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

  Future<void> _checkLocationStatus() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    LocationPermission permission = await Geolocator.checkPermission();

    setState(() {
      _locationEnabled = serviceEnabled &&
          permission != LocationPermission.denied &&
          permission != LocationPermission.deniedForever;
    });
  }

  Future<void> _toggleLocation(bool value) async {
    if (value) {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        bool openedSettings = await Geolocator.openLocationSettings();
        if (!openedSettings) {
          _showSnackBar('Please enable location services in settings.');
          return;
        }

        serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) {
          return;
        }
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _showSnackBar('Location permission denied.');
          return;
        } else if (permission == LocationPermission.deniedForever) {
          _showSnackBar(
              'Location permission permanently denied. Please enable it in settings.');
          await Geolocator.openAppSettings();
          return;
        }
      }
    }

    setState(() {
      _locationEnabled = value;
    });
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    
    return Scaffold(
      backgroundColor: isDarkMode ? AppColors.darkThemeBackground : AppColors.backgroundColor,
      appBar: AppBar(
        title: const Text('Location Privacy'),
        backgroundColor: isDarkMode ? AppColors.darkThemeBackground : AppColors.backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(
          color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
        ),
        titleTextStyle: TextStyle(
          color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(
          horizontal: screenWidth * 0.04,
          vertical: 16,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildLocationServicesSection(),
            SizedBox(height: screenHeight * 0.03),
            _buildTrackingControlSection(),
            SizedBox(height: screenHeight * 0.03),
            _buildPrivacyZonesSection(),
            SizedBox(height: screenHeight * 0.03),
            _buildDataManagementSection(),
            SizedBox(height: screenHeight * 0.03),
            _buildDataSharingSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationServicesSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
          width: 0.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.location_on,
                  color: AppColors.primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Location',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                activeColor: Colors.white,
                activeTrackColor: AppColors.primaryColor,
                inactiveThumbColor: Colors.white,
                inactiveTrackColor: isDarkMode 
                    ? Colors.grey[700] 
                    : Theme.of(context).highlightColor,
                value: _locationEnabled,
                onChanged: _toggleLocation,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'AirQo to use your precise location to locate the Air Quality of your nearest location',
            style: TextStyle(
              fontSize: 13,
              color: isDarkMode 
                  ? AppColors.secondaryHeadlineColor2 
                  : AppColors.secondaryHeadlineColor,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrackingControlSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
          width: 0.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.my_location,
                  color: AppColors.primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Location Tracking',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _isTrackingActive 
                          ? (_isTrackingPaused ? 'Paused' : 'Active')
                          : 'Stopped',
                      style: TextStyle(
                        fontSize: 14,
                        color: _isTrackingActive 
                            ? (_isTrackingPaused ? Colors.orange : Colors.green)
                            : Colors.red,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                activeColor: Colors.white,
                activeTrackColor: AppColors.primaryColor,
                inactiveThumbColor: Colors.white,
                inactiveTrackColor: isDarkMode 
                    ? Colors.grey[700] 
                    : Theme.of(context).highlightColor,
                value: _isTrackingActive,
                onChanged: (value) async {
                  if (value) {
                    await _locationManager.startLocationTracking();
                  } else {
                    await _locationManager.stopLocationTracking();
                  }
                  setState(() {
                    _isTrackingActive = value;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Controls whether your location is tracked for air quality insights',
            style: TextStyle(
              fontSize: 13,
              color: isDarkMode 
                  ? AppColors.secondaryHeadlineColor2 
                  : AppColors.secondaryHeadlineColor,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacyZonesSection() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
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
                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
              ),
            ),
            ElevatedButton.icon(
              onPressed: () => _showAddPrivacyZoneDialog(),
              icon: const Icon(Icons.add, size: 18, color: Colors.white),
              label: const Text('Add Zone'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(
                  horizontal: screenWidth * 0.04,
                  vertical: 8,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
                textStyle: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Locations where tracking is automatically disabled',
          style: TextStyle(
            fontSize: 14,
            color: isDarkMode 
                ? AppColors.secondaryHeadlineColor2 
                : AppColors.secondaryHeadlineColor,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 16),
        
        if (_locationManager.privacyZones.isEmpty)
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(screenWidth * 0.04),
            decoration: BoxDecoration(
              color: Theme.of(context).highlightColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
                width: 0.5,
              ),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.shield_outlined,
                  size: 48,
                  color: isDarkMode 
                      ? AppColors.secondaryHeadlineColor2 
                      : AppColors.secondaryHeadlineColor,
                ),
                const SizedBox(height: 12),
                Text(
                  'No privacy zones configured',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Add privacy zones to automatically disable tracking in sensitive areas',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: isDarkMode 
                        ? AppColors.secondaryHeadlineColor2 
                        : AppColors.secondaryHeadlineColor,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          )
        else
          Column(
            children: _locationManager.privacyZones
                .map((zone) => _buildPrivacyZoneCard(zone))
                .toList(),
          ),
      ],
    );
  }

  Widget _buildPrivacyZoneCard(PrivacyZone zone) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.red.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
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
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${zone.radius.toInt()}m radius',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDarkMode 
                        ? AppColors.secondaryHeadlineColor2 
                        : AppColors.secondaryHeadlineColor,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => _removePrivacyZone(zone.id),
            icon: const Icon(
              Icons.delete_outline,
              color: Colors.red,
              size: 20,
            ),
            tooltip: 'Remove zone',
          ),
        ],
      ),
    );
  }

  Widget _buildDataManagementSection() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final totalCount = _locationManager.locationHistory.length;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Data Management',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
          ),
        ),
        const SizedBox(height: 16),
        
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(screenWidth * 0.04),
          decoration: BoxDecoration(
            color: Theme.of(context).highlightColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
              width: 0.5,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.storage,
                      color: AppColors.primaryColor,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Location History',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$totalCount location points stored',
                          style: TextStyle(
                            fontSize: 14,
                            color: isDarkMode 
                                ? AppColors.secondaryHeadlineColor2 
                                : AppColors.secondaryHeadlineColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _showLocationDataView(),
                      icon: const Icon(Icons.visibility, size: 18, color: Colors.white,),
                      label: const Text('View Data'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                        textStyle: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showDeleteDataRangeDialog(),
                      icon: const Icon(Icons.delete_outline, size: 18),
                      label: const Text('Delete Range'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        side: const BorderSide(color: Colors.red, width: 1),
                        textStyle: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDataSharingSection() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final totalCount = _locationManager.locationHistory.length;
    final sharedCount = _locationManager.locationHistory
        .where((point) => point.isSharedWithResearchers)
        .length;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Data Sharing',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
          ),
        ),
        const SizedBox(height: 16),
        
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(screenWidth * 0.04),
          decoration: BoxDecoration(
            color: Theme.of(context).highlightColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
              width: 0.5,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.science,
                      color: Colors.green,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Research Contribution',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                          ),
                        ),
                        const SizedBox(height: 4),
                        RichText(
                          text: TextSpan(
                            style: TextStyle(
                              fontSize: 14,
                              color: isDarkMode 
                                  ? AppColors.secondaryHeadlineColor2 
                                  : AppColors.secondaryHeadlineColor,
                            ),
                            children: [
                              TextSpan(
                                text: '$sharedCount',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: Colors.green,
                                ),
                              ),
                              TextSpan(text: ' of $totalCount points shared'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                'Help improve air quality research by sharing anonymous location data with researchers',
                style: TextStyle(
                  fontSize: 13,
                  color: isDarkMode 
                      ? AppColors.secondaryHeadlineColor2 
                      : AppColors.secondaryHeadlineColor,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _showDataSharingDetails(),
                  icon: const Icon(Icons.settings, size: 18, color: Colors.white,),
                  label: const Text('Manage Sharing Preferences'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                    textStyle: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showAddPrivacyZoneDialog() {
    final locationManager = EnhancedLocationServiceManager(); 

    showDialog(
      context: context,
      builder: (context) => AddPrivacyZoneDialog(
        locationManager: locationManager,
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
        backgroundColor: Theme.of(context).highlightColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        title: Text(
          'Remove Privacy Zone',
          style: TextStyle(
            color: Theme.of(context).brightness == Brightness.dark 
                ? Colors.white 
                : AppColors.boldHeadlineColor4,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Text(
          'Are you sure you want to remove this privacy zone?',
          style: TextStyle(
            color: Theme.of(context).brightness == Brightness.dark 
                ? AppColors.secondaryHeadlineColor2 
                : AppColors.secondaryHeadlineColor,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).brightness == Brightness.dark 
                  ? Colors.grey[400] 
                  : Colors.grey[700],
            ),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Remove'),
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
    super.dispose();
  }
}