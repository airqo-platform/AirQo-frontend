import 'package:flutter/material.dart';
import 'dart:async';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_app_bar.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_header.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/services/mock_exposure_data.dart';
import 'package:airqo/src/app/exposure/services/exposure_calculator.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/app/exposure/utils/exposure_utils.dart';
import 'package:airqo/src/app/exposure/widgets/clock_exposure_painter.dart';
import 'package:airqo/src/app/exposure/widgets/current_time_pointer.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_summary_stats.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_peak_card.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_guide_popup.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_loading_content.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_error_content.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_permission_content.dart';
import 'package:loggy/loggy.dart';

class ExposureDashboardView extends StatefulWidget {
  const ExposureDashboardView({super.key});

  @override
  State<ExposureDashboardView> createState() => _ExposureDashboardViewState();
}

class _ExposureDashboardViewState extends State<ExposureDashboardView> with UiLoggy {
  bool _isRequestingPermission = false;
  bool _showGuide = false;
  final EnhancedLocationServiceManager _locationService = EnhancedLocationServiceManager();

  DailyExposureSummary? _todayExposure;
  bool _hasLocationPermission = false;
  bool _isLoadingData = false;
  String? _errorMessage;

  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _checkLocationPermissionAndLoadData();
    _startPeriodicRefresh();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  void _startPeriodicRefresh() {
    _refreshTimer = Timer.periodic(Duration(minutes: 10), (timer) {
      if (_hasLocationPermission && !_isLoadingData) {
        _loadExposureData();
      }
    });
  }

  Future<void> _checkLocationPermissionAndLoadData() async {
    try {
      final permissionResult = await _locationService.checkLocationPermission();

      if (permissionResult.isSuccess) {
        await _locationService.initialize();
        await _locationService.startLocationTracking();

        setState(() {
          _hasLocationPermission = true;
        });

        await AnalyticsService().trackExposureTrackingEnabled();
        await _loadExposureData();
      } else {
        setState(() {
          _hasLocationPermission = false;
        });
        await AnalyticsService().trackExposureTrackingDisabled();
      }
    } catch (e) {
      setState(() {
        _hasLocationPermission = false;
      });
    }
  }

  Future<void> _loadExposureData() async {
    if (_isLoadingData) return;

    setState(() {
      _isLoadingData = true;
      _errorMessage = null;
    });

    try {
      final calculator = ExposureCalculator();
      final todayData = await calculator.getTodayExposure();

      if (mounted) {
        if (todayData != null && todayData.dataPoints.isNotEmpty) {
          setState(() {
            _todayExposure = todayData;
            _isLoadingData = false;
            _errorMessage = null;
          });

          await AnalyticsService().trackExposureDataLoaded();
          await AnalyticsService().trackExposureLevelViewed(
            level: todayData.riskLevel.name,
          );
        } else {
          final mockTodayData = MockExposureData.generateTodayExposure();

          setState(() {
            _todayExposure = mockTodayData;
            _isLoadingData = false;
            _errorMessage = null;
          });

          await AnalyticsService().trackExposureDataLoaded();
          await AnalyticsService().trackExposureLevelViewed(
            level: mockTodayData.riskLevel.name,
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingData = false;
          _errorMessage = 'Failed to load exposure data. Please check your location settings and internet connection.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: DashboardAppBar(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DashboardHeader(),
            Padding(
              padding: const EdgeInsets.fromLTRB(24.0, 0, 24.0, 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  if (_isLoadingData)
                    const ExposureLoadingContent()
                  else if (_errorMessage != null)
                    ExposureErrorContent(
                      errorMessage: _errorMessage!,
                      onRetry: () {
                        setState(() {
                          _errorMessage = null;
                        });
                        _loadExposureData();
                      },
                    )
                  else if (_hasLocationPermission && _todayExposure != null)
                    _buildExposureContent()
                  else
                    ExposurePermissionContent(
                      isRequesting: _isRequestingPermission,
                      onRequest: _requestLocationPermission,
                    ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExposureContent() {
    final currentData = _todayExposure;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Today\'s exposure summary',
          style: TextStyle(
            fontSize: 16,
            color: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.color
                ?.withValues(alpha: 0.7),
          ),
        ),
        const SizedBox(height: 32),
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: GestureDetector(
            onTap: () {
              if (_showGuide) {
                setState(() => _showGuide = false);
              }
            },
            child: Stack(
              children: [
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        getDynamicTitle(currentData),
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context)
                              .textTheme
                              .headlineLarge
                              ?.color,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        getDynamicDescription(currentData),
                        style: TextStyle(
                          fontSize: 16,
                          color: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.color
                              ?.withValues(alpha: 0.7),
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 32),
                      Center(
                        child: SizedBox(
                          width: 220,
                          height: 220,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              CustomPaint(
                                size: const Size(220, 220),
                                painter: ClockExposurePainter(
                                  exposureData: currentData,
                                  showData: currentData != null,
                                ),
                              ),
                              const CurrentTimePointer(),
                              Center(
                                child: SvgPicture.asset(
                                  getCurrentHourAirQualityIcon(currentData),
                                  width: 80,
                                  height: 80,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: GestureDetector(
                          onTap: () => setState(() => _showGuide = !_showGuide),
                          onLongPress: () {
                            _loadExposureData();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            decoration: BoxDecoration(
                              color: Theme.of(context).brightness == Brightness.dark
                                  ? AppColors.darkHighlight
                                  : Colors.grey.shade200,
                              borderRadius: BorderRadius.circular(25),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 20,
                                  height: 20,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                        color: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.color
                                                ?.withValues(alpha: 0.6) ??
                                            Colors.grey.shade600,
                                        width: 1.5),
                                  ),
                                  child: Center(
                                    child: Text(
                                      'i',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.color
                                            ?.withValues(alpha: 0.7),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Guide',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                    color: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.color
                                        ?.withValues(alpha: 0.8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      if (currentData != null) ExposureSummaryStats(data: currentData),
                    ],
                  ),
                ),
                if (_showGuide)
                  Positioned(
                    bottom: 100,
                    left: 24,
                    right: 24,
                    child: GestureDetector(
                      onTap: () {},
                      child: ExposureGuidePopup(
                        onClose: () => setState(() => _showGuide = false),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        if (currentData != null) ...[
          Text(
            'Today\'s peak exposure',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.color,
            ),
          ),
          const SizedBox(height: 12),
          ExposurePeakCard(data: currentData),
        ],
      ],
    );
  }

  Future<void> _requestLocationPermission() async {
    if (_isRequestingPermission) return;

    setState(() {
      _isRequestingPermission = true;
    });

    try {
      final result = await _locationService.requestLocationPermission();

      if (!mounted) return;

      setState(() {
        _isRequestingPermission = false;
      });

      if (result.isSuccess) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Location permission granted! You can now track your exposure.'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );

        await _locationService.initialize();
        await _locationService.startLocationTracking();

        setState(() {
          _hasLocationPermission = true;
        });

        await _loadExposureData();
      } else {
        String errorMessage;
        String actionText = 'OK';
        VoidCallback? action;

        switch (result.status) {
          case LocationStatus.permissionDenied:
            errorMessage = 'Location permission is required to track your pollution exposure. Please allow location access to continue.';
            actionText = 'Try Again';
            action = () => _requestLocationPermission();
            break;
          case LocationStatus.permissionDeniedForever:
            errorMessage = 'Location permission has been permanently denied. Please enable it in your device settings to track exposure.';
            actionText = 'Open Settings';
            action = () => _openAppSettings();
            break;
          case LocationStatus.serviceDisabled:
            errorMessage = 'Location services are disabled. Please enable location services in your device settings.';
            actionText = 'Open Settings';
            action = () => _openAppSettings();
            break;
          default:
            errorMessage = result.error ?? 'Unable to request location permission. Please try again.';
        }

        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Location Access Required'),
            content: Text(errorMessage),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text('Cancel'),
              ),
              if (action != null)
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    action!();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: Text(actionText),
                ),
            ],
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _isRequestingPermission = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error requesting location permission: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _openAppSettings() async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Open Settings'),
        content: Text('Please go to Settings > Apps > AirQo > Permissions and enable Location access.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }
}
