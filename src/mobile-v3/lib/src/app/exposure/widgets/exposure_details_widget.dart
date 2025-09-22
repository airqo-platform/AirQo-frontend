import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class ExposureDetailsWidget extends StatelessWidget {
  final DailyExposureSummary exposureSummary;

  const ExposureDetailsWidget({
    super.key,
    required this.exposureSummary,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenHeight = MediaQuery.of(context).size.height;

    return Container(
      height: screenHeight * 0.85,
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: theme.dividerColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Exposure Details',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        _formatDate(exposureSummary.date),
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Risk level summary
                  _buildRiskLevelSummary(theme),
                  
                  const SizedBox(height: 24),

                  // Detailed metrics
                  _buildDetailedMetrics(theme),

                  const SizedBox(height: 24),

                  // Air quality breakdown
                  _buildAirQualityBreakdown(theme),

                  const SizedBox(height: 24),

                  // Timeline
                  _buildExposureTimeline(theme),

                  const SizedBox(height: 24),

                  // Recommendations
                  _buildRecommendations(theme),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRiskLevelSummary(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _getRiskColor().withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _getRiskColor().withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            _getRiskIcon(),
            color: _getRiskColor(),
            size: 32,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${exposureSummary.riskLevel.displayName} Risk Level',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: _getRiskColor(),
                  ),
                ),
                Text(
                  exposureSummary.riskLevel.description,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: _getRiskColor().withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _getRiskColor(),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              exposureSummary.totalExposureScore.toStringAsFixed(1),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailedMetrics(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Detailed Metrics',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.highlightColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              _buildMetricRow(
                'Total Outdoor Time',
                _formatDuration(exposureSummary.totalOutdoorTime),
                Icons.schedule,
                theme,
              ),
              const SizedBox(height: 16),
              _buildMetricRow(
                'Average PM2.5',
                '${exposureSummary.averagePm25.toStringAsFixed(1)} μg/m³',
                Icons.air,
                theme,
              ),
              const SizedBox(height: 16),
              _buildMetricRow(
                'Peak PM2.5',
                '${exposureSummary.maxPm25.toStringAsFixed(1)} μg/m³',
                Icons.trending_up,
                theme,
              ),
              const SizedBox(height: 16),
              _buildMetricRow(
                'Locations Visited',
                '${exposureSummary.dataPoints.length}',
                Icons.location_on,
                theme,
              ),
              const SizedBox(height: 16),
              _buildMetricRow(
                'Dominant Air Quality',
                exposureSummary.dominantAqiCategory,
                Icons.category,
                theme,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMetricRow(String label, String value, IconData icon, ThemeData theme) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodyMedium,
          ),
        ),
        Text(
          value,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildAirQualityBreakdown(ThemeData theme) {
    if (exposureSummary.timeByAqiCategory.isEmpty) {
      return const SizedBox.shrink();
    }

    final totalMinutes = exposureSummary.totalOutdoorTime.inMinutes;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Air Quality Breakdown',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.highlightColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: exposureSummary.timeByAqiCategory.entries.map((entry) {
              final duration = entry.value;
              final percentage = totalMinutes > 0 ? (duration.inMinutes / totalMinutes * 100) : 0;
              
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 16,
                          height: 16,
                          decoration: BoxDecoration(
                            color: _getAqiCategoryColor(entry.key),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            entry.key,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        Text(
                          _formatDuration(duration),
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: percentage / 100,
                      backgroundColor: theme.dividerColor.withOpacity(0.3),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        _getAqiCategoryColor(entry.key),
                      ),
                      minHeight: 6,
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildExposureTimeline(ThemeData theme) {
    if (exposureSummary.dataPoints.isEmpty) {
      return const SizedBox.shrink();
    }

    // Group data points by hour for timeline
    final pointsByHour = <int, List<ExposureDataPoint>>{};
    for (final point in exposureSummary.dataPoints) {
      final hour = point.timestamp.hour;
      pointsByHour.putIfAbsent(hour, () => []).add(point);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Exposure Timeline',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.highlightColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: pointsByHour.entries.map((entry) {
              final hour = entry.key;
              final points = entry.value;
              final avgPm25 = points
                  .where((p) => p.pm25Value != null)
                  .map((p) => p.pm25Value!)
                  .fold(0.0, (a, b) => a + b) / points.length;
              
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    SizedBox(
                      width: 50,
                      child: Text(
                        '${hour.toString().padLeft(2, '0')}:00',
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Container(
                        height: 20,
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        decoration: BoxDecoration(
                          color: _getPm25Color(avgPm25),
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    SizedBox(
                      width: 80,
                      child: Text(
                        '${avgPm25.toStringAsFixed(1)} μg/m³',
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.end,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildRecommendations(ThemeData theme) {
    final recommendations = _generateRecommendations();
    
    if (recommendations.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recommendations',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        
        Container(
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
            children: recommendations.map((recommendation) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
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
                        recommendation,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: AppColors.primaryColor.withOpacity(0.9),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
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

  IconData _getRiskIcon() {
    switch (exposureSummary.riskLevel) {
      case ExposureRiskLevel.minimal:
        return Icons.check_circle;
      case ExposureRiskLevel.low:
        return Icons.info;
      case ExposureRiskLevel.moderate:
        return Icons.warning;
      case ExposureRiskLevel.high:
        return Icons.error;
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

  Color _getPm25Color(double pm25) {
    if (pm25 <= 12) return Colors.green;
    if (pm25 <= 35) return Colors.yellow;
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

  String _formatDate(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  List<String> _generateRecommendations() {
    final recommendations = <String>[];

    // Based on risk level
    switch (exposureSummary.riskLevel) {
      case ExposureRiskLevel.high:
        recommendations.add('Consider limiting outdoor activities on high pollution days');
        recommendations.add('Use a high-quality air pollution mask when outside');
        break;
      case ExposureRiskLevel.moderate:
        recommendations.add('Monitor air quality alerts before outdoor activities');
        recommendations.add('Consider shorter outdoor sessions during high pollution periods');
        break;
      case ExposureRiskLevel.low:
        recommendations.add('Continue monitoring air quality for optimal outdoor timing');
        break;
      case ExposureRiskLevel.minimal:
        recommendations.add('Great job! Your exposure levels are very low');
        break;
    }

    // Based on outdoor time
    if (exposureSummary.totalOutdoorTime.inHours > 6) {
      recommendations.add('Consider breaking up long outdoor periods during high pollution days');
    }

    // Based on PM2.5 levels
    if (exposureSummary.maxPm25 > 75) {
      recommendations.add('Peak pollution levels were high - check air quality before going out');
    }

    return recommendations;
  }
}