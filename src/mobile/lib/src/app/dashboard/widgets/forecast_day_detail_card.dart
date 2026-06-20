import 'package:airqo/src/app/dashboard/models/forecast_guidance.dart';
import 'package:airqo/src/app/dashboard/widgets/forecast_met_row.dart';
import 'package:airqo/src/app/shared/widgets/aqi_category_chip.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/forecast_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class ForecastDayDetailCard extends StatelessWidget {
  final ForecastReadingSnapshot reading;
  final bool isDark;

  const ForecastDayDetailCard({
    super.key,
    required this.reading,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final hasMet = reading.met != null &&
        (reading.met!.airTemperature != null ||
            reading.met!.relativeHumidity != null ||
            reading.met!.windSpeed != null ||
            reading.met!.precipitationAmount != null);

    final isLight = Theme.of(context).brightness == Brightness.light;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: AppSurfaceColors.sheetPanelDecoration(context, radius: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SvgPicture.asset(
                isLight
                    ? 'assets/images/shared/pm_rating_white.svg'
                    : 'assets/images/shared/pm_rating.svg',
              ),
              const SizedBox(width: 2),
              Text(
                'PM2.5',
                style: TextStyle(
                  color: Theme.of(context).textTheme.headlineSmall?.color,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          reading.pm25.toStringAsFixed(1),
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(
                                fontSize: 48,
                                fontWeight: FontWeight.w700,
                                height: 1,
                              ),
                        ),
                        Padding(
                          padding:
                              const EdgeInsets.only(bottom: 8, left: 4),
                          child: Text(
                            'µg/m³',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppTextColors.muted(context),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    AqiCategoryChip(category: reading.aqiCategory),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              SvgPicture.asset(
                getForecastAirQualityIcon(reading.aqiCategory),
                width: 72,
                height: 72,
              ),
            ],
          ),
          if (reading.forecastConfidence != null) ...[
            const SizedBox(height: 16),
            ForecastConfidenceBar(confidence: reading.forecastConfidence!),
          ],
          if (hasMet) ...[
            const SizedBox(height: 16),
            Divider(height: 1, color: AppSurfaceColors.border(context)),
            const SizedBox(height: 16),
            ForecastMetRow(met: reading.met, insetOnPanel: true),
          ],
        ],
      ),
    );
  }
}

class ForecastConfidenceBar extends StatelessWidget {
  final double confidence;

  const ForecastConfidenceBar({super.key, required this.confidence});

  @override
  Widget build(BuildContext context) {
    final clamped = confidence.clamp(0.0, 100.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Forecast confidence',
              style: TextStyle(
                fontSize: 11,
                color: AppTextColors.subtitle(context),
              ),
            ),
            Text(
              '${clamped.round()}%',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppTextColors.muted(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: clamped / 100,
            minHeight: 6,
            backgroundColor: Theme.of(context).brightness == Brightness.dark
                ? AppColors.dividerColordark
                : AppColors.boldHeadlineColor4.withValues(alpha: 0.25),
            valueColor:
                AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
          ),
        ),
      ],
    );
  }
}
