import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/map/utils/map_aq_presentation.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';

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
    final aq = mapAqLevelFromPm25(measurement.pm25?.value ?? 0);
    return aq.color;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final pmValue = measurement.pm25?.value;
    final aqColor = _aqiColor();
    final locationText = _locationDescription(measurement);
    final dynamicAqIconPath =
        pmValue == null ? null : getAirQualityIcon(measurement, pmValue);
    final aqIconPath = pmValue == null
        ? null
        : dynamicAqIconPath?.isNotEmpty == true
            ? dynamicAqIconPath
            : mapAqLevelFromPm25(pmValue).asset;

    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkHighlight : Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.10),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(height: 3, color: aqColor),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
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
                                measurement.siteDetails?.searchName ??
                                    measurement.siteDetails?.name ??
                                    '—',
                                style: TextStyle(
                                  fontSize: 16,
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
                                const SizedBox(height: 2),
                                Text(
                                  locationText,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w400,
                                    color: isDark
                                        ? AppColors.boldHeadlineColor2
                                        : AppColors.boldHeadlineColor3,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ],
                          ),
                        ),
                        GestureDetector(
                          onTap: onDismiss,
                          behavior: HitTestBehavior.opaque,
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(8, 0, 0, 8),
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
                    const SizedBox(height: 12),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        if (aqIconPath != null)
                          SvgPicture.asset(
                            aqIconPath,
                            width: 36,
                            height: 36,
                          )
                        else
                          const Icon(Icons.help_outline,
                              size: 36, color: Colors.grey),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                measurement.aqiCategory ?? '',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: aqColor,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    pmValue != null
                                        ? pmValue.toStringAsFixed(1)
                                        : '—',
                                    style: TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.w800,
                                      color: Theme.of(context)
                                          .textTheme
                                          .titleLarge
                                          ?.color,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 3),
                                    child: Text(
                                      'µg/m³  PM2.5',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: isDark
                                            ? AppColors.boldHeadlineColor2
                                            : AppColors.boldHeadlineColor3,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    GestureDetector(
                      onTap: onViewForecast,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppColors.primaryColor.withValues(alpha: 0.14)
                              : AppColors.primaryColor.withValues(alpha: 0.07),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: AppColors.primaryColor.withValues(
                              alpha: isDark ? 0.22 : 0.14,
                            ),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(left: 14),
                              child: Text(
                                'view forecast',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primaryColor,
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.only(right: 14),
                              child: Icon(
                                Icons.arrow_forward_ios,
                                size: 13,
                                color: AppColors.primaryColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
