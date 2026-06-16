import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
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
    final locationName = measurement.siteDetails?.searchName ??
        measurement.siteDetails?.name ??
        fallbackLocationName ??
        'AirQo location';
    final locationDescription = _getLocationDescription(measurement);
    final category = measurement.aqiCategory ?? 'Unavailable';
    final pm25Value = measurement.pm25?.value;
    final healthTip = measurement.healthTips?.firstOrNull?.tagLine ??
        measurement.healthTips?.firstOrNull?.description ??
        'Stay informed and plan your outdoor time wisely.';
    final categoryColor = _getAqiColor(measurement);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardTextColor = isDark ? Colors.white : const Color(0xFF122033);
    final secondaryTextColor = cardTextColor.withValues(alpha: 0.72);

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
            isDark ? const Color(0xFF111827) : const Color(0xFFF4F8FF),
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
                      style: TextStyle(
                        color: cardTextColor,
                        fontSize: 24,
                        height: 1.1,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if (locationDescription.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        locationDescription,
                        style: TextStyle(
                          color: secondaryTextColor,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: isDark ? 0.12 : 0.84),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  category,
                  style: TextStyle(
                    color: isDark ? Colors.white : categoryColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                pm25Value?.toStringAsFixed(1) ?? '--',
                style: TextStyle(
                  color: cardTextColor,
                  fontSize: 52,
                  height: 0.95,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 8, bottom: 6),
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
          const SizedBox(height: 18),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: isDark ? 0.08 : 0.82),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Text(
              healthTip,
              style: TextStyle(
                color: cardTextColor,
                fontSize: 14,
                height: 1.35,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 18),
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

  Color _getAqiColor(Measurement measurement) {
    if (measurement.aqiColor != null) {
      try {
        final colorString = measurement.aqiColor!.replaceAll('#', '');
        return Color(int.parse('0xFF$colorString'));
      } catch (_) {}
    }

    switch (measurement.aqiCategory?.toLowerCase() ?? '') {
      case 'good':
        return const Color(0xFF179D5B);
      case 'moderate':
        return const Color(0xFFC79000);
      case 'unhealthy for sensitive groups':
      case 'u4sg':
        return const Color(0xFFE17827);
      case 'unhealthy':
        return const Color(0xFFD63A45);
      case 'very unhealthy':
        return const Color(0xFF7540B5);
      case 'hazardous':
        return const Color(0xFF6D4C41);
      default:
        return AppColors.primaryColor;
    }
  }
}
