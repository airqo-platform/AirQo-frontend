import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';

// Shared AQ level helper — same breakpoints as hourly_detail_sheet.dart
({String asset, Color color}) aqLevelFromPm25(double pm25) {
  if (pm25 < 12.1) {
    return (
      asset: 'assets/images/shared/airquality_indicators/good.svg',
      color: const Color(0xFF34C759),
    );
  }
  if (pm25 < 35.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/moderate.svg',
      color: const Color(0xFFFDC412),
    );
  }
  if (pm25 < 55.5) {
    return (
      asset:
          'assets/images/shared/airquality_indicators/unhealthy-sensitive.svg',
      color: const Color(0xFFFF851F),
    );
  }
  if (pm25 < 150.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/unhealthy.svg',
      color: const Color(0xFFFE726B),
    );
  }
  if (pm25 < 250.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/very-unhealthy.svg',
      color: const Color(0xFFC78AE8),
    );
  }
  return (
    asset: 'assets/images/shared/airquality_indicators/hazardous.svg',
    color: const Color(0xFFD95BA3),
  );
}

String _locationDescription(Measurement measurement) {
  final s = measurement.siteDetails;
  if (s == null) return '';
  final parts = <String>[];
  if (s.city?.isNotEmpty == true) {
    parts.add(s.city!);
  } else if (s.town?.isNotEmpty == true) {
    parts.add(s.town!);
  }
  if (s.region?.isNotEmpty == true) {
    parts.add(s.region!);
  } else if (s.county?.isNotEmpty == true) {
    parts.add(s.county!);
  }
  if (s.country?.isNotEmpty == true) parts.add(s.country!);
  return parts.join(', ');
}

class MapAirQualityCard extends StatelessWidget {
  final Measurement measurement;
  final VoidCallback onDismiss;
  final VoidCallback onViewForecast;

  const MapAirQualityCard({
    super.key,
    required this.measurement,
    required this.onDismiss,
    required this.onViewForecast,
  });

  Color _aqiColor() {
    final aq = aqLevelFromPm25(measurement.pm25?.value ?? 0);
    return aq.color;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final pmValue = measurement.pm25?.value;
    final aqColor = _aqiColor();
    final locationText = _locationDescription(measurement);

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ────────────────────────────────────────────────
          Padding(
            padding:
                const EdgeInsets.only(left: 16, right: 12, top: 14, bottom: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        measurement.siteDetails?.searchName ??
                            measurement.siteDetails?.name ??
                            '—',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.color,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (locationText.isNotEmpty) ...[
                        const SizedBox(height: 3),
                        Row(
                          children: [
                            Icon(
                              Icons.location_on,
                              size: 13,
                              color: AppColors.primaryColor,
                            ),
                            const SizedBox(width: 3),
                            Expanded(
                              child: Text(
                                locationText,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.color
                                      ?.withValues(alpha: 0.7),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                // Close button
                GestureDetector(
                  onTap: onDismiss,
                  behavior: HitTestBehavior.opaque,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(8, 0, 4, 4),
                    child: Icon(
                      Icons.close,
                      size: 18,
                      color: isDark
                          ? AppColors.boldHeadlineColor2
                          : AppColors.boldHeadlineColor3,
                    ),
                  ),
                ),
              ],
            ),
          ),

          Divider(
            thickness: 0.5,
            height: 1,
            color: isDark
                ? AppColors.dividerColordark
                : AppColors.dividerColorlight,
          ),

          // ── Reading ───────────────────────────────────────────────
          Padding(
            padding:
                const EdgeInsets.only(left: 16, right: 16, top: 10, bottom: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // PM2.5 label
                    Row(
                      children: [
                        SvgPicture.asset(
                          isDark
                              ? 'assets/images/shared/pm_rating.svg'
                              : 'assets/images/shared/pm_rating_white.svg',
                        ),
                        const SizedBox(width: 3),
                        Text(
                          ' PM2.5',
                          style: TextStyle(
                            color: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.color,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    // Numeric reading
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          pmValue != null
                              ? pmValue.toStringAsFixed(1)
                              : '—',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 32,
                            color: Theme.of(context)
                                .textTheme
                                .headlineLarge
                                ?.color,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            ' μg/m³',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: Theme.of(context)
                                  .textTheme
                                  .headlineLarge
                                  ?.color,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // AQ category chip
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        color: aqColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        measurement.aqiCategory ?? 'Unknown',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: aqColor,
                        ),
                      ),
                    ),
                  ],
                ),

                // AQ emoji icon (mirrors AnalyticsCard 86→60 scaled)
                if (pmValue != null)
                  SvgPicture.asset(
                    getAirQualityIcon(measurement, pmValue),
                    width: 64,
                    height: 64,
                  )
                else
                  const Icon(Icons.help_outline, size: 52, color: Colors.grey),
              ],
            ),
          ),

          // ── View forecast — outlined secondary button (auth screen style) ──
          Padding(
            padding:
                const EdgeInsets.only(left: 16, right: 16, bottom: 14),
            child: GestureDetector(
              onTap: onViewForecast,
              child: Container(
                width: double.infinity,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.primaryColor,
                    width: 1.5,
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  'View forecast',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primaryColor,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
