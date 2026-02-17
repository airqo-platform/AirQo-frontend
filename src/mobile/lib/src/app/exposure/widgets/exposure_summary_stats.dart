import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/utils/exposure_utils.dart';

class ExposureSummaryStats extends StatelessWidget {
  final DailyExposureSummary data;

  const ExposureSummaryStats({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final lowExposureTime = data.timeByAqiCategory.entries
        .where((entry) => ['good', 'moderate'].contains(entry.key.toLowerCase()))
        .fold(Duration.zero, (sum, entry) => sum + entry.value);

    final lowExposureHours = lowExposureTime.inHours;
    final totalOutdoorHours = data.totalOutdoorTime.inHours;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _buildStatCard(
          context,
          'Low exposure',
          lowExposureHours.toString().padLeft(2, '0'),
          'hours',
          const Color(0xFF8FE6A4),
        ),
        _buildStatCard(
          context,
          'Total exposure time',
          totalOutdoorHours.toString(),
          'hours',
          AppColors.primaryColor,
        ),
        _buildStatCard(
          context,
          'Risk level',
          data.riskLevel.displayName,
          '',
          getRiskLevelColor(data.riskLevel),
        ),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String label, String value, String unit, Color color) {
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
            color: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.color
                ?.withValues(alpha: 0.7),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
