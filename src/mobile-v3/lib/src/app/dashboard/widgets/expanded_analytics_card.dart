import 'package:airqo/src/app/dashboard/bloc/health_tips/health_tips_bloc.dart';
import 'package:airqo/src/app/dashboard/models/health_tips_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';

class ExpandedAnalyticsCard extends StatefulWidget with UiLoggy {
  final Measurement measurement;
  final HealthTipModel? healthTipModel;

  const ExpandedAnalyticsCard(this.measurement, {super.key, this.healthTipModel});

  @override
  State<ExpandedAnalyticsCard> createState() => _ExpandedAnalyticsCardState();
}

class _ExpandedAnalyticsCardState extends State<ExpandedAnalyticsCard> {
  bool _isLoadingHealthTip = false;

  @override
  void initState() {
    super.initState();
    // Only fetch health tip if we don't already have one passed in
    if (widget.healthTipModel == null && widget.measurement.pm25?.value != null) {
      _loadHealthTip();
    }
  }

  void _loadHealthTip() {
    setState(() {
      _isLoadingHealthTip = true;
    });
    
    context.read<HealthTipsBloc>().add(
      GetHealthTipForAqi(widget.measurement.pm25!.value!)
    );
  }

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

  Color _getAqiColor(Measurement measurement) {
    if (measurement.aqiColor != null) {
      try {
        final colorStr = measurement.aqiColor!.replaceAll('#', '');
        return Color(int.parse('0xFF$colorStr'));
      } catch (e) {
        widget.loggy.warning('Failed to parse AQI color: ${measurement.aqiColor}');
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
    return BlocBuilder<HealthTipsBloc, HealthTipsState>(
      builder: (context, state) {
        // Determine health tip from state or passed-in prop
        HealthTipModel? healthTip = widget.healthTipModel;
        bool isLoading = _isLoadingHealthTip;
        
        // Update from state if available
        if (state is HealthTipForAqiLoaded) {
          healthTip = state.healthTip;
          isLoading = false;
        } else if (state is HealthTipsLoaded && healthTip == null) {
          // If we have loaded tips but no specific tip, try to find one
          if (widget.measurement.pm25?.value != null && state.healthTips.isNotEmpty) {
            for (final tip in state.healthTips) {
              if (tip.aqiCategory.isInRange(widget.measurement.pm25!.value!)) {
                healthTip = tip;
                break;
              }
            }
          }
          isLoading = false;
        } else if (state is HealthTipsError) {
          isLoading = false;
        }

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
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
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
                          Wrap(children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 12),
                              padding:
                                  EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: _getAqiColor(widget.measurement).withOpacity(0.15),
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
                          ]),
                        ],
                      ),
                    ),
                    Divider(
                        thickness: .5,
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.black
                            : Colors.white),
                    Padding(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: isLoading
                          ? Center(
                              child: SizedBox(
                                height: 24,
                                width: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppColors.primaryColor,
                                ),
                              ),
                            )
                          : healthTip?.tagLine != null
                              ? Text(
                                  healthTip!.tagLine,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w500,
                                    color: Theme.of(context).textTheme.bodyMedium?.color,
                                  ),
                                )
                              : Text(
                                  "Stay informed about air quality",
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w500,
                                    color: Theme.of(context).textTheme.bodyMedium?.color,
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
                    ? Color(0xFF2A3744)
                    : Color(0xFFEAEFF5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.medical_services_outlined,
                          color: Colors.red,
                          size: 24,
                        ),
                        SizedBox(width: 8),
                        Text(
                          "Today's health tip",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Theme.of(context).textTheme.bodyMedium?.color,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16),
                    isLoading
                        ? Center(
                            child: CircularProgressIndicator(
                              strokeWidth: 3,
                              color: AppColors.primaryColor,
                            ),
                          )
                        : healthTip?.description != null
                            ? Text(
                                healthTip!.description,
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w500,
                                  color: Theme.of(context).textTheme.bodyLarge?.color,
                                ),
                              )
                            : Text(
                                "Health tip not available for this air quality level. Please check back later.",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w500,
                                  color: Theme.of(context).textTheme.bodyLarge?.color,
                                ),
                              ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}