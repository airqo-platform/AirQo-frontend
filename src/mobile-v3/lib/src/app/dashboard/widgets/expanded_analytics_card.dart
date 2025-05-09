import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';

class ExpandedAnalyticsCard extends StatefulWidget {
  final Measurement measurement;

  const ExpandedAnalyticsCard(this.measurement, {super.key});

  @override
  State<ExpandedAnalyticsCard> createState() => _ExpandedAnalyticsCardState();
}

class _ExpandedAnalyticsCardState extends State<ExpandedAnalyticsCard> with UiLoggy {
  void _showAnalyticsDetails(BuildContext context, Measurement measurement) {
    showBottomSheet(
      backgroundColor: Colors.transparent,
      context: context,
      builder: (context) {
        return AnalyticsDetails(
          measurement: measurement,
        );
      },
    );
  }

  Color _getAqiColor(Measurement measurement) {
    if (measurement.aqiColor != null) {
      try {
        final colorStr = measurement.aqiColor!.replaceAll('#', '');
        return Color(int.parse('0xFF$colorStr'));
      } catch (e) {
        loggy.warning('Failed to parse AQI color: ${measurement.aqiColor}');
      }
    }

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

  String _getHealthTipTagline() {
    // Get health tip from measurement if available
    if (widget.measurement.healthTips != null && 
        widget.measurement.healthTips!.isNotEmpty && 
        widget.measurement.healthTips![0].title != null) {
      return widget.measurement.healthTips![0].title!;
    }
    
    // Default tagline based on AQI category
    switch (widget.measurement.aqiCategory?.toLowerCase() ?? '') {
      case 'good':
        return "Enjoy outdoor activities in good air quality";
      case 'moderate':
        return "Air quality is acceptable for most people";
      case 'unhealthy for sensitive groups':
      case 'u4sg':
        return "Sensitive groups should limit outdoor exertion";
      case 'unhealthy':
        return "Everyone should reduce prolonged outdoor activities";
      case 'very unhealthy':
        return "Everyone should avoid outdoor activities";
      case 'hazardous':
        return "Everyone should avoid all outdoor activities";
      default:
        return "Stay informed about air quality";
    }
  }

  String? _getHealthTipDescription() {
    // Get health tip description from measurement if available
    if (widget.measurement.healthTips != null && 
        widget.measurement.healthTips!.isNotEmpty && 
        widget.measurement.healthTips![0].description != null) {
      return widget.measurement.healthTips![0].description!;
    }
    
    // No default fallbacks - return null if no health tip found
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final String healthTipTagline = _getHealthTipTagline();
    final String? healthTipDescription = _getHealthTipDescription();

    return Column(
      children: [
        InkWell(
          onTap: () => _showAnalyticsDetails(context, widget.measurement),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Theme.of(context).highlightColor,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(
                    left: 16,
                    right: 16,
                    bottom: 16,
                    top: 4,
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
                                    widget.measurement.pm25?.value != null
                                        ? widget.measurement.pm25!.value!
                                            .toStringAsFixed(2)
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
                              child: widget.measurement.pm25?.value != null
                                  ? SvgPicture.asset(
                                      getAirQualityIcon(
                                        widget.measurement,
                                        widget.measurement.pm25!.value!,
                                      ),
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
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: _getAqiColor(widget.measurement)
                                  .withOpacity(0.15),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              widget.measurement.aqiCategory ?? "Unknown",
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: _getAqiColor(widget.measurement),
                              ),
                              maxLines: 1,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Divider(
                  thickness: 0.5,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.black
                      : Colors.white,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  child: Text(
                    healthTipTagline,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.color,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Theme.of(context).brightness == Brightness.dark
                ? const Color(0xFF2A3744)
                : const Color(0xFFEAEFF5),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.medical_services_outlined,
                      color: Colors.red,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      "Today's health tip",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color:
                            Theme.of(context).textTheme.bodyMedium?.color,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                healthTipDescription != null 
                ? Text(
                    healthTipDescription,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: Theme.of(context).textTheme.bodyLarge?.color,
                    ),
                  )
                : Text(
                    "Health tip not available for this air quality level.",
                    style: TextStyle(
                      fontSize: 15,
                      fontStyle: FontStyle.italic,
                      color: Theme.of(context).textTheme.bodyLarge?.color?.withOpacity(0.7),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}