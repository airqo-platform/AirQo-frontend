import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math' as math;
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_app_bar.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_header.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/services/mock_exposure_data.dart';
import 'package:airqo/src/app/exposure/services/exposure_calculator.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:loggy/loggy.dart';
import 'package:geolocator/geolocator.dart';

class ClockExposurePainter extends CustomPainter {
  final DailyExposureSummary? exposureData;
  final bool showData;

  ClockExposurePainter({
    this.exposureData,
    this.showData = false,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final outerRadius = size.width / 2;
    final strokeWidth = 16.0;
    final innerRadius = outerRadius - strokeWidth;
    
    // Calculate angle per hour (360° / 24 hours = 15° per hour)
    final anglePerHour = 2 * math.pi / 24;
    final segmentGap = 0.02; // Small gap between segments
    
    // Group exposure data by hour if available
    Map<int, double> hourlyExposure = {};
    Map<int, String> hourlyAqiCategory = {};
    
    if (showData && exposureData != null) {
      // Process exposure data points and group by hour
      for (final point in exposureData!.dataPoints) {
        final hour = point.timestamp.hour;
        final exposure = point.exposureScore;
        
        if (hourlyExposure.containsKey(hour)) {
          hourlyExposure[hour] = hourlyExposure[hour]! + exposure;
        } else {
          hourlyExposure[hour] = exposure;
          hourlyAqiCategory[hour] = point.aqiCategory ?? 'Unknown';
        }
      }
    }
    
    // Draw 24 hour segments
    for (int hour = 0; hour < 24; hour++) {
      final startAngle = (hour * anglePerHour) - (math.pi / 2) + segmentGap;
      final sweepAngle = anglePerHour - (2 * segmentGap);
      
      Paint paint;
      
      if (showData && hourlyExposure.containsKey(hour)) {
        // Use exposure data to determine color
        final exposure = hourlyExposure[hour]!;
        final category = hourlyAqiCategory[hour] ?? 'Unknown';
        paint = Paint()
          ..color = _getExposureColor(exposure, category)
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.butt;
      } else {
        // Default inactive color
        paint = Paint()
          ..color = Colors.grey.withValues(alpha: 0.3)
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.butt;
      }
      
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: outerRadius - strokeWidth / 2),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
    }
    
    // Draw hour numbers
    final textPainter = TextPainter(
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    );
    
    final numberRadius = outerRadius + 20;
    
    for (int hour = 0; hour < 24; hour++) {
      final angle = (hour * anglePerHour) - (math.pi / 2);
      final x = center.dx + numberRadius * math.cos(angle);
      final y = center.dy + numberRadius * math.sin(angle);
      
      // Format hour display (00, 01, 02, etc.)
      final hourText = hour.toString().padLeft(2, '0');
      
      textPainter.text = TextSpan(
        text: hourText,
        style: TextStyle(
          color: Colors.grey.shade700,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      );
      
      textPainter.layout();
      textPainter.paint(
        canvas,
        Offset(
          x - textPainter.width / 2,
          y - textPainter.height / 2,
        ),
      );
    }
    
  }
  
  Color _getExposureColor(double exposure, String aqiCategory) {
    // Color based on AQI category to match the design
    switch (aqiCategory.toLowerCase()) {
      case 'good':
        return const Color(0xFF8FE6A4); // Light green
      case 'moderate':
        return const Color(0xFFFFEC89); // Light yellow
      case 'unhealthy for sensitive groups':
        return const Color(0xFFFFC170); // Light orange
      case 'unhealthy':
        return const Color(0xFFF0B1D8); // Light pink/red
      case 'very unhealthy':
        return const Color(0xFFDBB6F1); // Light purple
      case 'hazardous':
        return const Color(0xFFF7453C); // Red
      default:
        // Fallback based on exposure score
        if (exposure >= 20) return const Color(0xFFF7453C); // High - Red
        if (exposure >= 10) return const Color(0xFFF0B1D8); // Moderate-High - Pink
        if (exposure >= 5) return const Color(0xFFFFC170);  // Moderate - Orange
        if (exposure >= 2) return const Color(0xFFFFEC89);  // Low - Yellow
        return const Color(0xFF8FE6A4); // Minimal - Green
    }
  }

  @override
  bool shouldRepaint(ClockExposurePainter oldDelegate) {
    return oldDelegate.exposureData != exposureData || 
           oldDelegate.showData != showData;
  }
}

class ExposureDashboardView extends StatefulWidget {
  const ExposureDashboardView({super.key});

  @override
  State<ExposureDashboardView> createState() => _ExposureDashboardViewState();
}

class _ExposureDashboardViewState extends State<ExposureDashboardView> with UiLoggy {
  int _selectedTabIndex = 0; // 0 for Today, 1 for This week
  bool _isRequestingPermission = false;
  bool _showGuide = false;
  final EnhancedLocationServiceManager _locationService = EnhancedLocationServiceManager();
  
  DailyExposureSummary? _todayExposure;
  List<DailyExposureSummary> _weeklyData = [];
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
    // Refresh exposure data every 10 minutes if location tracking is active
    _refreshTimer = Timer.periodic(Duration(minutes: 10), (timer) {
      if (_hasLocationPermission && !_isLoadingData) {
        _loadExposureData();
      }
    });
  }

  Future<void> _checkLocationPermissionAndLoadData() async {
    try {
      // Check if we already have location permission
      final permissionResult = await _locationService.checkLocationPermission();
      
      if (permissionResult.isSuccess) {
        // We have permission, initialize and start tracking
        await _locationService.initialize();
        await _locationService.startLocationTracking();
        
        setState(() {
          _hasLocationPermission = true;
        });
        
        // Load exposure data
        await _loadExposureData();
      } else {
        // No permission - user will need to grant it via the button
        setState(() {
          _hasLocationPermission = false;
        });
      }
    } catch (e) {
      // Handle silently - user will see permission request UI
      setState(() {
        _hasLocationPermission = false;
      });
    }
  }

  Future<void> _loadExposureData() async {
    if (_isLoadingData) return;
    
    setState(() {
      _isLoadingData = true;
      _errorMessage = null; // Clear previous errors
    });

    try {
      final calculator = ExposureCalculator();
      
      // Try to get real exposure data first
      final todayData = await calculator.getTodayExposure();
      
      // Get weekly data
      final weeklyTrend = await calculator.getCurrentWeekTrend();
      final weeklyData = weeklyTrend?.dailySummaries ?? [];
      
      if (mounted) {
        if (todayData != null && todayData.dataPoints.isNotEmpty) {
          // Use real calculated data
          setState(() {
            _todayExposure = todayData;
            _weeklyData = weeklyData;
            _isLoadingData = false;
            _errorMessage = null;
          });
        } else {
          // Fall back to mock data if no real data available
          final mockTodayData = MockExposureData.generateTodayExposure();
          final mockWeeklyData = MockExposureData.generateWeeklyData();
          
          setState(() {
            _todayExposure = mockTodayData;
            _weeklyData = mockWeeklyData;
            _isLoadingData = false;
            _errorMessage = null;
          });
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
            // Dashboard header
            DashboardHeader(),
            
            // Exposure content
            Padding(
              padding: const EdgeInsets.fromLTRB(24.0, 0, 24.0, 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                
                // Tab selector
                Container(
                  height: 44,
                  alignment: Alignment.centerLeft,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildTabButton(
                        label: "Today",
                        isSelected: _selectedTabIndex == 0,
                        onTap: () => setState(() => _selectedTabIndex = 0),
                      ),
                      const SizedBox(width: 8),
                      _buildTabButton(
                        label: "This week",
                        isSelected: _selectedTabIndex == 1,
                        onTap: () => setState(() => _selectedTabIndex = 1),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 25),
                
                // Content based on permission status
                if (_isLoadingData)
                  _buildLoadingContent()
                else if (_errorMessage != null)
                  _buildErrorContent()
                else if (_hasLocationPermission && _todayExposure != null)
                  _buildExposureContent()
                else
                  _buildPermissionContent(),
                
                const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title
        Text(
          _selectedTabIndex == 0 
              ? 'Today\'s exposure summary'
              : 'Weekly exposure summary',
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
        
        // Loading container with same styling as actual content
        Container(
          width: double.infinity,
          height: 400,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Loading indicator
              CircularProgressIndicator(
                color: AppColors.primaryColor,
                strokeWidth: 3,
              ),
              
              const SizedBox(height: 16),
              
              Text(
                'Loading exposure data...',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.color
              ?.withValues(alpha: 0.7),
                ),
              ),
              
              const SizedBox(height: 8),
              
              Text(
                'Analyzing your pollution exposure',
                style: TextStyle(
                  fontSize: 14,
                  color: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.color
              ?.withValues(alpha: 0.6),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildErrorContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title
        Text(
          _selectedTabIndex == 0 
              ? 'Today\'s exposure summary'
              : 'Weekly exposure summary',
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
        
        // Error container with same styling as actual content
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Error icon
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.error_outline,
                    size: 32,
                    color: Colors.red.shade400,
                  ),
                ),
                
                const SizedBox(height: 24),
                
                Text(
                  'Unable to load exposure data',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 12),
                
                Text(
                  _errorMessage ?? 'An unexpected error occurred',
                  style: TextStyle(
                    fontSize: 14,
                    color: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.color
              ?.withValues(alpha: 0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 24),
                
                // Retry button
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _errorMessage = null;
                    });
                    _loadExposureData();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    'Try Again',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildExposureContent() {
    final currentData = _selectedTabIndex == 0 ? _todayExposure : (_weeklyData.isNotEmpty ? _weeklyData.last : null);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title
      //  Text(
          // _selectedTabIndex == 0 ? 'Today\'s exposure summary' : 'This week\'s exposure',
          // style: TextStyle(
          //   fontSize: 20,
          //   fontWeight: FontWeight.w600,
          //   color: Colors.black87,
          // ),
        //),

        
        // Subtitle with time range
        Text(
          _selectedTabIndex == 0 
              ? 'Today\'s exposure summary'
              : 'Weekly exposure summary',
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
        
        // Exposure chart with summary
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: Theme.of(context).highlightColor,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.black.withValues(alpha: 0.3)
                    : Colors.black.withValues(alpha: 0.08),
                blurRadius: 10,
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
                      // Title and description
                      Text(
                        _getDynamicTitle(currentData),
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
                        _getDynamicDescription(currentData),
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
                      
                      // Circular chart
                      Center(
                        child: SizedBox(
                          width: 220,
                          height: 220,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              // Custom 24-hour clock painter with data
                              CustomPaint(
                                size: const Size(220, 220),
                                painter: ClockExposurePainter(
                                  exposureData: currentData,
                                  showData: currentData != null,
                                ),
                              ),
                              
                              // SVG pointer for current time
                              _buildCurrentTimePointer(),
                              
                              // Air quality icon for current hour  
                              Center(
                                child: SvgPicture.asset(
                                  _getCurrentHourAirQualityIcon(currentData),
                                  width: 80,
                                  height: 80,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Guide button
                      Align(
                        alignment: Alignment.centerLeft,
                        child: GestureDetector(
                          onTap: () => setState(() => _showGuide = !_showGuide),
                          onLongPress: () {
                            // Debug feature: force refresh data on long press
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
                                            ?.withValues(alpha: 0.6) ?? Colors.grey.shade600, 
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
                      
                      // Summary statistics
                      if (currentData != null) _buildSummaryStats(currentData),
                    ],
                  ),
                ),
                
                // Guide popup overlay
                if (_showGuide)
                  Positioned(
                    bottom: 100,
                    left: 24,
                    right: 24,
                    child: GestureDetector(
                      onTap: () {}, // Prevent tap from propagating to parent
                      child: _buildGuidePopup(),
                    ),
                  ),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Today's exposure peak - separate card
        if (currentData != null) ...[
          // Title outside the card
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
          
          _buildExposurePeak(currentData),
        ],
      ],
    );
  }

  Widget _buildSummaryStats(DailyExposureSummary data) {
    // Calculate low exposure hours (Good + Moderate categories)
    final lowExposureTime = data.timeByAqiCategory.entries
        .where((entry) => ['good', 'moderate'].contains(entry.key.toLowerCase()))
        .fold(Duration.zero, (sum, entry) => sum + entry.value);
    
    final lowExposureHours = lowExposureTime.inHours;
    final totalOutdoorHours = data.totalOutdoorTime.inHours;
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _buildStatCard(
          'Low exposure',
          lowExposureHours.toString().padLeft(2, '0'),
          'hours',
          const Color(0xFF8FE6A4),
        ),
        _buildStatCard(
          'Total exposure time',
          totalOutdoorHours.toString(),
          'hours',
          AppColors.primaryColor,
        ),
        _buildStatCard(
          'Risk level',
          data.riskLevel.displayName,
          '',
          _getRiskLevelColor(data.riskLevel),
        ),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, String unit, Color color) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            if (unit.isNotEmpty) ...[
              const SizedBox(width: 4),
              Text(
                unit,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: color.withValues(alpha: 0.8),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.color
              ?.withValues(alpha: 0.7),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildExposurePeak(DailyExposureSummary data) {
    // Get peak air quality reading from nearby sensors, but keep original card design
    return FutureBuilder<Map<String, dynamic>?>(
      future: _getPeakAirQualityReading(),
      builder: (context, snapshot) {
        // Use sensor data if available, otherwise fallback to original logic
        String timeString;
        String locationDescription;
        String peakCategory;
        double peakPm25;
        Color peakColor;
        
        if (snapshot.hasData && snapshot.data != null) {
          // Use real sensor data
          final peakData = snapshot.data!;
          peakPm25 = peakData['pm25'] as double;
          timeString = peakData['timeString'] as String;
          peakCategory = peakData['category'] as String;
          locationDescription = 'near ${peakData['location'] as String}';
          peakColor = _getPeakCategoryColor(peakCategory);
        } else {
          // Fallback to original personal exposure logic
          ExposureDataPoint? peakPoint;
          double tempPeakPm25 = 0.0;
          
          for (final point in data.dataPoints) {
            if (point.pm25Value != null && point.pm25Value! > tempPeakPm25) {
              tempPeakPm25 = point.pm25Value!;
              peakPoint = point;
            }
          }
          
          if (peakPoint == null) return const SizedBox.shrink();
          
          // Format time in 12-hour format  
          final hour = peakPoint.timestamp.hour;
          final minute = peakPoint.timestamp.minute;
          final period = hour >= 12 ? 'PM' : 'AM';
          final displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
          timeString = '$displayHour:${minute.toString().padLeft(2, '0')} $period';
          
          peakPm25 = tempPeakPm25;
          peakCategory = peakPoint.aqiCategory ?? 'Unknown';
          locationDescription = _getLocationDescription(peakPoint);
          peakColor = _getPeakCategoryColor(peakCategory);
        }
        
        // Match analytics card layout exactly
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Theme.of(context).highlightColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.black.withValues(alpha: 0.3)
                    : Colors.black.withValues(alpha: 0.1),
                blurRadius: 4,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Divider(
                thickness: .5,
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.dividerColordark
                    : AppColors.dividerColorlight),
              Padding(
                padding: const EdgeInsets.only(
                    left: 16, right: 16, bottom: 16, top: 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                            Row(
                              children: [
                                SvgPicture.asset(Theme.of(context).brightness ==
                                        Brightness.light
                                    ? "assets/images/shared/pm_rating_white.svg"
                                    : 'assets/images/shared/pm_rating.svg'),
                                const SizedBox(width: 2),
                                Text(
                                  " PM2.5",
                                  style: TextStyle(
                                    color: Theme.of(context)
                                        .textTheme
                                        .headlineSmall
                                        ?.color,
                                  ),
                                ),
                              ],
                            ),
                            Row(children: [
                              Text(
                                peakPm25.toStringAsFixed(1),
                                style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 36,
                                    color: Theme.of(context)
                                        .textTheme
                                        .headlineLarge
                                        ?.color),
                              ),
                              Text(" μg/m³",
                                  style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                      color: Theme.of(context)
                                          .textTheme
                                          .headlineLarge
                                          ?.color)),
                            ]),
                            Container(
                              margin: EdgeInsets.only(bottom: 12, top: 8),
                              padding: EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: peakColor.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                peakCategory,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: peakColor,
                                ),
                              ),
                            ),
                          ],
                          ),
                        ),
                        SizedBox(width: 8),
                        SvgPicture.asset(
                          _getAirQualityIconPath(peakCategory, peakPm25),
                          width: 86,
                          height: 86,
                        ),
                      ],
                    ),
                    SizedBox(height: 12),
                    Divider(
                      thickness: 0.5,
                      color: Theme.of(context).brightness == Brightness.dark
                          ? AppColors.dividerColordark
                          : AppColors.dividerColorlight,
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Peak occurred at $timeString $locationDescription',
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.color
              ?.withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPersonalExposurePeak(DailyExposureSummary data) {
    // Original personal exposure peak logic as fallback
    ExposureDataPoint? peakPoint;
    double peakPm25 = 0.0;
    
    for (final point in data.dataPoints) {
      if (point.pm25Value != null && point.pm25Value! > peakPm25) {
        peakPm25 = point.pm25Value!;
        peakPoint = point;
      }
    }
    
    if (peakPoint == null) return const SizedBox.shrink();
    
    // Format time in 12-hour format
    final hour = peakPoint.timestamp.hour;
    final minute = peakPoint.timestamp.minute;
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    final timeString = '$displayHour:${minute.toString().padLeft(2, '0')} $period';
    
    // Get AQI status for the peak value
    final peakCategory = peakPoint.aqiCategory ?? 'Unknown';
    final peakColor = _getPeakCategoryColor(peakCategory);
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(
                left: 16, right: 16, bottom: 16, top: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        SvgPicture.asset(Theme.of(context).brightness ==
                                Brightness.light
                            ? "assets/images/shared/pm_rating_white.svg"
                            : 'assets/images/shared/pm_rating.svg'),
                        const SizedBox(width: 2),
                        Text(
                          " PM2.5",
                          style: TextStyle(
                            color: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.color,
                          ),
                        ),
                      ],
                    ),
                    Row(children: [
                      Text(
                        peakPm25.toStringAsFixed(2),
                        style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 36,
                            color: Theme.of(context)
                                .textTheme
                                .headlineLarge
                                ?.color),
                      ),
                      Text(" μg/m³",
                          style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 18,
                              color: Theme.of(context)
                                  .textTheme
                                  .headlineLarge
                                  ?.color))
                    ]),
                  ],
                ),
                SizedBox(
                  child: Center(
                    child: SvgPicture.asset(
                      _getAirQualityIconPath(peakCategory, peakPm25),
                      height: 86,
                      width: 86,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 4),
            child: Wrap(children: [
              Container(
                margin: EdgeInsets.only(bottom: 12),
                padding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: peakColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  peakCategory,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: peakColor,
                  ),
                  maxLines: 1,
                ),
              ),
            ]),
          ),
          Divider(
              thickness: .5,
              color: Theme.of(context).brightness == Brightness.dark
                  ? Colors.black
                  : Colors.white),
          Padding(
            padding: const EdgeInsets.only(
                left: 16, right: 16, bottom: 16, top: 12),
            child: Text(
              'Peak occurred at $timeString ${_getLocationDescription(peakPoint)}',
              style: TextStyle(
                fontSize: 14,
                color: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.color
                    ?.withValues(alpha: 0.7),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  String _getAirQualityIconPath(String category, double value) {
    switch (category.toLowerCase()) {
      case 'good':
        return "assets/images/shared/airquality_indicators/good.svg";
      case 'moderate':
        return "assets/images/shared/airquality_indicators/moderate.svg";
      case 'unhealthy for sensitive groups':
        return "assets/images/shared/airquality_indicators/unhealthy-sensitive.svg";
      case 'unhealthy':
        return "assets/images/shared/airquality_indicators/unhealthy.svg";
      case 'very unhealthy':
        return "assets/images/shared/airquality_indicators/very-unhealthy.svg";
      case 'hazardous':
        return "assets/images/shared/airquality_indicators/hazardous.svg";
      default:
        return "assets/images/shared/airquality_indicators/unavailable.svg";
    }
  }

  String _getCurrentHourAirQualityIcon(DailyExposureSummary? exposureData) {
    if (exposureData == null) {
      return "assets/images/shared/airquality_indicators/unavailable.svg";
    }
    
    final currentHour = DateTime.now().hour;
    
    // Find exposure data for current hour
    for (final point in exposureData.dataPoints) {
      if (point.timestamp.hour == currentHour) {
        return _getAirQualityIconPath(
          point.aqiCategory ?? 'Unknown', 
          point.pm25Value ?? 0.0
        );
      }
    }
    
    // Default if no data for current hour
    return "assets/images/shared/airquality_indicators/moderate.svg";
  }

  Widget _buildCurrentTimePointer() {
    final currentHour = DateTime.now().hour;
    final currentMinute = DateTime.now().minute;
    
    // Calculate angle for current time (360° / 24 hours = 15° per hour)
    // Subtract π/2 to start from top (12 o'clock position) instead of right (3 o'clock)
    final anglePerHour = 2 * math.pi / 24;
    final currentAngle = ((currentHour + currentMinute / 60) * anglePerHour) - (math.pi / 2);
    
    // Position the pointer to point from inside toward the hour numbers
    final pointerDistance = 60.0; // Distance from center where pointer starts
    final x = pointerDistance * math.cos(currentAngle);
    final y = pointerDistance * math.sin(currentAngle);
    
    return Positioned(
      left: 110 + x - 6, // Center (110) + offset - half pointer width
      top: 110 + y - 6,  // Center (110) + offset - half pointer height
      child: Transform.rotate(
        angle: currentAngle + (math.pi / 2), // Adjust rotation to align with direction
        child: Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: AppColors.primaryColor,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 4,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Icon(
            Icons.circle,
            size: 8,
            color: Colors.white,
          ),
        ),
      ),
    );
  }


  Color _getPeakCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'good':
        return const Color(0xFF4CAF50); // Green
      case 'moderate':
        return const Color(0xFFFF9800); // Orange
      case 'unhealthy for sensitive groups':
        return const Color(0xFFFF5722); // Deep orange
      case 'unhealthy':
        return const Color(0xFFF44336); // Red
      case 'very unhealthy':
        return const Color(0xFF9C27B0); // Purple
      case 'hazardous':
        return const Color(0xFF795548); // Brown
      default:
        return const Color(0xFF757575); // Grey
    }
  }

  // This preserves the exact same default/permission state as before
  Widget _buildPermissionContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title (same as original)
        Text(
          'Monitor your pollution exposure',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
          textAlign: TextAlign.left,
        ),
        
        const SizedBox(height: 12),
        
        // Subtitle (same as original)
        Text(
          'Allow access to your location to start.',
          style: TextStyle(
            fontSize: 16,
            color: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.color
                ?.withValues(alpha: 0.7),
          ),
          textAlign: TextAlign.left,
        ),
        
        const SizedBox(height: 40),
        
        // 24-hour clock chart (same as original - inactive grey)
        Center(
          child: SizedBox(
            width: 200,
            height: 200,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Custom 24-hour clock painter (no data, same as original)
                SizedBox(
                  width: 220,
                  height: 220,
                  child: CustomPaint(
                    painter: ClockExposurePainter(showData: false),
                  ),
                ),
                
                // Inner circle background (same as original)
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.grey.withValues(alpha: 0.15),
                  ),
                  child: Icon(
                    Icons.person_outline,
                    size: 50,
                    color: Colors.grey.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 30),
        
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isRequestingPermission ? null : _requestLocationPermission,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 18),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            child: _isRequestingPermission
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      ),
                      SizedBox(width: 12),
                      Text(
                        'Requesting permission...',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  )
                : Text(
                    'Allow access to location',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Color _getRiskLevelColor(ExposureRiskLevel level) {
    switch (level) {
      case ExposureRiskLevel.minimal:
        return Colors.green;
      case ExposureRiskLevel.low:
        return Colors.blue;
      case ExposureRiskLevel.moderate:
        return Colors.orange;
      case ExposureRiskLevel.high:
        return Colors.red;
    }
  }

  Widget _buildGuidePopup() {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Theme.of(context).brightness == Brightness.dark
                ? Colors.black.withValues(alpha: 0.3)
                : Colors.black.withValues(alpha: 0.15),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with close button and border line
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.only(left: 4),
                      decoration: BoxDecoration(
                        border: Border(
                          left: BorderSide(
                            color: Theme.of(context).brightness == Brightness.dark
                                ? AppColors.dividerColordark
                                : Colors.grey.shade400,
                            width: 4,
                          ),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Concern levels',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context)
                                  .textTheme
                                  .headlineMedium
                                  ?.color,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'We use the different concentration levels of airquality that you experience at different times of the day to share your exposure per hour with a color from these concern level icons',
                            style: TextStyle(
                              fontSize: 10,
                              color: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.color
                    ?.withValues(alpha: 0.7),

                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Close button
                  GestureDetector(
                    onTap: () => setState(() => _showGuide = false),
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      child: Icon(
                        Icons.close,
                        size: 20,
                        color: Theme.of(context)
                            .textTheme
                            .bodyMedium
                            ?.color
                            ?.withValues(alpha: 0.6),
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Concern levels list
              _buildConcernLevelItem('Good', "assets/images/shared/airquality_indicators/good.svg", const Color(0xFF8FE6A4)),
              _buildConcernLevelItem('Moderate', "assets/images/shared/airquality_indicators/moderate.svg", const Color(0xFFFFEC89)),
              _buildConcernLevelItem('Unhealthy for Sensitive Groups', "assets/images/shared/airquality_indicators/unhealthy-sensitive.svg", const Color(0xFFFFC170)),
              _buildConcernLevelItem('Unhealthy', "assets/images/shared/airquality_indicators/unhealthy.svg", const Color(0xFFF0B1D8)),
              _buildConcernLevelItem('Very Unhealthy', "assets/images/shared/airquality_indicators/very-unhealthy.svg", const Color(0xFFDBB6F1)),
              _buildConcernLevelItem('Hazardous', "assets/images/shared/airquality_indicators/hazardous.svg", const Color(0xFFF7453C)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildConcernLevelItem(String label, String iconPath, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.color,
              ),
            ),
          ),
          SizedBox(
            width: 32,
            height: 32,
            child: Center(
              child: SvgPicture.asset(
                iconPath,
                width: 18,
                height: 18,
              ),
            ),
          ),
        ],
      ),
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
        // Permission granted successfully
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Location permission granted! You can now track your exposure.'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );
        
        // Initialize location service and start tracking
        await _locationService.initialize();
        await _locationService.startLocationTracking();
        
        setState(() {
          _hasLocationPermission = true;
        });
        
        // Load exposure data after starting location tracking
        await _loadExposureData();
      } else {
        // Handle different error states
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

        // Show error dialog
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
    // This would typically use a plugin like app_settings
    // For now, show instructions to user
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

  String _getDynamicTitle(DailyExposureSummary? data) {
    if (data == null) return 'No exposure data';
    
    switch (data.riskLevel) {
      case ExposureRiskLevel.minimal:
        return 'Minimal exposure day';
      case ExposureRiskLevel.low:
        return 'Low exposure day';
      case ExposureRiskLevel.moderate:
        return 'Moderate exposure day';
      case ExposureRiskLevel.high:
        return 'High exposure day';
    }
  }

  Future<Map<String, dynamic>?> _getPeakAirQualityReading() async {
    try {
      // Get air quality data from nearby sensors (same as Near You view)
      final dashboardRepository = DashboardImpl();
      final response = await dashboardRepository.fetchAirQualityReadings();
      
      if (response.measurements == null || response.measurements!.isEmpty) {
        return null;
      }
      
      // Get user's current location to filter nearby sensors only
      final locationService = EnhancedLocationServiceManager();
      final locationResult = await locationService.getCurrentPosition();
      
      if (!locationResult.isSuccess || locationResult.position == null) {
        loggy.warning('Could not get user location for peak exposure filtering');
        return null;
      }
      
      final userPosition = locationResult.position!;
      const double maxDistanceKm = 10.0; // Same radius as Near You view
      
      // Find sensors within distance and prioritize closer ones
      List<Map<String, dynamic>> nearbySensors = [];
      
      for (final measurement in response.measurements!) {
        // Skip if no PM2.5 data
        if (measurement.pm25?.value == null) continue;
        
        // Skip if no location data
        final siteDetails = measurement.siteDetails;
        if (siteDetails == null) continue;
        
        double? latitude = siteDetails.approximateLatitude ?? siteDetails.siteCategory?.latitude;
        double? longitude = siteDetails.approximateLongitude ?? siteDetails.siteCategory?.longitude;
        
        if (latitude == null || longitude == null) continue;
        
        // Calculate distance from user
        final distance = Geolocator.distanceBetween(
          userPosition.latitude,
          userPosition.longitude,
          latitude,
          longitude,
        ) / 1000; // Convert to km
        
        // Only consider nearby sensors (within 10km)
        if (distance <= maxDistanceKm) {
          nearbySensors.add({
            'measurement': measurement,
            'distance': distance,
            'pm25': measurement.pm25!.value!,
          });
        }
      }
      
      if (nearbySensors.isEmpty) return null;
      
      // Sort by distance first, then find peak among closest sensors
      nearbySensors.sort((a, b) => (a['distance'] as double).compareTo(b['distance'] as double));
      
      // Strategy: Use closest sensor, or if multiple sensors are very close, pick the one with highest reading
      Measurement? peakMeasurement;
      double peakPm25 = 0.0;
      
      // Define "very close" as within 3km
      const double veryCloseDistanceKm = 3.0;
      final closestDistance = nearbySensors.first['distance'] as double;
      
      if (closestDistance <= veryCloseDistanceKm) {
        // If closest sensor is very close, check if others are also very close
        final veryCloseSensors = nearbySensors
            .where((sensor) => (sensor['distance'] as double) <= veryCloseDistanceKm)
            .toList();
        
        if (veryCloseSensors.length > 1) {
          // Multiple very close sensors - pick the one with highest reading
          veryCloseSensors.sort((a, b) => (b['pm25'] as double).compareTo(a['pm25'] as double));
          peakMeasurement = veryCloseSensors.first['measurement'] as Measurement;
          peakPm25 = veryCloseSensors.first['pm25'] as double;
        } else {
          // Only one very close sensor - use it regardless of reading
          peakMeasurement = veryCloseSensors.first['measurement'] as Measurement;
          peakPm25 = veryCloseSensors.first['pm25'] as double;
        }
      } else {
        // No very close sensors - use the closest one available
        peakMeasurement = nearbySensors.first['measurement'] as Measurement;
        peakPm25 = nearbySensors.first['pm25'] as double;
      }
      
      // Get location name from site details
      String locationName = 'unknown location';
      
      if (peakMeasurement.siteDetails != null) {
        locationName = peakMeasurement.siteDetails!.searchName ??
                     peakMeasurement.siteDetails!.locationName ??
                     peakMeasurement.siteDetails!.name ??
                     'unknown location';
      }
      
      // Format time from measurement timestamp
      String timeString = 'Unknown time';
      if (peakMeasurement.time != null) {
        final measurementTime = DateTime.tryParse(peakMeasurement.time!);
        if (measurementTime != null) {
          final hour = measurementTime.hour;
          final minute = measurementTime.minute;
          final period = hour >= 12 ? 'PM' : 'AM';
          final displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
          timeString = '$displayHour:${minute.toString().padLeft(2, '0')} $period';
        }
      }
      
      // Clean location name without distance information
      String contextualLocation = locationName;
      
      return {
        'pm25': peakPm25,
        'timeString': timeString,
        'category': peakMeasurement.aqiCategory ?? 'Unknown',
        'location': contextualLocation,
      };
    } catch (e) {
      loggy.error('Error getting peak air quality reading: $e');
      return null;
    }
  }

  String _getLocationDescription(ExposureDataPoint? point) {
    if (point == null) return 'at unknown location';
    
    // Use the actual site name if available
    if (point.siteName != null && point.siteName!.isNotEmpty) {
      return 'near ${point.siteName}';
    }
    
    // Fallback to general area description
    return 'in your area';
  }

  String _getDynamicDescription(DailyExposureSummary? data) {
    if (data == null) return 'Unable to load exposure data. Please check your location settings.';
    
    final timeFrame = _selectedTabIndex == 0 ? 'past 24 hours' : 'this week';
    final outdoorHours = data.totalOutdoorTime.inHours;
    final outdoorMinutes = data.totalOutdoorTime.inMinutes % 60;
    final timeSpent = outdoorHours > 0 
        ? '${outdoorHours}h ${outdoorMinutes}m' 
        : '${outdoorMinutes}m';
    
    switch (data.riskLevel) {
      case ExposureRiskLevel.minimal:
        return 'In the $timeFrame, you\'ve had minimal pollution exposure with no health impact. You spent $timeSpent in tracked areas.';
      case ExposureRiskLevel.low:
        return 'In the $timeFrame, you\'ve had low pollution exposure with minimal health impact. You spent $timeSpent in tracked areas.';
      case ExposureRiskLevel.moderate:
        return 'In the $timeFrame, you\'ve experienced moderate pollution exposure. Consider limiting outdoor activities. You spent $timeSpent in tracked areas.';
      case ExposureRiskLevel.high:
        return 'In the $timeFrame, you\'ve had high pollution exposure. Consider avoiding unnecessary outdoor activities. You spent $timeSpent in tracked areas.';
    }
  }

  Widget _buildTabButton({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryColor
              : Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkHighlight
                  : AppColors.dividerColorlight,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : Colors.black87,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}