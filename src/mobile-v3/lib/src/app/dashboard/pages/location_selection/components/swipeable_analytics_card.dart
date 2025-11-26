import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'dart:async';

class SwipeableAnalyticsCard extends StatefulWidget {
  final Measurement measurement;
  final Function(String) onRemove;
  final String? fallbackLocationName;

  const SwipeableAnalyticsCard({
    required this.measurement,
    required this.onRemove,
    this.fallbackLocationName,
    super.key,
  });

  @override
  State<SwipeableAnalyticsCard> createState() => _SwipeableAnalyticsCardState();
}

class _SwipeableAnalyticsCardState extends State<SwipeableAnalyticsCard>
    with UiLoggy, TickerProviderStateMixin {
  double _dragOffset = 0;
  bool _isDeleteVisible = false;
  final double _deleteWidth = 80.0;

  Timer? _autoHideTimer;

  bool _showTooltip = false;
  AnimationController? _tooltipController;
  AnimationController? _shakeController;
  Animation<double>? _tooltipFadeAnimation;
  Animation<double>? _shakeAnimation;

  @override
  void initState() {
    super.initState();

    _tooltipController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _shakeController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _tooltipFadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _tooltipController!,
      curve: Curves.easeInOut,
    ));

    _shakeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _shakeController!,
      curve: Curves.elasticOut,
    ));

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showHelpTooltip();
    });
  }

  @override
  void dispose() {
    _autoHideTimer?.cancel();
    _tooltipController?.dispose();
    _shakeController?.dispose();
    super.dispose();
  }

  void _showHelpTooltip() {
    if (_tooltipController == null || _shakeController == null) return;

    setState(() {
      _showTooltip = true;
    });
    _tooltipController!.forward();
    _shakeController!.forward();

    _autoHideTimer?.cancel();
    _autoHideTimer = Timer(const Duration(seconds: 5), () {
      _hideTooltip();
    });
  }

  void _hideTooltip() {
    if (_tooltipController == null || _shakeController == null) return;

    _autoHideTimer?.cancel();

    _tooltipController!.reverse().then((_) {
      if (mounted) {
        setState(() {
          _showTooltip = false;
        });
      }
    });
    _shakeController!.reset();
  }

  Widget _buildTooltip() {
    return Positioned(
      top: 0,
      left: 16,
      right: 16,
      child: FadeTransition(
        opacity: _tooltipFadeAnimation ?? const AlwaysStoppedAnimation(1.0),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            color: Colors.black87,
            borderRadius: BorderRadius.circular(8),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.swipe_left,
                color: Colors.white,
                size: 16,
              ),
              const SizedBox(width: 8),
              const Text(
                'Swipe left to remove location',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: _hideTooltip,
                child: const Icon(
                  Icons.close,
                  color: Colors.white54,
                  size: 16,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAnalyticsDetails() {
    if (_isDeleteVisible || _dragOffset < 0) return;

    showBottomSheet(
        backgroundColor: Colors.transparent,
        context: context,
        builder: (context) {
          return AnalyticsDetails(
            measurement: widget.measurement,
            fallbackLocationName: widget.fallbackLocationName,
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

  void _handleRemove() {
    final String siteId = widget.measurement.siteId ?? '';

    if (siteId.isEmpty) {
      loggy.warning('Cannot remove location: siteId is empty');
      final String measurementId = widget.measurement.id ?? '';
      if (measurementId.isNotEmpty) {
        loggy.info('Using measurement ID instead: $measurementId');
        widget.onRemove(measurementId);
      } else {
        loggy.error('Both siteId and id are empty, cannot remove location');
      }
    } else {
      loggy.info('Removing location with siteId: $siteId');
      widget.onRemove(siteId);
    }

    setState(() {
      _dragOffset = 0;
      _isDeleteVisible = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        if (_isDeleteVisible || _dragOffset < 0)
          Positioned(
            top: 0,
            bottom: 0,
            right: 0,
            child: GestureDetector(
              onTap: _handleRemove,
              child: Container(
                width: _deleteWidth,
                decoration: const BoxDecoration(
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
                                          const SizedBox(height: 4),
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
        AnimatedBuilder(
          animation: _shakeAnimation ?? const AlwaysStoppedAnimation(0.0),
          builder: (context, child) {
            final shakeOffset = (_shakeAnimation?.value ?? 0.0) * 15.0;

            return GestureDetector(
              onTap: _showAnalyticsDetails,
              onLongPress: _showHelpTooltip,
              onHorizontalDragStart: (details) {
                if (_showTooltip) {
                  _hideTooltip();
                }
              },
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
                offset: Offset(_dragOffset + shakeOffset, 0),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Theme.of(context).cardColor,
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
                                        widget.measurement.siteDetails?.searchName ??
                                            widget.measurement.siteDetails?.name ??
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
                            ? AppColors.dividerColordark
                            : AppColors.dividerColorlight,
                      ),
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
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          SvgPicture.asset(
                                            Theme.of(context).brightness == Brightness.light
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
                            Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.symmetric(
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
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
        if (_showTooltip) _buildTooltip(),
      ],
    );
  }
}