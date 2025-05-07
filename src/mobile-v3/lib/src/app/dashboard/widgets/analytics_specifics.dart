import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_card.dart';
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

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          child: Column(
            children: [
              SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(widget.measurement.siteDetails!.city!,
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 24,
                          color: AppColors.boldHeadlineColor)),
                  InkWell(
                    onTap: () => Navigator.pop(context),
                    child: Icon(
                      Icons.close,
                      color: AppColors.boldHeadlineColor,
                    ),
                  )
                ],
              ),
              SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text("Today",
                      style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                          color: AppColors.boldHeadlineColor)),
                  Row(children: [
                    SizedBox(width: 8),
                  ])
                ],
              ),
              SizedBox(height: 16),
              AnalyticsForecastWidget(
                siteId: widget.measurement.siteDetails!.id!,
              ),
              SizedBox(height: 16),
            ],
          ),
        ),
        AnalyticsCard(widget.measurement),
      ],
    );
  }
}