import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/services/mock_exposure_data.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_analytics_card.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_map_widget.dart';
import 'package:airqo/src/app/exposure/widgets/activity_analysis_widget.dart';
import 'package:airqo/src/app/exposure/widgets/daily_comparison_widget.dart';
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
    final tabs = ['Overview', 'Map View', 'Activities', 'Compare Days'];
    
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
        return _buildOverviewTab();
      case 1:
        return _buildMapTab();
      case 2:
        return _buildActivitiesTab();
      case 3:
        return _buildCompareTab();
      default:
        return _buildOverviewTab();
    }
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