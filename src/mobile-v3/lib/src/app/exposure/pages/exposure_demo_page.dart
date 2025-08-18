import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/services/mock_exposure_data.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_analytics_card.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_map_widget.dart';
import 'package:airqo/src/app/exposure/widgets/activity_analysis_widget.dart';
import 'package:airqo/src/app/exposure/widgets/daily_comparison_widget.dart';
import 'package:airqo/src/app/exposure/pages/exposure_dashboard_view.dart';
import 'package:airqo/src/meta/utils/colors.dart';

/// Demo page to showcase all new exposure awareness features
class ExposureDemoPage extends StatefulWidget {
  const ExposureDemoPage({super.key});

  @override
  State<ExposureDemoPage> createState() => _ExposureDemoPageState();
}

class _ExposureDemoPageState extends State<ExposureDemoPage> {
  int _selectedTabIndex = 0;
  late DailyExposureSummary _todayExposure;
  late List<DailyExposureSummary> _weeklyData;
  late ActivityAnalysis _activityAnalysis;

  @override
  void initState() {
    super.initState();
    _loadMockData();
  }

  void _loadMockData() {
    _todayExposure = MockExposureData.generateTodayExposure();
    _weeklyData = MockExposureData.generateWeeklyData();
    _activityAnalysis = MockExposureData.generateTodayActivityAnalysis();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Exposure Awareness Demo'),
        backgroundColor: AppColors.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() {
                _loadMockData();
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildTabSelector(),
          Expanded(
            child: SingleChildScrollView(
              child: _buildTabContent(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabSelector() {
    final tabs = ['Dashboard', 'Overview', 'Map View', 'Activities', 'Compare'];
    
    return Container(
      margin: const EdgeInsets.all(16),
      child: Row(
        children: tabs.asMap().entries.map((entry) {
          final index = entry.key;
          final tab = entry.value;
          final isSelected = _selectedTabIndex == index;
          
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedTabIndex = index),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                margin: const EdgeInsets.symmetric(horizontal: 2),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primaryColor : Colors.grey[200],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  tab,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isSelected ? Colors.white : Colors.grey[700],
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 12, // Smaller font to fit 5 tabs
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildTabContent() {
    switch (_selectedTabIndex) {
      case 0:
        return _buildDashboardTab();
      case 1:
        return _buildOverviewTab();
      case 2:
        return _buildMapTab();
      case 3:
        return _buildActivitiesTab();
      case 4:
        return _buildCompareTab();
      default:
        return _buildDashboardTab();
    }
  }

  Widget _buildDashboardTab() {
    return Column(
      children: [
        // Info banner
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.green[50],
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.green[200]!),
          ),
          child: Row(
            children: [
              Icon(Icons.dashboard, color: Colors.green[600]),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'New Figma Dashboard UI - Features circular 24-hour chart and exposure peak display.',
                  style: TextStyle(color: Colors.green[800]),
                ),
              ),
            ],
          ),
        ),
        
        // Create a minimal dashboard view widget to show our UI
        _ExposureDashboardDemo(
          todayExposure: _todayExposure,
          weeklyData: _weeklyData,
        ),
        
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildOverviewTab() {
    return Column(
      children: [
        // Info banner
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.blue[200]!),
          ),
          child: Row(
            children: [
              Icon(Icons.info, color: Colors.blue[600]),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'This demo shows how Story #4 (Exposure Awareness) looks with realistic data. Tap refresh to generate new data.',
                  style: TextStyle(color: Colors.blue[800]),
                ),
              ),
            ],
          ),
        ),
        
        // Today's exposure card
        ExposureAnalyticsCard(
          exposureSummary: _todayExposure,
          showDetailedView: true,
        ),
        
        // Stats summary
        _buildStatsOverview(),
        
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildMapTab() {
    return Column(
      children: [
        // Map widget
        ExposureMapWidget(
          exposureSummary: _todayExposure,
          showFullscreen: false,
        ),
        
        const SizedBox(height: 16),
        
        // Map insights
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.primaryColor.withOpacity(0.3),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.map, color: AppColors.primaryColor),
                  const SizedBox(width: 8),
                  Text(
                    'Today\'s Movement Summary',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                '📍 ${_todayExposure.dataPoints.length} locations visited\n'
                '🚶 ${_todayExposure.totalOutdoorTime.inHours}h ${_todayExposure.totalOutdoorTime.inMinutes % 60}m outdoors\n'
                '💨 Average PM2.5: ${_todayExposure.averagePm25.toStringAsFixed(1)} μg/m³\n'
                '⚠️ Peak PM2.5: ${_todayExposure.maxPm25.toStringAsFixed(1)} μg/m³',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildActivitiesTab() {
    return Column(
      children: [
        ActivityAnalysisWidget(
          analysis: _activityAnalysis,
          showDetailedView: true,
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildCompareTab() {
    return Column(
      children: [
        DailyComparisonWidget(
          dailySummaries: _weeklyData,
          selectedDay: _todayExposure,
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildStatsOverview() {
    final highExposurePoints = _todayExposure.dataPoints
        .where((point) => point.exposureScore > 5)
        .length;
    
    final avgSpeed = _activityAnalysis.segments
        .map((s) => s.averageSpeed)
        .fold(0.0, (a, b) => a + b) / _activityAnalysis.segments.length;
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Material(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        elevation: 0,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Today\'s Overview',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatItem(
                        'Exposure Score',
                        _todayExposure.totalExposureScore.toStringAsFixed(1),
                        Icons.analytics,
                        _getRiskColor(_todayExposure.riskLevel),
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        'Activities',
                        '${_activityAnalysis.segments.length}',
                        Icons.directions_run,
                        Colors.blue,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatItem(
                        'High Pollution',
                        '$highExposurePoints spots',
                        Icons.warning,
                        Colors.orange,
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        'Avg Speed',
                        '${avgSpeed.toStringAsFixed(1)} km/h',
                        Icons.speed,
                        Colors.purple,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Color _getRiskColor(ExposureRiskLevel riskLevel) {
    switch (riskLevel) {
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
}

/// Demo widget that simulates the exposure dashboard UI with mock data
class _ExposureDashboardDemo extends StatefulWidget {
  final DailyExposureSummary todayExposure;
  final List<DailyExposureSummary> weeklyData;

  const _ExposureDashboardDemo({
    required this.todayExposure,
    required this.weeklyData,
  });

  @override
  State<_ExposureDashboardDemo> createState() => _ExposureDashboardDemoState();
}

class _ExposureDashboardDemoState extends State<_ExposureDashboardDemo> {
  int _selectedTabIndex = 0; // 0 for Today, 1 for This week

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
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

          // Title
          Text(
            _selectedTabIndex == 0 ? 'Today\'s exposure summary' : 'This week\'s exposure',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),

          const SizedBox(height: 12),

          // Subtitle
          Text(
            _selectedTabIndex == 0 
                ? 'Track your air pollution exposure throughout the day'
                : 'Weekly trends and patterns in your exposure',
            style: TextStyle(
              fontSize: 16,
              color: const Color.fromARGB(137, 10, 6, 6),
            ),
          ),

          const SizedBox(height: 32),

          // Use a simplified version of our dashboard content
          _buildExposureContent(),

          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildExposureContent() {
    final currentData = _selectedTabIndex == 0 ? widget.todayExposure : 
        (widget.weeklyData.isNotEmpty ? widget.weeklyData.last : null);
    
    if (currentData == null) return const SizedBox.shrink();
    
    return Container(
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
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Show a text representation instead of the actual chart for demo
          Container(
            width: 220,
            height: 220,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.grey.withValues(alpha: 0.3), width: 2),
              color: Colors.grey.withValues(alpha: 0.05),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Demo circular segments
                CustomPaint(
                  size: const Size(220, 220),
                  painter: _DemoClockPainter(exposureData: currentData),
                ),
                
                // Inner circle with user icon
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFFFFA6A1).withValues(alpha: 0.3),
                  ),
                  child: Center(
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFFFFA6A1),
                      ),
                      child: Icon(
                        Icons.person,
                        size: 40,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                
                // Guide button
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF6F87A1),
                    ),
                    child: Icon(
                      Icons.info_outline,
                      size: 18,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Summary statistics
          _buildSummaryStats(currentData),
          
          const SizedBox(height: 24),
          
          // Exposure peak
          _buildExposurePeak(currentData),
        ],
      ),
    );
  }

  Widget _buildSummaryStats(DailyExposureSummary data) {
    // Calculate low exposure hours
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
          'Total outdoor',
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
            color: Colors.grey.shade600,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildExposurePeak(DailyExposureSummary data) {
    // Find peak PM2.5 value and its time
    ExposureDataPoint? peakPoint;
    double peakPm25 = 0.0;
    
    for (final point in data.dataPoints) {
      if (point.pm25Value != null && point.pm25Value! > peakPm25) {
        peakPm25 = point.pm25Value!;
        peakPoint = point;
      }
    }
    
    if (peakPoint == null) return const SizedBox.shrink();
    
    // Format time
    final hour = peakPoint.timestamp.hour;
    final minute = peakPoint.timestamp.minute;
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    final timeString = '$displayHour:${minute.toString().padLeft(2, '0')} $period';
    
    final peakCategory = peakPoint.aqiCategory ?? 'Unknown';
    final peakColor = _getPeakCategoryColor(peakCategory);
    
    return Container(
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
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Today\'s exposure peak',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          
          const SizedBox(height: 16),
          
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Time display with PM2.5 label
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        timeString.split(' ')[0], // Time part
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      Text(
                        ' ${timeString.split(' ')[1]}2.5', // Period + "2.5"
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.black54,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Peak time',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(width: 32),
              
              // PM2.5 value
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    peakPm25.toStringAsFixed(1),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: peakColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'PM2.5 µg/m³',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              
              const Spacer(),
              
              // Status badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: peakColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: peakColor.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
                child: Text(
                  peakCategory,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: peakColor,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
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
              : AppColors.dividerColorlight,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black87,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
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

  Color _getPeakCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'good':
        return const Color(0xFF4CAF50);
      case 'moderate':
        return const Color(0xFFFF9800);
      case 'unhealthy for sensitive groups':
        return const Color(0xFFFF5722);
      case 'unhealthy':
        return const Color(0xFFF44336);
      case 'very unhealthy':
        return const Color(0xFF9C27B0);
      case 'hazardous':
        return const Color(0xFF795548);
      default:
        return const Color(0xFF757575);
    }
  }
}

/// Demo painter to show simplified circular chart
class _DemoClockPainter extends CustomPainter {
  final DailyExposureSummary exposureData;

  _DemoClockPainter({required this.exposureData});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final strokeWidth = 12.0;
    
    // Calculate angle per hour
    final anglePerHour = 2 * math.pi / 24;
    final segmentGap = 0.02;
    
    // Group exposure data by hour if available
    Map<int, String> hourlyAqiCategory = {};
    
    // Process exposure data points and group by hour
    for (final point in exposureData.dataPoints) {
      final hour = point.timestamp.hour;
      hourlyAqiCategory[hour] = point.aqiCategory ?? 'Unknown';
    }
    
    // Draw 24 hour segments
    for (int hour = 0; hour < 24; hour++) {
      final startAngle = (hour * anglePerHour) - (math.pi / 2) + segmentGap;
      final sweepAngle = anglePerHour - (2 * segmentGap);
      
      Paint paint;
      
      if (hourlyAqiCategory.containsKey(hour)) {
        final category = hourlyAqiCategory[hour]!;
        paint = Paint()
          ..color = _getExposureColor(category)
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.round;
      } else {
        paint = Paint()
          ..color = Colors.grey.withValues(alpha: 0.2)
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.round;
      }
      
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius - strokeWidth / 2),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
    }
  }
  
  Color _getExposureColor(String aqiCategory) {
    switch (aqiCategory.toLowerCase()) {
      case 'good':
        return const Color(0xFF8FE6A4);
      case 'moderate':
        return const Color(0xFFFFEC89);
      case 'unhealthy for sensitive groups':
        return const Color(0xFFFFC170);
      case 'unhealthy':
        return const Color(0xFFF0B1D8);
      case 'very unhealthy':
        return const Color(0xFFDBB6F1);
      case 'hazardous':
        return const Color(0xFFF7453C);
      default:
        return const Color(0xFF8FE6A4);
    }
  }

  @override
  bool shouldRepaint(_DemoClockPainter oldDelegate) {
    return oldDelegate.exposureData != exposureData;
  }
}