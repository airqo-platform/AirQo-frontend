import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/pages/forecast_overview_page.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/forecast_utils.dart';
import 'package:airqo/src/meta/utils/utils.dart';

class NearbyMeasurementCard extends StatelessWidget with UiLoggy {
  final Measurement measurement;
  final String? fallbackLocationName;

  const NearbyMeasurementCard({
    super.key,
    required this.measurement,
    this.fallbackLocationName,
  });

  void _openForecast(BuildContext context) {
    ForecastOverviewPage.showForMeasurement(
      context,
      measurement: measurement,
      fallbackLocationName: fallbackLocationName,
    );
  }

  String _getLocationDescription(Measurement measurement) {
    final siteDetails = measurement.siteDetails;
    if (siteDetails == null) return "Unknown location";

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

  Color _getAqiColor(Measurement measurement) {
    return getAppAqiCategoryColor(measurement.aqiCategory ?? '');
  }

  Widget _chevron(BuildContext context) {
    return SvgPicture.asset(
      'assets/icons/chevron-right.svg',
      width: 20,
      height: 20,
      colorFilter: ColorFilter.mode(
        AppTextColors.modalCloseIcon(context),
        BlendMode.srcIn,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final locationColor = AppTextColors.muted(context);

    return InkWell(
      onTap: () => _openForecast(context),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: AppSurfaceColors.elevatedCardDecoration(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(
                  left: 16, right: 16, bottom: 16, top: 16),
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
                              measurement.siteDetails?.searchName ??
                                  measurement.siteDetails?.name ??
                                  fallbackLocationName ??
                                  "---",
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
                                SvgPicture.asset(
                                  'assets/images/shared/location_pin.svg',
                                  width: 14,
                                  height: 14,
                                  colorFilter: ColorFilter.mode(
                                    locationColor,
                                    BlendMode.srcIn,
                                  ),
                                ),
                                SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    _getLocationDescription(measurement),
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: locationColor,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 8, top: 2),
                        child: _chevron(context),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Divider(thickness: .5, color: Theme.of(context).dividerColor),
            Padding(
              padding: const EdgeInsets.only(
                  left: 16, right: 16, bottom: 16, top: 4),
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
                                  ? measurement.pm25!.value!.toStringAsFixed(1)
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
                        ],
                      ),
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
                  SizedBox(height: 16),
                  Wrap(
                    children: [
                      Container(
                        margin: EdgeInsets.only(bottom: 12),
                        padding:
                            EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: _getAqiColor(measurement).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          measurement.aqiCategory ?? "Unknown",
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: _getAqiColor(measurement),
                          ),
                          maxLines: 1,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
