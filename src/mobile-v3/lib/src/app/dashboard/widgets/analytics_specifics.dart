import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/expanded_analytics_card.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_forecast_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/services.dart';
import 'dart:io';

class AnalyticsSpecifics extends StatefulWidget {
  final Measurement measurement;
  const AnalyticsSpecifics({super.key, required this.measurement});

  @override
  State<AnalyticsSpecifics> createState() => _AnalyticsSpecificsState();
}

class _AnalyticsSpecificsState extends State<AnalyticsSpecifics> {
  double containerHeight = 90;
  bool expanded = false;

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

  void _shareAirQualityData() async {
    try {
      final location = _getLocationDescription(widget.measurement);
      //final locationId = widget.measurement.siteId ?? '';
      final deepLink =
          'https://airqo.net/products/mobile-app';

      final shareText = '''
Check out the Air Quality of $location on the AirQo app!
👉 $deepLink
''';
      // Load AirQo logo from assets
      final byteData = await rootBundle.load('assets/images/airQo_logo.png');

      final tempDir = await getTemporaryDirectory();
      final logoFile = await File(
              '${tempDir.path}/airqo_logo_${DateTime.now().millisecondsSinceEpoch}.png')
          .writeAsBytes(
        byteData.buffer.asUint8List(),
      );

      // Share with logo and text
      await Share.shareXFiles(
        [XFile(logoFile.path)],
        text: shareText,
        subject: 'Air Quality Update from AirQo',
      );
    } catch (e) {
      print("Error sharing data: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
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
                            "Unnamed Site",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 24,
                          color: AppColors.boldHeadlineColor4,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Share button with emoji
                        InkWell(
                          onTap: _shareAirQualityData,
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            child: SvgPicture.asset(
                              "assets/icons/share-icon.svg",
                              height: 24,
                              width: 24,
                              colorFilter: ColorFilter.mode(
                                AppColors.boldHeadlineColor4,
                                BlendMode.srcIn,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(width: 8),
                      ],
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
                    child: Text("Forecast not available"),
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
