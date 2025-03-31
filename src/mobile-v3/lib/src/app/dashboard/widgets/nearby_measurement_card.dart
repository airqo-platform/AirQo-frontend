import 'package:flutter/material.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:flutter_svg/svg.dart';

class NearbyMeasurementCard extends StatelessWidget with UiLoggy{
  final Measurement measurement;
  final double distance;

  const NearbyMeasurementCard({
    super.key,
    required this.measurement,
    required this.distance,
  });

  void _showAnalyticsDetails(BuildContext context, Measurement measurement) {
    showBottomSheet(
        backgroundColor: Colors.transparent,
        context: context,
        builder: (context) {
          return AnalyticsDetails(
            measurement: measurement,
          );
        });
  }

  // Helper method to get a description of the location
  String _getLocationDescription(Measurement measurement) {
    final siteDetails = measurement.siteDetails;
    if (siteDetails == null) return "Unknown location";

    // Try to build a meaningful location string
    final List<String> locationParts = [];

    if (siteDetails.city != null && siteDetails.city!.isNotEmpty) {
      locationParts.add(siteDetails.city!);
    } else if (siteDetails.town != null && siteDetails.town!.isNotEmpty) {
      locationParts.add(siteDetails.town!);
    }

    if (siteDetails.region != null && siteDetails.region!.isNotEmpty) {
      locationParts.add(siteDetails.region!);
    } else if (siteDetails.county != null && siteDetails.county!.isNotEmpty) {
      locationParts.add(siteDetails.county!);
    }

    if (siteDetails.country != null && siteDetails.country!.isNotEmpty) {
      locationParts.add(siteDetails.country!);
    }

    return locationParts.isNotEmpty
        ? locationParts.join(", ")
        : siteDetails.locationName ??
            siteDetails.formattedName ??
            "Unknown location";
  }

  // Helper method to get color based on AQI category
  Color _getAqiColor(Measurement measurement) {
    if (measurement.aqiColor != null) {
      // Try to parse the color from the API response
      try {
        final colorStr = measurement.aqiColor!.replaceAll('#', '');
        return Color(int.parse('0xFF$colorStr'));
      } catch (e) {
        loggy.warning('Failed to parse AQI color: ${measurement.aqiColor}');
      }
    }

    // Fallback based on category
    switch (measurement.aqiCategory?.toLowerCase() ?? '') {
      case 'good':
        return Colors.green;
      case 'moderate':
        return Colors.yellow.shade700;
      case 'unhealthy for sensitive groups':
      case 'u4sg':
        return Colors.orange;
      case 'unhealthy':
        return Colors.red;
      case 'very unhealthy':
        return Colors.purple;
      case 'hazardous':
        return Colors.brown;
      default:
        return AppColors.primaryColor;
    }
  }


  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => _showAnalyticsDetails(context, measurement),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: Theme.of(context).highlightColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 4,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(
                  left: 16, right: 16, bottom: 4, top: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                SvgPicture.asset(Theme.of(context).brightness ==
                                        Brightness.light
                                    ? "assets/images/shared/pm_rating_white.svg"
                                    : 'assets/images/shared/pm_rating.svg'),
                                const SizedBox(width: 2),
                                Text(
                                  " PM2.5",
                                  style: TextStyle(
                                    color: Theme.of(context)
                                        .textTheme
                                        .headlineSmall
                                        ?.color,
                                  ),
                                ),
                              ],
                            ),
                            Row(children: [
                              Text(
                                measurement.pm25?.value != null
                                    ? measurement.pm25!.value!
                                        .toStringAsFixed(1)
                                    : "-",
                                style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 36,
                                    color: Theme.of(context)
                                        .textTheme
                                        .headlineLarge
                                        ?.color),
                              ),
                              Text(" μg/m³",
                                  style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 18,
                                      color: Theme.of(context)
                                          .textTheme
                                          .headlineLarge
                                          ?.color))
                            ]),
                          ]),
                      SizedBox(
                        child: Center(
                          child: measurement.pm25?.value != null
                              ? SvgPicture.asset(
                                  getAirQualityIcon(
                                      measurement, measurement.pm25!.value!),
                                  height: 86,
                                  width: 86,
                                )
                              : Icon(
                                  Icons.help_outline,
                                  size: 60,
                                  color: Colors.grey,
                                ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Divider(
                thickness: .5,
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.black
                    : Colors.white),
            Padding(
              padding: const EdgeInsets.only(
                  left: 16, right: 16, bottom: 16, top: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              measurement.siteDetails?.name ??
                                  "Unknown Location",
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: Theme.of(context)
                                    .textTheme
                                    .headlineSmall
                                    ?.color,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(
                                  Icons.location_on,
                                  size: 14,
                                  color: AppColors.primaryColor,
                                ),
                                SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    _getLocationDescription(measurement),
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.color
                                          ?.withOpacity(0.7),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(
                                  Icons.near_me,
                                  size: 14,
                                  color: AppColors.primaryColor,
                                ),
                                SizedBox(width: 4),
                                Text(
                                  "${distance.toStringAsFixed(1)} km away",
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.primaryColor,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Column(
                        children: [
                          Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color:
                                  _getAqiColor(measurement).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              measurement.aqiCategory ?? "Unknown",
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: _getAqiColor(measurement),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (measurement.healthTips != null &&
                      measurement.healthTips!.isNotEmpty) ...[
                    SizedBox(height: 12),
                    Text(
                      measurement.healthTips![0].description ??
                          "No health tips available",
                      style: TextStyle(
                        fontSize: 14,
                        fontStyle: FontStyle.italic,
                        color: Theme.of(context).textTheme.bodyMedium?.color,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
