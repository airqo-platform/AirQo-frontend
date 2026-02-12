import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'analytics_card.dart';

class MeasurementsList extends StatelessWidget {
  final List<Measurement> measurements;

  const MeasurementsList({
    super.key,
    required this.measurements,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      itemCount: measurements.length,
      shrinkWrap: true,
      padding: EdgeInsets.zero, // Remove any default padding
      itemBuilder: (context, index) {
        return AnalyticsCard(measurements[index]);
      }
    );
  }
}