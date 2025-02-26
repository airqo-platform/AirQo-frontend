import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

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

class _SwipeableAnalyticsCardState extends State<SwipeableAnalyticsCard> {
  // Offset to track the swipe position
  double _dragOffset = 0;
  // Set to true when the delete option is showing
  bool _isDeleteVisible = false;
  // Animation controller for smoother transitions
  final GlobalKey _cardKey = GlobalKey();

  // Width of the delete button area
  final double _deleteWidth = 80.0;

  void _showAnalyticsDetails() {
    // If we're in delete mode, don't show details
    if (_isDeleteVisible || _dragOffset < 0) return;
    
    showBottomSheet(
      backgroundColor: Colors.transparent,
      context: context,
      builder: (context) {
        return AnalyticsDetails(
          measurement: widget.measurement,
        );
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Delete option (shown when swiped)
        if (_isDeleteVisible || _dragOffset < 0)
          Positioned(
            top: 0,
            bottom: 0,
            right: 0,
            child: GestureDetector(
              onTap: () {
                // When delete button is clicked
                widget.onRemove(widget.measurement.id ?? '');
                setState(() {
                  _dragOffset = 0;
                  _isDeleteVisible = false;
                });
              },
              child: Container(
                width: _deleteWidth,
                color: Colors.red,
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

        // The main card content
        GestureDetector(
          onTap: _showAnalyticsDetails, // Show analytics details when tapped
          onHorizontalDragStart: (details) {
            // Start tracking the drag
          },
          onHorizontalDragUpdate: (details) {
            // Only allow swipe to left (negative offset)
            if (details.delta.dx < 0 || _dragOffset < 0) {
              setState(() {
                _dragOffset += details.delta.dx;
                // Limit the drag so it doesn't go beyond the delete button width
                if (_dragOffset < -_deleteWidth) {
                  _dragOffset = -_deleteWidth;
                } else if (_dragOffset > 0) {
                  _dragOffset = 0;
                }
              });
            }
          },
          onHorizontalDragEnd: (details) {
            // Determine whether to snap to delete button or snap back
            if (_dragOffset < -_deleteWidth / 2) {
              // Snap to show delete button
              setState(() {
                _dragOffset = -_deleteWidth;
                _isDeleteVisible = true;
              });
            } else {
              // Snap back
              setState(() {
                _dragOffset = 0;
                _isDeleteVisible = false;
              });
            }
          },
          child: Transform.translate(
            offset: Offset(_dragOffset, 0),
            child: Container(
              key: _cardKey,
              color: Theme.of(context).highlightColor,
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
                                          color: Theme.of(context).textTheme.headlineSmall?.color,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Row(children: [
                                    Text(
                                      widget.measurement.pm25!.value != null
                                          ? widget.measurement.pm25!.value!
                                              .toStringAsFixed(2)
                                          : "-",
                                      style: TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 40,
                                          color: Theme.of(context).textTheme.headlineLarge?.color
                                      ),
                                    ),
                                    Text(" μg/m³",
                                        style: TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 20,
                                            color: Theme.of(context).textTheme.headlineLarge?.color
                                        )
                                    )
                                  ]),
                                ]),
                            SizedBox(
                              child: Center(
                                child: SvgPicture.asset(
                                  getAirQualityIcon(widget.measurement, widget.measurement.pm25!.value!),
                                  height: 96,
                                  width: 96,
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
                        Text(widget.measurement.siteDetails!.name ?? "",
                            style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w700,
                                color: Theme.of(context).textTheme.headlineSmall?.color
                            )
                        ),
                        Text(widget.measurement.healthTips != null && widget.measurement.healthTips!.isNotEmpty 
                              ? widget.measurement.healthTips![0].description ?? "Air quality information"
                              : "Air quality information",
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w600,
                                color: Theme.of(context).textTheme.headlineMedium?.color
                            )
                        )
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