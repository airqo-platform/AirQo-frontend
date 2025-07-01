import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/services/exposure_calculator.dart';
import 'package:airqo/src/app/exposure/pages/exposure_dashboard_page.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_timeline_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';

/// A card widget that shows exposure overview and links to full dashboard
/// This can be easily integrated into the existing dashboard
class ExposureDashboardCard extends StatefulWidget {
  const ExposureDashboardCard({super.key});

  @override
  State<ExposureDashboardCard> createState() => _ExposureDashboardCardState();
}

class _ExposureDashboardCardState extends State<ExposureDashboardCard> {
  final ExposureCalculator _exposureCalculator = ExposureCalculator();
  DailyExposureSummary? _todayExposure;
  List<DailyExposureSummary> _recentSummaries = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadExposureData();
  }

  Future<void> _loadExposureData() async {
    try {
      final results = await Future.wait([
        _exposureCalculator.getTodayExposure(),
        _exposureCalculator.calculateDailySummaries(
          startDate: DateTime.now().subtract(const Duration(days: 7)),
          endDate: DateTime.now().add(const Duration(days: 1)),
        ),
      ]);

      if (mounted) {
        setState(() {
          _todayExposure = results[0] as DailyExposureSummary?;
          _recentSummaries = results[1] as List<DailyExposureSummary>;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Material(
        color: theme.highlightColor,
        borderRadius: BorderRadius.circular(12),
        elevation: 0,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: _openFullDashboard,
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
                        Icons.analytics,
                        color: AppColors.primaryColor,
                        size: 24,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'My Air Exposure',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      Icon(
                        Icons.arrow_forward_ios,
                        size: 16,
                        color: AppColors.primaryColor,
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  if (_isLoading)
                    _buildLoadingContent(theme)
                  else if (_todayExposure != null)
                    _buildExposureContent(theme)
                  else
                    _buildNoDataContent(theme),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingContent(ThemeData theme) {
    return Column(
      children: [
        Row(
          children: [
            Container(
              width: 60,
              height: 12,
              decoration: BoxDecoration(
                color: theme.dividerColor.withOpacity(0.3),
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            const Spacer(),
            Container(
              width: 40,
              height: 12,
              decoration: BoxDecoration(
                color: theme.dividerColor.withOpacity(0.3),
                borderRadius: BorderRadius.circular(6),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          height: 30,
          decoration: BoxDecoration(
            color: theme.dividerColor.withOpacity(0.3),
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      ],
    );
  }

  Widget _buildExposureContent(ThemeData theme) {
    final exposure = _todayExposure!;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Today's stats
        Row(
          children: [
            Expanded(
              child: _buildStatItem(
                'Risk Level',
                exposure.riskLevel.displayName,
                _getRiskColor(exposure.riskLevel),
                theme,
              ),
            ),
            Expanded(
              child: _buildStatItem(
                'Outdoor Time',
                _formatDuration(exposure.totalOutdoorTime),
                AppColors.primaryColor,
                theme,
              ),
            ),
            Expanded(
              child: _buildStatItem(
                'Avg PM2.5',
                '${exposure.averagePm25.toStringAsFixed(1)}',
                _getPm25Color(exposure.averagePm25),
                theme,
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Mini trend
        ExposureTrendOverview(
          recentSummaries: _recentSummaries,
          onTap: _openFullDashboard,
        ),
      ],
    );
  }

  Widget _buildNoDataContent(ThemeData theme) {
    return Column(
      children: [
        Icon(
          Icons.location_off,
          size: 32,
          color: theme.textTheme.bodySmall?.color?.withOpacity(0.3),
        ),
        const SizedBox(height: 8),
        Text(
          'Enable location tracking to see your air quality exposure analysis',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Text(
          'Tap to learn more',
          style: theme.textTheme.bodySmall?.copyWith(
            color: AppColors.primaryColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(String label, String value, Color color, ThemeData theme) {
    return Column(
      children: [
        Text(
          value,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
            color: color,
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

  Color _getPm25Color(double pm25) {
    if (pm25 <= 12) return Colors.green;
    if (pm25 <= 35) return Colors.yellow.shade700;
    if (pm25 <= 55) return Colors.orange;
    if (pm25 <= 150) return Colors.red;
    return Colors.purple;
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

  void _openFullDashboard() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const ExposureDashboardPage(),
      ),
    );
  }
}

/// A compact version that can be integrated into dashboard views
class ExposureOverviewCard extends StatelessWidget {
  final DailyExposureSummary? todayExposure;
  final VoidCallback? onTap;

  const ExposureOverviewCard({
    super.key,
    this.todayExposure,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Material(
        color: AppColors.primaryColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Icon(
                  Icons.air,
                  color: AppColors.primaryColor,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Today\'s Air Exposure',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      if (todayExposure != null)
                        Text(
                          '${todayExposure!.riskLevel.displayName} risk • ${_formatDuration(todayExposure!.totalOutdoorTime)} outdoors',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                          ),
                        )
                      else
                        Text(
                          'Enable location tracking to see exposure data',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                          ),
                        ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 14,
                  color: AppColors.primaryColor,
                ),
              ],
            ),
          ),
        ),
      ),
    );
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