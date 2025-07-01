import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class ExposureTimelineWidget extends StatelessWidget {
  final List<DailyExposureSummary> dailySummaries;
  final int daysToShow;

  const ExposureTimelineWidget({
    super.key,
    required this.dailySummaries,
    this.daysToShow = 7,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final recentSummaries = dailySummaries.take(daysToShow).toList();

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
                      Icons.timeline,
                      color: AppColors.primaryColor,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Exposure Timeline',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      'Last $daysToShow days',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Timeline visualization
                if (recentSummaries.isNotEmpty)
                  _buildTimelineChart(recentSummaries, theme)
                else
                  _buildEmptyState(theme),

                const SizedBox(height: 16),

                // Legend
                _buildLegend(theme),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTimelineChart(List<DailyExposureSummary> summaries, ThemeData theme) {
    // Calculate max exposure score for scaling
    final maxScore = summaries
        .map((s) => s.totalExposureScore)
        .fold(0.0, (max, score) => score > max ? score : max);
    
    // Ensure minimum scale
    final chartMaxScore = maxScore > 0 ? maxScore : 10.0;

    return Column(
      children: [
        // Chart area
        SizedBox(
          height: 120,
          width: double.infinity,
          child: Row(
            children: summaries.asMap().entries.map((entry) {
              final summary = entry.value;
              final barHeight = chartMaxScore > 0 
                  ? (summary.totalExposureScore / chartMaxScore * 100).clamp(2.0, 100.0)
                  : 2.0;

              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      // Exposure score value (top)
                      Text(
                        summary.totalExposureScore > 0
                            ? summary.totalExposureScore.toStringAsFixed(1)
                            : '-',
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),

                      // Bar
                      Expanded(
                        child: Container(
                          width: 24,
                          alignment: Alignment.bottomCenter,
                          child: Container(
                            width: 20,
                            height: barHeight,
                            decoration: BoxDecoration(
                              color: _getRiskColor(summary.riskLevel),
                              borderRadius: BorderRadius.circular(4),
                              gradient: LinearGradient(
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                                colors: [
                                  _getRiskColor(summary.riskLevel),
                                  _getRiskColor(summary.riskLevel).withOpacity(0.7),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Day label
                      Text(
                        _getDayLabel(summary.date),
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontSize: 10,
                        ),
                      ),

                      const SizedBox(height: 4),

                      // Outdoor time indicator
                      Container(
                        width: 16,
                        height: 3,
                        decoration: BoxDecoration(
                          color: summary.totalOutdoorTime.inMinutes > 0
                              ? AppColors.primaryColor.withOpacity(0.6)
                              : theme.dividerColor.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(1.5),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildLegend(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Legend',
          style: theme.textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        
        Wrap(
          spacing: 16,
          runSpacing: 8,
          children: [
            _buildLegendItem(
              'Minimal',
              Colors.green,
              theme,
            ),
            _buildLegendItem(
              'Low',
              Colors.blue,
              theme,
            ),
            _buildLegendItem(
              'Moderate',
              Colors.orange,
              theme,
            ),
            _buildLegendItem(
              'High',
              Colors.red,
              theme,
            ),
          ],
        ),

        const SizedBox(height: 8),

        Row(
          children: [
            Container(
              width: 16,
              height: 3,
              decoration: BoxDecoration(
                color: AppColors.primaryColor.withOpacity(0.6),
                borderRadius: BorderRadius.circular(1.5),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Outdoor time recorded',
              style: theme.textTheme.bodySmall?.copyWith(
                fontSize: 11,
                color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLegendItem(String label, Color color, ThemeData theme) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            fontSize: 11,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return SizedBox(
      height: 120,
      width: double.infinity,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.timeline,
              size: 32,
              color: theme.textTheme.bodySmall?.color?.withOpacity(0.3),
            ),
            const SizedBox(height: 8),
            Text(
              'No exposure data available',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
              ),
            ),
            Text(
              'Enable location tracking to see your exposure timeline',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.textTheme.bodySmall?.color?.withOpacity(0.5),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
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

  String _getDayLabel(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final checkDate = DateTime(date.year, date.month, date.day);
    
    final difference = today.difference(checkDate).inDays;
    
    if (difference == 0) return 'Today';
    if (difference == 1) return 'Yesterday';
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayNames[date.weekday - 1];
  }
}

/// A simplified exposure trend widget for dashboard overview
class ExposureTrendOverview extends StatelessWidget {
  final List<DailyExposureSummary> recentSummaries;
  final VoidCallback? onTap;

  const ExposureTrendOverview({
    super.key,
    required this.recentSummaries,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final last7Days = recentSummaries.take(7).toList();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Material(
        color: theme.highlightColor,
        borderRadius: BorderRadius.circular(12),
        elevation: 0,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
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
                        Icons.insights,
                        color: AppColors.primaryColor,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '7-Day Exposure Trend',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      if (onTap != null)
                        Icon(
                          Icons.arrow_forward_ios,
                          size: 14,
                          color: AppColors.primaryColor,
                        ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Mini chart
                  SizedBox(
                    height: 40,
                    child: Row(
                      children: last7Days.asMap().entries.map((entry) {
                        final summary = entry.value;
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 1),
                            child: Container(
                              height: 30,
                              decoration: BoxDecoration(
                                color: _getRiskColor(summary.riskLevel).withOpacity(0.7),
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Summary stats
                  if (last7Days.isNotEmpty) ...[
                    Row(
                      children: [
                        Text(
                          'Avg: ${_calculateAverageExposure(last7Days).toStringAsFixed(1)}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${_getHighRiskDays(last7Days)} high risk days',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    Text(
                      'No data available',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                      ),
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

  double _calculateAverageExposure(List<DailyExposureSummary> summaries) {
    if (summaries.isEmpty) return 0.0;
    
    final total = summaries.fold(0.0, (sum, summary) => sum + summary.totalExposureScore);
    return total / summaries.length;
  }

  int _getHighRiskDays(List<DailyExposureSummary> summaries) {
    return summaries.where((s) => 
        s.riskLevel == ExposureRiskLevel.high || 
        s.riskLevel == ExposureRiskLevel.moderate
    ).length;
  }
}