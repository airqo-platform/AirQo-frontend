import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/services/exposure_calculator.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_analytics_card.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_timeline_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/profile/pages/location_privacy_screen.dart';

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
  
  DailyExposureSummary? _todayExposure;
  WeeklyExposureTrend? _weeklyTrend;
  List<DailyExposureSummary> _recentSummaries = [];
  bool _isLoading = true;
  String? _errorMessage;

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

      setState(() {
        _todayExposure = futures[0] as DailyExposureSummary?;
        _weeklyTrend = futures[1] as WeeklyExposureTrend?;
        _recentSummaries = futures[2] as List<DailyExposureSummary>;
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

        // Today's exposure
        if (_todayExposure != null)
          ExposureAnalyticsCard(
            exposureSummary: _todayExposure!,
            showDetailedView: true, // Show as detailed since it's the main view
          )
        else
          _buildNoDataCard(theme, 'Today\'s Exposure'),

        // Weekly trend
        if (_weeklyTrend != null)
          WeeklyExposureTrendCard(weeklyTrend: _weeklyTrend!)
        else
          _buildNoDataCard(theme, 'Weekly Trend'),

        // Timeline
        if (_recentSummaries.isNotEmpty)
          ExposureTimelineWidget(
            dailySummaries: _recentSummaries,
            daysToShow: 7,
          )
        else
          _buildNoDataCard(theme, 'Timeline'),

        // Insights and tips
        _buildInsightsSection(theme),

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
                  Icons.location_off,
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
                  'Enable location tracking to see your exposure analysis. You can control data sharing in privacy settings.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: _openPrivacySettings,
                  child: const Text('Privacy Settings'),
                ),
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

  void _openPrivacySettings() {
       Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => LocationPrivacyScreen()),
    );
  }
}