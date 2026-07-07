import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/utils/air_quality_card_utils.dart';
import 'package:airqo/src/app/dashboard/utils/measurement_location_utils.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class AirQualityShareCard extends StatelessWidget {
  final Measurement measurement;
  final String? fallbackLocationName;

  const AirQualityShareCard({
    super.key,
    required this.measurement,
    this.fallbackLocationName,
  });

  @override
  Widget build(BuildContext context) {
    final locationName = sanitizeCardText(
      measurementDisplayName(
        measurement,
        fallbackLocationName: fallbackLocationName ?? 'AirQo location',
      ),
    );
    final locationDescription = sanitizeCardText(
      _getLocationDescription(measurement),
    );
    final category = aqiCategoryLabel(
      sanitizeCardText(measurement.aqiCategory ?? 'Unavailable'),
    );
    final pm25Value = measurement.pm25?.value;
    final healthTip = sanitizeCardText(
      measurement.healthTips?.firstOrNull?.tagLine ??
          measurement.healthTips?.firstOrNull?.description ??
          'Stay informed and plan your outdoor time wisely.',
    );
    final categoryColor = getMeasurementAqiColor(measurement);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // Always white per the design system — the card background is a
    // colored gradient regardless of app theme, so text stays white in
    // both light and dark mode for consistent contrast.
    const cardTextColor = Colors.white;
    final secondaryTextColor = cardTextColor.withValues(alpha: 0.82);
    final titleFontSize = _titleFontSize(locationName);
    final categoryFontSize = _categoryFontSize(category);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            categoryColor.withValues(alpha: isDark ? 0.75 : 0.92),
            AppColors.primaryColor,
            const Color(0xFF10233D),
          ],
          stops: const [0.0, 0.58, 1.0],
        ),
        boxShadow: [
          BoxShadow(
            color: categoryColor.withValues(alpha: 0.22),
            blurRadius: 28,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AirQo',
                      style: TextStyle(
                        color: cardTextColor.withValues(alpha: 0.88),
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.2,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      locationName,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: cardTextColor,
                        fontSize: titleFontSize,
                        height: 1.02,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if (locationDescription.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        locationDescription,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: secondaryTextColor,
                          fontSize: 13,
                          height: 1.25,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 12),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 124),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: categoryColor.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Center(
                    child: Text(
                      category,
                      maxLines: 1,
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: categoryColor,
                        fontSize: categoryFontSize,
                        height: 1.0,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.bottomLeft,
                  child: Text(
                    pm25Value?.toStringAsFixed(1) ?? '--',
                    style: TextStyle(
                      color: cardTextColor,
                      fontSize: 72,
                      height: 0.92,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  'PM2.5 µg/m³',
                  style: TextStyle(
                    color: secondaryTextColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Text(
              healthTip,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: cardTextColor,
                fontSize: 14,
                height: 1.3,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Shared from the AirQo app',
            style: TextStyle(
              color: secondaryTextColor,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  String _getLocationDescription(Measurement measurement) {
    final siteDetails = measurement.siteDetails;
    if (siteDetails == null) return '';

    final parts = <String>[];

    if (siteDetails.city != null && siteDetails.city!.isNotEmpty) {
      parts.add(siteDetails.city!);
    } else if (siteDetails.town != null && siteDetails.town!.isNotEmpty) {
      parts.add(siteDetails.town!);
    }

    if (siteDetails.region != null && siteDetails.region!.isNotEmpty) {
      parts.add(siteDetails.region!);
    } else if (siteDetails.county != null && siteDetails.county!.isNotEmpty) {
      parts.add(siteDetails.county!);
    }

    if (siteDetails.country != null && siteDetails.country!.isNotEmpty) {
      parts.add(siteDetails.country!);
    }

    return parts.join(', ');
  }

  double _titleFontSize(String title) {
    if (title.length <= 12) return 30;
    if (title.length <= 20) return 27;
    if (title.length <= 28) return 24;
    return 22;
  }

  double _categoryFontSize(String category) {
    if (category.length <= 10) return 12;
    if (category.length <= 16) return 11;
    return 10;
  }
}
