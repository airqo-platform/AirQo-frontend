import 'package:airqo/src/app/dashboard/models/forecast_guidance.dart';
import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class ForecastGuidanceSection extends StatelessWidget {
  final ForecastGuidance guidance;

  const ForecastGuidanceSection({super.key, required this.guidance});

  factory ForecastGuidanceSection.fromForecast(Forecast forecast) {
    return ForecastGuidanceSection(guidance: guidanceFromForecast(forecast));
  }

  factory ForecastGuidanceSection.fromHourly(HourlyForecastEntry entry) {
    return ForecastGuidanceSection(guidance: guidanceFromHourlyEntry(entry));
  }

  @override
  Widget build(BuildContext context) {
    if (!guidance.hasContent) {
      return const SizedBox.shrink();
    }

    final message = guidance.message;
    final trendMessage = guidance.trendMessage;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: AppSurfaceColors.sheetPanelDecoration(context, radius: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.medical_services_outlined,
                color: Colors.red,
                size: 24,
              ),
              const SizedBox(width: 8),
              Flexible(
                child: TranslatedText(
                  'Air quality guidance',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
              ),
            ],
          ),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(
              message,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: Theme.of(context).textTheme.bodyLarge?.color,
              ),
            ),
          ],
          if (trendMessage != null) ...[
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.trending_flat_rounded,
                  size: 14,
                  color: AppColors.primaryColor,
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    trendMessage,
                    style: TextStyle(
                      fontSize: 13,
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
