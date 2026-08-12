import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/pages/forecast_overview_page.dart';
import 'package:airqo/src/app/dashboard/widgets/measurement_card_tour.dart';
import 'package:airqo/src/app/dashboard/widgets/measurement_card_action_strip.dart';
import 'package:airqo/src/app/dashboard/widgets/measurement_card_gestures.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/forecast_utils.dart';
import 'package:airqo/src/meta/utils/utils.dart';

/// Shimmer skeleton matching [NearbyMeasurementCard]'s layout, shown per-slot
/// while nearby measurements are still being resolved (location + dashboard
/// fetch), so the "Near You" tab doesn't show a single blocking spinner.
class NearbyMeasurementCardLoader extends StatelessWidget {
  const NearbyMeasurementCardLoader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: AppSurfaceColors.elevatedCardDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding:
                const EdgeInsets.only(left: 16, right: 16, bottom: 16, top: 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ShimmerText(width: 140, height: 20),
                      SizedBox(height: 8),
                      ShimmerText(width: 100, height: 12),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Divider(thickness: .5, color: Theme.of(context).dividerColor),
          Padding(
            padding:
                const EdgeInsets.only(left: 16, right: 16, bottom: 16, top: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ShimmerText(width: 70, height: 14),
                    SizedBox(height: 8),
                    ShimmerText(width: 90, height: 30),
                  ],
                ),
                ShimmerContainer(height: 86, width: 86, borderRadius: 100),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class NearbyMeasurementCard extends StatefulWidget {
  final Measurement measurement;
  final String? fallbackLocationName;
  final MeasurementCardTourKeys? tourKeys;
  final VoidCallback? onTourTargetReady;

  const NearbyMeasurementCard({
    super.key,
    required this.measurement,
    this.fallbackLocationName,
    this.tourKeys,
    this.onTourTargetReady,
  });

  @override
  State<NearbyMeasurementCard> createState() => _NearbyMeasurementCardState();
}

class _NearbyMeasurementCardState extends State<NearbyMeasurementCard>
    with UiLoggy {
  final GlobalKey _defaultShareButtonKey = GlobalKey();
  bool _tourReadyNotified = false;

  GlobalKey get _shareButtonKey => _defaultShareButtonKey;

  @override
  void initState() {
    super.initState();
    if (widget.tourKeys != null) {
      scheduleMeasurementCardTourReady(
        keys: widget.tourKeys!,
        onReady: _notifyTourTargetReady,
        isActive: () => mounted && !_tourReadyNotified,
      );
    }
  }

  void _notifyTourTargetReady() {
    if (_tourReadyNotified || !mounted || widget.onTourTargetReady == null) {
      return;
    }
    _tourReadyNotified = true;
    widget.onTourTargetReady!();
  }

  void _openForecast() {
    ForecastOverviewPage.showForMeasurement(
      context,
      measurement: widget.measurement,
      fallbackLocationName: widget.fallbackLocationName,
    );
  }

  Future<void> _openShare(String source) {
    return openMeasurementShareSheet(
      context,
      measurement: widget.measurement,
      source: source,
      fallbackLocationName: widget.fallbackLocationName,
      shareButtonKey: _shareButtonKey,
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

  @override
  Widget build(BuildContext context) {
    final measurement = widget.measurement;
    final locationColor = AppTextColors.muted(context);

    return Container(
      key: widget.tourKeys?.cardKey,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: AppSurfaceColors.elevatedCardDecoration(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
                  padding: const EdgeInsets.fromLTRB(
                    kMeasurementCardHorizontalPadding,
                    kMeasurementCardTopPadding,
                    kMeasurementCardHorizontalPadding,
                    16,
                  ),
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
                                  widget.fallbackLocationName ??
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
                            const SizedBox(height: 4),
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
                                const SizedBox(width: 4),
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
                      MeasurementCardHeaderShare(
                        shareButtonKey: _shareButtonKey,
                        onShare: () => _openShare('dashboard_card'),
                      ),
                    ],
                  ),
                ),
                MeasurementCardTapLayer(
                  onForecast: _openForecast,
                  onShareDoubleTap: () =>
                      _openShare('dashboard_card_double_tap'),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Divider(
                          thickness: .5, color: Theme.of(context).dividerColor),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(
                          kMeasurementCardHorizontalPadding,
                          4,
                          kMeasurementCardHorizontalPadding,
                          8,
                        ),
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
                                          Theme.of(context).brightness ==
                                                  Brightness.light
                                              ? "assets/images/shared/pm_rating_white.svg"
                                              : 'assets/images/shared/pm_rating.svg',
                                        ),
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
                                    Row(
                                      children: [
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
                                                ?.color,
                                          ),
                                        ),
                                        Text(
                                          " μg/m³",
                                          style: TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 18,
                                            color: Theme.of(context)
                                                .textTheme
                                                .headlineLarge
                                                ?.color,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  child: Center(
                                    child: measurement.pm25?.value != null
                                        ? SvgPicture.asset(
                                            getAirQualityIcon(measurement,
                                                measurement.pm25!.value!),
                                            height: 86,
                                            width: 86,
                                          )
                                        : const Icon(
                                            Icons.help_outline,
                                            size: 60,
                                            color: Colors.grey,
                                          ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Wrap(
                              children: [
                                Container(
                                  margin: EdgeInsets.zero,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: _getAqiColor(measurement)
                                        .withValues(alpha: 0.15),
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
          MeasurementCardFooterForecast(
            onForecast: _openForecast,
          ),
        ],
      ),
    );
  }
}
