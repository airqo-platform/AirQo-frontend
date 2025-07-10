import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/services/exposure_calculator.dart';
import 'package:airqo/src/app/exposure/services/activity_recognition_service.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_analytics_card.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_timeline_widget.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_map_widget.dart';
import 'package:airqo/src/app/exposure/widgets/activity_analysis_widget.dart';
import 'package:airqo/src/app/exposure/widgets/daily_comparison_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/profile/pages/location_privacy_screen.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';

/// Exposure dashboard view for embedding in the main dashboard
/// This version doesn't have its own app bar since it's a dashboard view
class ExposureDashboardView extends StatefulWidget {
  const ExposureDashboardView({super.key});

  @override
  State<ExposureDashboardView> createState() => _ExposureDashboardViewState();
}

class _ExposureDashboardViewState extends State<ExposureDashboardView>
    with AutomaticKeepAliveClientMixin {
  final ExposureCalculator _exposureCalculator = ExposureCalculator();
  final ActivityRecognitionService _activityService = ActivityRecognitionService();
  final EnhancedLocationServiceManager _locationManager = EnhancedLocationServiceManager();
  
  DailyExposureSummary? _todayExposure;
  WeeklyExposureTrend? _weeklyTrend;
  List<DailyExposureSummary> _recentSummaries = [];
  ActivityAnalysis? _todayActivityAnalysis;
  bool _isLoading = true;
  String? _errorMessage;
  int _selectedTabIndex = 0;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _loadExposureData();
  }

  Future<void> _loadExposureData() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      // Load data in parallel
      final futures = await Future.wait([
        _exposureCalculator.getTodayExposure(),
        _exposureCalculator.getCurrentWeekTrend(),
        _exposureCalculator.calculateDailySummaries(
          startDate: DateTime.now().subtract(const Duration(days: 14)),
          endDate: DateTime.now().add(const Duration(days: 1)),
        ),
      ]);

      final todayExposure = futures[0] as DailyExposureSummary?;
      final weeklyTrend = futures[1] as WeeklyExposureTrend?;
      final recentSummaries = futures[2] as List<DailyExposureSummary>;

      // Analyze today's activities if we have data
      ActivityAnalysis? activityAnalysis;
      if (todayExposure != null && todayExposure.dataPoints.isNotEmpty) {
        activityAnalysis = await _activityService.analyzeDay(
          DateTime.now(),
          todayExposure.dataPoints,
        );
      }

      setState(() {
        _todayExposure = todayExposure;
        _weeklyTrend = weeklyTrend;
        _recentSummaries = recentSummaries;
        _todayActivityAnalysis = activityAnalysis;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load exposure data: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final theme = Theme.of(context);

    return RefreshIndicator(
      onRefresh: _loadExposureData,
      child: _buildBody(theme),
    );
  }

  Widget _buildBody(ThemeData theme) {
    if (_isLoading) {
      return _buildLoadingState();
    }

    if (_errorMessage != null) {
      return _buildErrorState(theme);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Info header
        _buildInfoHeader(theme),

        // Tab selector
        _buildTabSelector(),

        // Tab content
        _buildTabContent(),

        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildInfoHeader(ThemeData theme) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.primaryColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.info_outline,
            color: AppColors.primaryColor,
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Personal Air Quality Exposure',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Track how air quality affects your daily activities. All data is processed locally following your privacy settings.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.primaryColor.withOpacity(0.8),
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoDataCard(ThemeData theme, String title) {
    final isTrackingEnabled = _locationManager.isTrackingActive;
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Material(
        color: theme.highlightColor,
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
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Icon(
                  isTrackingEnabled ? Icons.hourglass_empty : Icons.location_off,
                  size: 48,
                  color: theme.textTheme.bodySmall?.color?.withOpacity(0.3),
                ),
                const SizedBox(height: 12),
                Text(
                  'No $title Data',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  isTrackingEnabled
                      ? 'Your exposure data is being collected. Check back later to see your analysis.'
                      : 'Enable location tracking to see your exposure analysis. You can control data sharing in privacy settings.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
                if (!isTrackingEnabled) ...[
                  const SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: _openPrivacySettings,
                    child: const Text('Privacy Settings'),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInsightsSection(ThemeData theme) {
    final insights = _generateInsights();
    
    if (insights.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Material(
        color: theme.highlightColor,
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
                Row(
                  children: [
                    Icon(
                      Icons.insights,
                      color: AppColors.primaryColor,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Insights & Tips',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                ...insights.map((insight) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.lightbulb_outline,
                          size: 20,
                          color: AppColors.primaryColor,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            insight,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
        ),
      ),
    );
  }

  Widget _buildErrorState(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'Something went wrong',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage!,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadExposureData,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  List<String> _generateInsights() {
    final insights = <String>[];

    if (_todayExposure != null) {
      final today = _todayExposure!;
      
      if (today.totalOutdoorTime.inHours > 6) {
        insights.add('You spent ${today.totalOutdoorTime.inHours}+ hours outdoors today. Consider checking air quality before long outdoor activities.');
      }

      if (today.riskLevel == ExposureRiskLevel.high) {
        insights.add('High exposure detected today. Consider using air quality alerts for better planning.');
      }

      if (today.averagePm25 > 50) {
        insights.add('PM2.5 levels were elevated today. Indoor air purifiers can help reduce exposure at home.');
      }
    }

    if (_weeklyTrend != null) {
      final trend = _weeklyTrend!;
      
      if (trend.overallRiskLevel == ExposureRiskLevel.high) {
        insights.add('Your weekly exposure shows a concerning trend. Consider reducing outdoor activities during high pollution periods.');
      }

      if (trend.recommendations.isNotEmpty) {
        insights.addAll(trend.recommendations.take(2));
      }
    }

    // General tips if no specific insights
    if (insights.isEmpty) {
      insights.add('Check air quality forecasts to plan outdoor activities during cleaner air periods.');
      insights.add('Morning and evening hours often have different air quality patterns in your area.');
    }

    return insights;
  }

  Widget _buildTabSelector() {
    final tabs = ['Overview', 'Map', 'Activities', 'Compare'];
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primaryColor : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  tab,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isSelected ? Colors.white : Colors.grey[600],
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
        // Today's exposure
        if (_todayExposure != null)
          ExposureAnalyticsCard(
            exposureSummary: _todayExposure!,
            showDetailedView: true,
          )
        else
          _buildNoDataCard(Theme.of(context), 'Today\'s Exposure'),

        // Weekly trend
        if (_weeklyTrend != null)
          WeeklyExposureTrendCard(weeklyTrend: _weeklyTrend!)
        else
          _buildNoDataCard(Theme.of(context), 'Weekly Trend'),

        // Timeline
        if (_recentSummaries.isNotEmpty)
          ExposureTimelineWidget(
            dailySummaries: _recentSummaries,
            daysToShow: 7,
          )
        else
          _buildNoDataCard(Theme.of(context), 'Timeline'),

        // Insights and tips
        _buildInsightsSection(Theme.of(context)),
      ],
    );
  }

  Widget _buildMapTab() {
    if (_todayExposure == null || _todayExposure!.dataPoints.isEmpty) {
      return _buildNoDataCard(Theme.of(context), 'Movement Map');
    }

    return Column(
      children: [
        ExposureMapWidget(
          exposureSummary: _todayExposure!,
          showFullscreen: false,
          onToggleFullscreen: () {
            // TODO: Implement fullscreen map
          },
        ),
        const SizedBox(height: 16),
        _buildMapInsights(),
      ],
    );
  }

  Widget _buildActivitiesTab() {
    if (_todayActivityAnalysis == null) {
      return _buildNoDataCard(Theme.of(context), 'Activity Analysis');
    }

    return ActivityAnalysisWidget(
      analysis: _todayActivityAnalysis!,
      showDetailedView: true,
    );
  }

  Widget _buildCompareTab() {
    if (_recentSummaries.isEmpty) {
      return _buildNoDataCard(Theme.of(context), 'Daily Comparison');
    }

    return DailyComparisonWidget(
      dailySummaries: _recentSummaries,
      selectedDay: _todayExposure,
    );
  }

  Widget _buildMapInsights() {
    if (_todayExposure == null) return const SizedBox.shrink();

    final highExposurePoints = _todayExposure!.dataPoints
        .where((point) => point.exposureScore > 5)
        .length;

    final totalPoints = _todayExposure!.dataPoints.length;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.primaryColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.insights,
                color: AppColors.primaryColor,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Map Insights',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'You visited $totalPoints locations today, with $highExposurePoints showing elevated pollution levels.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.primaryColor.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }

  void _openPrivacySettings() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => LocationPrivacyScreen()),
    );
  }
}