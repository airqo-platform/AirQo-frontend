import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/pages/forecast_overview_page.dart';
import 'package:airqo/src/app/dashboard/utils/measurement_location_utils.dart';
import 'package:airqo/src/app/dashboard/widgets/air_quality_share_sheet.dart';
import 'package:airqo/src/app/dashboard/widgets/expanded_analytics_card.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_forecast_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class AnalyticsSpecifics extends StatefulWidget {
  final Measurement measurement;
  final String? fallbackLocationName;
  const AnalyticsSpecifics(
      {super.key, required this.measurement, this.fallbackLocationName});

  @override
  State<AnalyticsSpecifics> createState() => _AnalyticsSpecificsState();
}

class _AnalyticsSpecificsState extends State<AnalyticsSpecifics> {
  double containerHeight = 90;
  bool expanded = false;
  final GlobalKey _shareButtonKey = GlobalKey();

  @override
  void initState() {
    super.initState();
  }

  void toggleContainer() {
    setState(() {
      if (expanded) {
        containerHeight = 90;
        expanded = false;
      } else {
        containerHeight = 180;
        expanded = true;
      }
    });
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

  Future<void> _shareAirQuality() async {
    final renderObject =
        _shareButtonKey.currentContext?.findRenderObject() as RenderBox?;
    final shareOrigin = renderObject == null
        ? null
        : renderObject.localToGlobal(Offset.zero) & renderObject.size;

    await showAirQualityShareSheet(
      context,
      measurement: widget.measurement,
      fallbackLocationName: widget.fallbackLocationName,
      sharePositionOrigin: shareOrigin,
    );
  }

  @override
  Widget build(BuildContext context) {
    final nameColor = Theme.of(context).textTheme.headlineSmall?.color;
    final subtitleColor =
        Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.7);

    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Text(
                        widget.measurement.siteDetails?.searchName ??
                            widget.measurement.siteDetails?.name ??
                            widget.fallbackLocationName ??
                            "---",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 24,
                          color: nameColor,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextButton.icon(
                          key: _shareButtonKey,
                          onPressed: _shareAirQuality,
                          icon: SvgPicture.asset(
                            'assets/icons/share-icon.svg',
                            width: 18,
                            height: 18,
                            colorFilter: ColorFilter.mode(
                              AppColors.primaryColor,
                              BlendMode.srcIn,
                            ),
                          ),
                          label: const TranslatedText('Share'),
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.primaryColor,
                          ),
                        ),
                        InkWell(
                          onTap: () => Navigator.pop(context),
                          child: Icon(
                            Icons.close,
                            color: AppTextColors.modalCloseIcon(context),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    SvgPicture.asset(
                      'assets/images/shared/location_pin.svg',
                      width: 14,
                      height: 14,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        _getLocationDescription(widget.measurement),
                        style: TextStyle(
                          fontSize: 14,
                          color: subtitleColor,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    TranslatedText(
                      "Today",
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 20,
                        color: nameColor,
                      ),
                    ),
                    if (widget.measurement.siteDetails?.id != null)
                      TextButton(
                        onPressed: () {
                          ForecastOverviewPage.show(
                            context,
                            siteId: widget.measurement.siteDetails!.id!,
                            siteName: measurementDisplayName(
                              widget.measurement,
                              fallbackLocationName: widget.fallbackLocationName,
                            ),
                            locationDescription: measurementLocationDescription(
                              widget.measurement,
                            ),
                            measurement: widget.measurement,
                          );
                        },
                        child: TranslatedText(
                          'Full forecast',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.primaryColor,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                if (widget.measurement.siteDetails?.id != null)
                  AnalyticsForecastWidget(
                    siteId: widget.measurement.siteDetails!.id!,
                  )
                else
                  const Center(
                    child: TranslatedText("Forecast not available"),
                  ),
                const SizedBox(height: 16),
              ],
            ),
          ),
          SafeArea(
            child: ExpandedAnalyticsCard(
              widget.measurement,
            ),
          ),
        ],
      ),
    );
  }
}
