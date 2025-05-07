import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/expanded_analytics_card.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_forecast_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class AnalyticsSpecifics extends StatefulWidget {
  final Measurement measurement;
  const AnalyticsSpecifics({super.key, required this.measurement});

  @override
  State<AnalyticsSpecifics> createState() => _AnalyticsSpecificsState();
}

class _AnalyticsSpecificsState extends State<AnalyticsSpecifics> {
  double containerHeight = 90;
  bool expanded = false;

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

  @override
  Widget build(BuildContext context) {
    final siteDetails = widget.measurement.siteDetails;
    if (siteDetails == null) {
      return const Center(
        child: Text("No site details available"),
      );
    }

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
                        siteDetails.searchName ?? "Unnamed Site",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 24,
                          color: AppColors.boldHeadlineColor,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    InkWell(
                      onTap: () => Navigator.pop(context),
                      child: Icon(
                        Icons.close,
                        color: AppColors.boldHeadlineColor,
                      ),
                    )
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      size: 14,
                      color: AppColors.primaryColor,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        _getLocationDescription(widget.measurement),
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
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      "Today",
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 20,
                        color: AppColors.boldHeadlineColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                siteDetails.id != null
                    ? AnalyticsForecastWidget(
                        siteId: siteDetails.id!,
                      )
                    : const Center(
                        child: Text("Forecast not available"),
                      ),
                const SizedBox(height: 16),
              ],
            ),
          ),
          SafeArea(
            child: ExpandedAnalyticsCard(widget.measurement),
          ),
        ],
      ),
    );
  }
}