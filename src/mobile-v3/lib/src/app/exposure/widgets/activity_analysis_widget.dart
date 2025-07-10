import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/meta/utils/colors.dart';

/// Widget that displays activity analysis with exposure breakdown
class ActivityAnalysisWidget extends StatefulWidget {
  final ActivityAnalysis analysis;
  final bool showDetailedView;

  const ActivityAnalysisWidget({
    super.key,
    required this.analysis,
    this.showDetailedView = false,
  });

  @override
  State<ActivityAnalysisWidget> createState() => _ActivityAnalysisWidgetState();
}

class _ActivityAnalysisWidgetState extends State<ActivityAnalysisWidget> {
  bool _showExposureChart = true;

  @override
  Widget build(BuildContext context) {
    if (widget.analysis.segments.isEmpty) {
      return _buildNoDataState();
    }

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
                _buildHeader(),
                const SizedBox(height: 16),
                _buildToggleButtons(),
                const SizedBox(height: 16),
                _buildChart(),
                const SizedBox(height: 16),
                _buildActivityBreakdown(),
                if (widget.showDetailedView) ...[
                  const SizedBox(height: 16),
                  _buildTopExposingActivities(),
                  const SizedBox(height: 16),
                  _buildRecommendations(),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Icon(
          Icons.analytics,
          color: AppColors.primaryColor,
          size: 24,
        ),
        const SizedBox(width: 8),
        Text(
          'Activity Analysis',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const Spacer(),
        Text(
          '${widget.analysis.segments.length} activities',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildToggleButtons() {
    return Row(
      children: [
        _buildToggleButton(
          'Exposure',
          _showExposureChart,
          () => setState(() => _showExposureChart = true),
        ),
        const SizedBox(width: 8),
        _buildToggleButton(
          'Time',
          !_showExposureChart,
          () => setState(() => _showExposureChart = false),
        ),
      ],
    );
  }

  Widget _buildToggleButton(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryColor : Colors.grey[200],
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey[700],
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildChart() {
    return Container(
      height: 200,
      child: _showExposureChart ? _buildExposureChart() : _buildTimeChart(),
    );
  }

  Widget _buildExposureChart() {
    final data = widget.analysis.exposureByActivity;
    if (data.isEmpty) return _buildNoDataChart();

    final sections = data.entries.map((entry) {
      final percentage = (entry.value / data.values.reduce((a, b) => a + b)) * 100;
      return PieChartSectionData(
        value: entry.value,
        color: _getActivityColor(entry.key),
        title: percentage > 5 ? '${percentage.toStringAsFixed(0)}%' : '',
        radius: 60,
        titleStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      );
    }).toList();

    return PieChart(
      PieChartData(
        sections: sections,
        sectionsSpace: 2,
        centerSpaceRadius: 40,
        startDegreeOffset: -90,
      ),
    );
  }

  Widget _buildTimeChart() {
    final data = widget.analysis.timeByActivity;
    if (data.isEmpty) return _buildNoDataChart();

    final totalMinutes = data.values.fold(0, (sum, duration) => sum + duration.inMinutes);
    if (totalMinutes == 0) return _buildNoDataChart();

    final sections = data.entries.map((entry) {
      final percentage = (entry.value.inMinutes / totalMinutes) * 100;
      return PieChartSectionData(
        value: entry.value.inMinutes.toDouble(),
        color: _getActivityColor(entry.key),
        title: percentage > 5 ? '${percentage.toStringAsFixed(0)}%' : '',
        radius: 60,
        titleStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      );
    }).toList();

    return PieChart(
      PieChartData(
        sections: sections,
        sectionsSpace: 2,
        centerSpaceRadius: 40,
        startDegreeOffset: -90,
      ),
    );
  }

  Widget _buildNoDataChart() {
    return Center(
      child: Text(
        'No activity data available',
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: Colors.grey[600],
        ),
      ),
    );
  }

  Widget _buildActivityBreakdown() {
    final data = _showExposureChart 
        ? widget.analysis.exposureByActivity
        : widget.analysis.timeByActivity.map((k, v) => MapEntry(k, v.inMinutes.toDouble()));

    if (data.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _showExposureChart ? 'Exposure by Activity' : 'Time by Activity',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ...data.entries.map((entry) => _buildActivityRow(entry)),
      ],
    );
  }

  Widget _buildActivityRow(MapEntry<ActivityType, double> entry) {
    final value = entry.value;
    final unit = _showExposureChart ? 'pts' : 'min';
    final percentage = _showExposureChart
        ? (value / widget.analysis.exposureByActivity.values.reduce((a, b) => a + b)) * 100
        : (value / widget.analysis.timeByActivity.values.fold(0, (sum, duration) => sum + duration.inMinutes)) * 100;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            width: 16,
            height: 16,
            decoration: BoxDecoration(
              color: _getActivityColor(entry.key),
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(width: 12),
          Icon(
            entry.key.icon,
            size: 18,
            color: Colors.grey[600],
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              entry.key.displayName,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          Text(
            '${value.toStringAsFixed(1)} $unit',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '${percentage.toStringAsFixed(0)}%',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopExposingActivities() {
    final topActivities = widget.analysis.segments
        .where((s) => s.exposurePerMinute > 0)
        .toList()
      ..sort((a, b) => b.exposurePerMinute.compareTo(a.exposurePerMinute));

    final displayCount = topActivities.length > 3 ? 3 : topActivities.length;
    if (displayCount == 0) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Most Exposing Activities',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ...topActivities.take(displayCount).map((segment) => _buildExposingActivityRow(segment)),
      ],
    );
  }

  Widget _buildExposingActivityRow(ActivitySegment segment) {
    final time = '${segment.startTime.hour.toString().padLeft(2, '0')}:${segment.startTime.minute.toString().padLeft(2, '0')}';
    final duration = '${segment.duration.inMinutes}min';
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _getActivityColor(segment.activityType).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              segment.activityType.icon,
              size: 20,
              color: _getActivityColor(segment.activityType),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  segment.activityType.displayName,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '$time • $duration',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: _getRiskColor(segment.riskLevel).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '${segment.exposurePerMinute.toStringAsFixed(1)} pts/min',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: _getRiskColor(segment.riskLevel),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendations() {
    if (widget.analysis.recommendations.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Activity Recommendations',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ...widget.analysis.recommendations.map((recommendation) => _buildRecommendationRow(recommendation)),
      ],
    );
  }

  Widget _buildRecommendationRow(String recommendation) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
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
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoDataState() {
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
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Icon(
                  Icons.analytics,
                  size: 48,
                  color: Colors.grey.withOpacity(0.3),
                ),
                const SizedBox(height: 16),
                Text(
                  'No Activity Data',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Activity analysis will appear here once you have location data with movement patterns.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getActivityColor(ActivityType activity) {
    switch (activity) {
      case ActivityType.stationary:
        return Colors.grey;
      case ActivityType.walking:
        return Colors.green;
      case ActivityType.cycling:
        return Colors.blue;
      case ActivityType.driving:
        return Colors.red;
      case ActivityType.publicTransport:
        return Colors.purple;
      case ActivityType.indoor:
        return Colors.orange;
      case ActivityType.unknown:
        return Colors.grey;
    }
  }

  Color _getRiskColor(ExposureRiskLevel riskLevel) {
    switch (riskLevel) {
      case ExposureRiskLevel.minimal:
        return Colors.green;
      case ExposureRiskLevel.low:
        return Colors.yellow;
      case ExposureRiskLevel.moderate:
        return Colors.orange;
      case ExposureRiskLevel.high:
        return Colors.red;
    }
  }
}