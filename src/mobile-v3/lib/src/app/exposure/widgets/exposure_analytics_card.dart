import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_details_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class ExposureAnalyticsCard extends StatelessWidget {
  final DailyExposureSummary exposureSummary;
  final bool showDetailedView;

  const ExposureAnalyticsCard({
    super.key,
    required this.exposureSummary,
    this.showDetailedView = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Material(
        color: theme.highlightColor,
        borderRadius: BorderRadius.circular(12),
        elevation: 0,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: showDetailedView ? null : () => _showExposureDetails(context),
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
                  // Header with risk level
                  Row(
                    children: [
                      _buildRiskIcon(),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Today\'s Exposure',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                              ),
                            ),
                            Text(
                              exposureSummary.riskLevel.description,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: _getRiskColor(),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      _buildExposureScore(),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Divider
                  Divider(
                    color: theme.dividerColor.withOpacity(0.5),
                    height: 1,
                  ),

                  const SizedBox(height: 16),

                  // Metrics row
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetric(
                          'Outdoor Time',
                          _formatDuration(exposureSummary.totalOutdoorTime),
                          Icons.schedule,
                          theme,
                        ),
                      ),
                      Container(
                        width: 1,
                        height: 40,
                        color: theme.dividerColor.withOpacity(0.3),
                      ),
                      Expanded(
                        child: _buildMetric(
                          'Avg PM2.5',
                          '${exposureSummary.averagePm25.toStringAsFixed(1)} μg/m³',
                          Icons.air,
                          theme,
                        ),
                      ),
                      Container(
                        width: 1,
                        height: 40,
                        color: theme.dividerColor.withOpacity(0.3),
                      ),
                      Expanded(
                        child: _buildMetric(
                          'Locations',
                          '${exposureSummary.dataPoints.length}',
                          Icons.location_on,
                          theme,
                        ),
                      ),
                    ],
                  ),

                  if (exposureSummary.timeByAqiCategory.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    _buildAqiCategoryBreakdown(theme),
                  ],

                  if (!showDetailedView) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Tap for detailed view',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.primaryColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(
                          Icons.arrow_forward_ios,
                          size: 12,
                          color: AppColors.primaryColor,
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRiskIcon() {
    IconData iconData;
    Color iconColor;

    switch (exposureSummary.riskLevel) {
      case ExposureRiskLevel.minimal:
        iconData = Icons.check_circle;
        iconColor = Colors.green;
        break;
      case ExposureRiskLevel.low:
        iconData = Icons.info;
        iconColor = Colors.blue;
        break;
      case ExposureRiskLevel.moderate:
        iconData = Icons.warning;
        iconColor = Colors.orange;
        break;
      case ExposureRiskLevel.high:
        iconData = Icons.error;
        iconColor = Colors.red;
        break;
    }

    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: iconColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(
        iconData,
        color: iconColor,
        size: 20,
      ),
    );
  }

  Widget _buildExposureScore() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _getRiskColor().withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _getRiskColor().withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        exposureSummary.totalExposureScore.toStringAsFixed(1),
        style: TextStyle(
          color: _getRiskColor(),
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value, IconData icon, ThemeData theme) {
    return Column(
      children: [
        Icon(
          icon,
          size: 16,
          color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
            color: theme.textTheme.titleSmall?.color,
          ),
          textAlign: TextAlign.center,
        ),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildAqiCategoryBreakdown(ThemeData theme) {
    final totalTime = exposureSummary.totalOutdoorTime.inMinutes;
    if (totalTime == 0) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Time by Air Quality',
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        ...exposureSummary.timeByAqiCategory.entries.map((entry) {
          final percentage = (entry.value.inMinutes / totalTime * 100).round();
          if (percentage < 1) return const SizedBox.shrink();

          return Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: _getAqiCategoryColor(entry.key),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    entry.key,
                    style: theme.textTheme.bodySmall,
                  ),
                ),
                Text(
                  '$percentage%',
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Color _getRiskColor() {
    switch (exposureSummary.riskLevel) {
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

  Color _getAqiCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'good':
        return Colors.green;
      case 'moderate':
        return Colors.yellow;
      case 'unhealthy for sensitive groups':
        return Colors.orange;
      case 'unhealthy':
        return Colors.red;
      case 'very unhealthy':
        return Colors.purple;
      case 'hazardous':
        return Colors.red.shade900;
      default:
        return Colors.grey;
    }
  }

  String _formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes % 60;

    if (hours > 0) {
      return '${hours}h ${minutes}m';
    } else {
      return '${minutes}m';
    }
  }

  void _showExposureDetails(BuildContext context) {
    showBottomSheet(
      backgroundColor: Colors.transparent,
      context: context,
      builder: (context) => ExposureDetailsWidget(
        exposureSummary: exposureSummary,
      ),
    );
  }
}

/// Weekly exposure trend card
class WeeklyExposureTrendCard extends StatelessWidget {
  final WeeklyExposureTrend weeklyTrend;

  const WeeklyExposureTrendCard({
    super.key,
    required this.weeklyTrend,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

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
                // Header
                Row(
                  children: [
                    Icon(
                      Icons.trending_up,
                      color: AppColors.primaryColor,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Weekly Trend',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getRiskColor(weeklyTrend.overallRiskLevel).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        weeklyTrend.overallRiskLevel.displayName,
                        style: TextStyle(
                          color: _getRiskColor(weeklyTrend.overallRiskLevel),
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Weekly stats
                Row(
                  children: [
                    Expanded(
                      child: _buildWeeklyMetric(
                        'Avg Daily Exposure',
                        weeklyTrend.averageDailyExposure.toStringAsFixed(1),
                        theme,
                      ),
                    ),
                    Expanded(
                      child: _buildWeeklyMetric(
                        'Avg Outdoor Time',
                        _formatDuration(weeklyTrend.averageDailyOutdoorTime),
                        theme,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Daily breakdown mini chart
                _buildDailyBreakdown(theme),

                if (weeklyTrend.recommendations.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _buildRecommendations(theme),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWeeklyMetric(String label, String value, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.primaryColor,
          ),
        ),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
          ),
        ),
      ],
    );
  }

  Widget _buildDailyBreakdown(ThemeData theme) {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Daily Breakdown',
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: List.generate(7, (index) {
            final summary = index < weeklyTrend.dailySummaries.length 
                ? weeklyTrend.dailySummaries[index] 
                : null;
            
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 2),
                child: Column(
                  children: [
                    Container(
                      height: 40,
                      decoration: BoxDecoration(
                        color: summary != null 
                            ? _getRiskColor(summary.riskLevel).withOpacity(0.7)
                            : theme.dividerColor.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Center(
                        child: Text(
                          summary?.totalExposureScore.toInt().toString() ?? '-',
                          style: TextStyle(
                            color: summary != null ? Colors.white : theme.textTheme.bodySmall?.color,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      dayLabels[index],
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildRecommendations(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recommendations',
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        ...weeklyTrend.recommendations.take(2).map((recommendation) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.lightbulb_outline,
                  size: 16,
                  color: AppColors.primaryColor,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    recommendation,
                    style: theme.textTheme.bodySmall?.copyWith(
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
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

  String _formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes % 60;

    if (hours > 0) {
      return '${hours}h ${minutes}m';
    } else {
      return '${minutes}m';
    }
  }
}