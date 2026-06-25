import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/forecast_utils.dart';
import 'package:airqo/src/meta/utils/utils.dart';

String _locationDescription(Measurement measurement) {
  final siteDetails = measurement.siteDetails;
  if (siteDetails == null) return '';

  final parts = <String>[];

  if (siteDetails.city?.isNotEmpty == true) {
    parts.add(siteDetails.city!);
  } else if (siteDetails.town?.isNotEmpty == true) {
    parts.add(siteDetails.town!);
  }

  if (siteDetails.region?.isNotEmpty == true) {
    parts.add(siteDetails.region!);
  } else if (siteDetails.county?.isNotEmpty == true) {
    parts.add(siteDetails.county!);
  }

  if (siteDetails.country?.isNotEmpty == true) {
    parts.add(siteDetails.country!);
  }

  return parts.isNotEmpty
      ? parts.join(', ')
      : siteDetails.locationName ??
          siteDetails.formattedName ??
          '';
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
    return getAppAqiCategoryColor(measurement.aqiCategory ?? '');
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final pmValue = measurement.pm25?.value;
    final aqColor = _aqiColor();
    final aqLabel = pmValue == null
        ? 'No data'
        : (measurement.aqiCategory?.isNotEmpty == true
            ? measurement.aqiCategory!
            : 'Unknown');
    String? aqiIconPath;
    if (pmValue != null) {
      final path = getAirQualityIcon(measurement, pmValue);
      aqiIconPath = path.isNotEmpty
          ? path
          : 'assets/images/shared/airquality_indicators/unavailable.svg';
    }
    final locationText = _locationDescription(measurement);
    final locationName = measurement.siteDetails?.searchName ??
        measurement.siteDetails?.name ??
        '—';

    return Container(
      decoration: AppSurfaceColors.elevatedCardDecoration(context),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        locationName,
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
                        Row(
                          children: [
                            SvgPicture.asset(
                              'assets/images/shared/location_pin.svg',
                              width: 12,
                              height: 12,
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                locationText,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppTextColors.muted(context),
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
                GestureDetector(
                  onTap: onDismiss,
                  behavior: HitTestBehavior.opaque,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(4, 0, 0, 0),
                    child: Icon(
                      Icons.close,
                      size: 18,
                      color: AppTextColors.modalCloseIcon(context),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Divider(
            thickness: 0.5,
            height: 1,
            color: Theme.of(context).dividerColor,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            SvgPicture.asset(
                              isDark
                                  ? 'assets/images/shared/pm_rating.svg'
                                  : 'assets/images/shared/pm_rating_white.svg',
                              height: 14,
                            ),
                            Text(
                              ' PM2.5',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: Theme.of(context)
                                    .textTheme
                                    .headlineSmall
                                    ?.color,
                              ),
                            ),
                          ],
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
                            Padding(
                              padding: const EdgeInsets.only(bottom: 2),
                              child: Text(
                                ' μg/m³',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Theme.of(context)
                                      .textTheme
                                      .titleLarge
                                      ?.color,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    if (aqiIconPath != null)
                      SvgPicture.asset(
                        aqiIconPath,
                        width: 36,
                        height: 36,
                      )
                    else
                      const Icon(
                        Icons.help_outline,
                        size: 36,
                        color: Colors.grey,
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: aqColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    aqLabel,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: aqColor,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: onViewForecast,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTextColors.headline(context),
                      backgroundColor: AppSurfaceColors.card(context),
                      side: AppSurfaceColors.borderSide(context),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      textStyle: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        const Text('View forecast'),
                        const SizedBox(width: 4),
                        SvgPicture.asset(
                          'assets/icons/chevron-right.svg',
                          width: 14,
                          height: 14,
                          colorFilter: ColorFilter.mode(
                            AppTextColors.headline(context),
                            BlendMode.srcIn,
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
    );
  }
}
