import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/meta/utils/colors.dart';

/// Widget that shows detailed day-to-day exposure comparison
class DailyComparisonWidget extends StatefulWidget {
  final List<DailyExposureSummary> dailySummaries;
  final DailyExposureSummary? selectedDay;

  const DailyComparisonWidget({
    super.key,
    required this.dailySummaries,
    this.selectedDay,
  });

  @override
  State<DailyComparisonWidget> createState() => _DailyComparisonWidgetState();
}

class _DailyComparisonWidgetState extends State<DailyComparisonWidget> {
  int _selectedIndex = 0;
  bool _showExposureChart = true;

  @override
  void initState() {
    super.initState();
    if (widget.selectedDay != null) {
      _selectedIndex = widget.dailySummaries.indexWhere(
        (summary) => summary.date.day == widget.selectedDay!.date.day,
      );
      if (_selectedIndex == -1) _selectedIndex = 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.dailySummaries.isEmpty) {
      return _buildNoDataState();
    }

    final selectedSummary = widget.dailySummaries[_selectedIndex];

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
                _buildDaySelector(),
                const SizedBox(height: 16),
                _buildSelectedDayCard(selectedSummary),
                const SizedBox(height: 16),
                _buildComparisonChart(),
                const SizedBox(height: 16),
                _buildKeyInsights(selectedSummary),
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
          Icons.compare_arrows,
          color: AppColors.primaryColor,
          size: 24,
        ),
        const SizedBox(width: 8),
        Text(
          'Daily Comparison',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const Spacer(),
        Text(
          '${widget.dailySummaries.length} days',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildDaySelector() {
    return Container(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: widget.dailySummaries.length,
        itemBuilder: (context, index) {
          final summary = widget.dailySummaries[index];
          final isSelected = index == _selectedIndex;
          final isToday = _isToday(summary.date);
          final isYesterday = _isYesterday(summary.date);

          return GestureDetector(
            onTap: () => setState(() => _selectedIndex = index),
            child: Container(
              width: 80,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primaryColor : Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? AppColors.primaryColor : Colors.grey[300]!,
                  width: 2,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    isToday ? 'Today' : isYesterday ? 'Yesterday' : _formatDayName(summary.date),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: isSelected ? Colors.white : Colors.grey[600],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${summary.date.day}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: isSelected ? Colors.white : Colors.grey[800],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    width: 24,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _getRiskColor(summary.riskLevel).withOpacity(0.7),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSelectedDayCard(DailyExposureSummary summary) {
    return Container(
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _formatFullDate(summary.date),
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryColor,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _getRiskColor(summary.riskLevel).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _getRiskColor(summary.riskLevel).withOpacity(0.3),
                  ),
                ),
                child: Text(
                  summary.riskLevel.displayName,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: _getRiskColor(summary.riskLevel),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildMetricItem(
                  'Exposure Score',
                  summary.totalExposureScore.toStringAsFixed(1),
                  Icons.analytics,
                  AppColors.primaryColor,
                ),
              ),
              Expanded(
                child: _buildMetricItem(
                  'Outdoor Time',
                  '${summary.totalOutdoorTime.inHours}h ${summary.totalOutdoorTime.inMinutes % 60}m',
                  Icons.access_time,
                  Colors.blue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildMetricItem(
                  'Avg PM2.5',
                  '${summary.averagePm25.toStringAsFixed(1)} μg/m³',
                  Icons.air,
                  Colors.orange,
                ),
              ),
              Expanded(
                child: _buildMetricItem(
                  'Peak PM2.5',
                  '${summary.maxPm25.toStringAsFixed(1)} μg/m³',
                  Icons.warning,
                  Colors.red,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricItem(String label, String value, IconData icon, Color color) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildComparisonChart() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Exposure Trend',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            Row(
              children: [
                _buildChartToggle('Exposure', _showExposureChart, true),
                const SizedBox(width: 8),
                _buildChartToggle('PM2.5', !_showExposureChart, false),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          height: 200,
          child: _showExposureChart ? _buildExposureChart() : _buildPM25Chart(),
        ),
      ],
    );
  }

  Widget _buildChartToggle(String label, bool isSelected, bool isExposure) {
    return GestureDetector(
      onTap: () => setState(() => _showExposureChart = isExposure),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryColor : Colors.grey[200],
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: isSelected ? Colors.white : Colors.grey[600],
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildExposureChart() {
    final spots = <FlSpot>[];
    for (int i = 0; i < widget.dailySummaries.length; i++) {
      spots.add(FlSpot(i.toDouble(), widget.dailySummaries[i].totalExposureScore));
    }

    return LineChart(
      LineChartData(
        gridData: FlGridData(show: false),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text(
                  value.toStringAsFixed(0),
                  style: Theme.of(context).textTheme.bodySmall,
                );
              },
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index >= 0 && index < widget.dailySummaries.length) {
                  return Text(
                    '${widget.dailySummaries[index].date.day}',
                    style: Theme.of(context).textTheme.bodySmall,
                  );
                }
                return const Text('');
              },
            ),
          ),
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: AppColors.primaryColor,
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(
              show: true,
              checkToShowDot: (spot, barData) {
                return spot.x.toInt() == _selectedIndex;
              },
            ),
            belowBarData: BarAreaData(
              show: true,
              color: AppColors.primaryColor.withOpacity(0.1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPM25Chart() {
    final spots = <FlSpot>[];
    for (int i = 0; i < widget.dailySummaries.length; i++) {
      spots.add(FlSpot(i.toDouble(), widget.dailySummaries[i].averagePm25));
    }

    return LineChart(
      LineChartData(
        gridData: FlGridData(show: false),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text(
                  value.toStringAsFixed(0),
                  style: Theme.of(context).textTheme.bodySmall,
                );
              },
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index >= 0 && index < widget.dailySummaries.length) {
                  return Text(
                    '${widget.dailySummaries[index].date.day}',
                    style: Theme.of(context).textTheme.bodySmall,
                  );
                }
                return const Text('');
              },
            ),
          ),
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: Colors.orange,
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(
              show: true,
              checkToShowDot: (spot, barData) {
                return spot.x.toInt() == _selectedIndex;
              },
            ),
            belowBarData: BarAreaData(
              show: true,
              color: Colors.orange.withOpacity(0.1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKeyInsights(DailyExposureSummary summary) {
    final insights = _generateInsights(summary);
    if (insights.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Key Insights',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ...insights.map((insight) => _buildInsightItem(insight)),
      ],
    );
  }

  Widget _buildInsightItem(String insight) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.insights,
            size: 16,
            color: AppColors.primaryColor,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              insight,
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
                  Icons.compare_arrows,
                  size: 48,
                  color: Colors.grey.withOpacity(0.3),
                ),
                const SizedBox(height: 16),
                Text(
                  'No Comparison Data',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Daily comparisons will appear here once you have multiple days of exposure data.',
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

  List<String> _generateInsights(DailyExposureSummary summary) {
    final insights = <String>[];
    
    // Compare with previous days
    final previousDays = widget.dailySummaries.where((s) => s.date.isBefore(summary.date)).toList();
    if (previousDays.isNotEmpty) {
      final avgPreviousExposure = previousDays.map((s) => s.totalExposureScore).reduce((a, b) => a + b) / previousDays.length;
      
      if (summary.totalExposureScore > avgPreviousExposure * 1.3) {
        insights.add('Your exposure today was ${((summary.totalExposureScore / avgPreviousExposure - 1) * 100).toStringAsFixed(0)}% higher than your recent average.');
      } else if (summary.totalExposureScore < avgPreviousExposure * 0.7) {
        insights.add('Your exposure today was ${((1 - summary.totalExposureScore / avgPreviousExposure) * 100).toStringAsFixed(0)}% lower than your recent average.');
      }

      final avgPreviousPM25 = previousDays.map((s) => s.averagePm25).reduce((a, b) => a + b) / previousDays.length;
      if (summary.averagePm25 > avgPreviousPM25 * 1.2) {
        insights.add('PM2.5 levels were significantly higher than recent days.');
      }
    }

    // Time-based insights
    if (summary.totalOutdoorTime.inHours > 6) {
      insights.add('You spent ${summary.totalOutdoorTime.inHours}+ hours outdoors today.');
    }

    // Risk level insights
    if (summary.riskLevel == ExposureRiskLevel.high) {
      insights.add('This was a high-exposure day. Consider indoor activities when air quality is poor.');
    } else if (summary.riskLevel == ExposureRiskLevel.minimal) {
      insights.add('This was a low-exposure day with good air quality conditions.');
    }

    return insights;
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }

  bool _isYesterday(DateTime date) {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return date.year == yesterday.year && date.month == yesterday.month && date.day == yesterday.day;
  }

  String _formatDayName(DateTime date) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[date.weekday - 1];
  }

  String _formatFullDate(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
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