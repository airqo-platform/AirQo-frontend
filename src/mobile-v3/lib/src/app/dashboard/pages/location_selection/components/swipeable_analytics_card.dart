import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';

class SwipeableAnalyticsCard extends StatefulWidget {
  final Measurement measurement;
  final Function(String) onRemove;

  const SwipeableAnalyticsCard({
    required this.measurement,
    required this.onRemove,
    super.key,
  });

  @override
  State<SwipeableAnalyticsCard> createState() => _SwipeableAnalyticsCardState();
}

class _SwipeableAnalyticsCardState extends State<SwipeableAnalyticsCard>
    with UiLoggy {
  double _dragOffset = 0;
  bool _isDeleteVisible = false;
  final double _deleteWidth = 80.0;

  void _showAnalyticsDetails() {
    if (_isDeleteVisible || _dragOffset < 0) return;

    showBottomSheet(
        backgroundColor: Colors.transparent,
        context: context,
        builder: (context) {
          return AnalyticsDetails(
            measurement: widget.measurement,
          );
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

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (_isDeleteVisible || _dragOffset < 0)
          Positioned(
            top: 0,
            bottom: 0,
            right: 0,
            child: GestureDetector(
              onTap: () {
                widget.onRemove(widget.measurement.id ?? '');
                setState(() {
                  _dragOffset = 0;
                  _isDeleteVisible = false;
                });
              },
              child: Container(
                width: _deleteWidth,
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.only(
                    topRight: Radius.circular(12),
                    bottomRight: Radius.circular(12),
                  ),
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.delete_outline,
                      color: Colors.white,
                      size: 24,
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Remove',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        GestureDetector(
          onTap: _showAnalyticsDetails,
          onHorizontalDragStart: (details) {},
          onHorizontalDragUpdate: (details) {
            if (details.delta.dx < 0 || _dragOffset < 0) {
              setState(() {
                _dragOffset += details.delta.dx;
                if (_dragOffset < -_deleteWidth) {
                  _dragOffset = -_deleteWidth;
                } else if (_dragOffset > 0) {
                  _dragOffset = 0;
                }
              });
            }
          },
          onHorizontalDragEnd: (details) {
            if (_dragOffset < -_deleteWidth / 2) {
              setState(() {
                _dragOffset = -_deleteWidth;
                _isDeleteVisible = true;
              });
            } else {
              setState(() {
                _dragOffset = 0;
                _isDeleteVisible = false;
              });
            }
          },
          child: Transform.translate(
            offset: Offset(_dragOffset, 0),
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
                        left: 16, right: 16, bottom: 16, top: 16),
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
                                    widget.measurement.siteDetails
                                            ?.searchName ??
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
                                          _getLocationDescription(
                                              widget.measurement),
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
                                ],
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
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    SvgPicture.asset(Theme.of(context)
                                                .brightness ==
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
                                child: widget.measurement.pm25?.value != null
                                    ? SvgPicture.asset(
                                        getAirQualityIcon(widget.measurement,
                                            widget.measurement.pm25!.value!),
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
                            margin: EdgeInsets.only(
                                bottom: 12),
                            padding: EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
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
                          ]
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
