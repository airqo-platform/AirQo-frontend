import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/forecast_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';

class ForecastDayDetailCard extends StatelessWidget {
  final Forecast forecast;
  final bool isDark;

  const ForecastDayDetailCard({
    super.key,
    required this.forecast,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final aqiColor = hexToColor(forecast.aqiColor);
    final aqiTextColor = readableAqiColor(aqiColor);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkHighlight : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      DateFormat('EEEE, MMM d').format(forecast.time),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.boldHeadlineColor,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          forecast.pm25.toStringAsFixed(1),
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
                              color: AppColors.boldHeadlineColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: aqiColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: aqiTextColor.withValues(alpha: 0.5),
                            width: 1),
                      ),
                      child: Text(
                        forecast.aqiCategory,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: aqiTextColor,
                        ),
                      ),
                    ),
                    if (forecast.forecastConfidence != null) ...[
                      const SizedBox(height: 14),
                      ForecastConfidenceBar(
                          confidence: forecast.forecastConfidence!),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 16),
              SvgPicture.asset(
                getForecastAirQualityIcon(forecast.aqiCategory),
                width: 72,
                height: 72,
              ),
            ],
          ),
          if (forecast.aqiLabel != null) ...[
            const SizedBox(height: 14),
            const Divider(height: 1),
            const SizedBox(height: 12),
            Text(
              forecast.aqiLabel!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.boldHeadlineColor,
                  ),
            ),
          ],
          if (forecast.trendMessage != null) ...[
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.trending_flat_rounded,
                    size: 14, color: AppColors.primaryColor),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    forecast.trendMessage!,
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.primaryColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
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
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Forecast confidence',
              style: TextStyle(
                  fontSize: 11, color: AppColors.boldHeadlineColor),
            ),
            Text(
              '${clamped.round()}%',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.boldHeadlineColor,
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
            backgroundColor: AppColors.dividerColorlight,
            valueColor:
                AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
          ),
        ),
      ],
    );
  }
}
