import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/measurement_card_tour.dart';
import 'analytics_card.dart';

class MeasurementsList extends StatelessWidget {
  final List<Measurement> measurements;
  final MeasurementCardTourKeys? tourKeys;
  final VoidCallback? onTourTargetReady;

  const MeasurementsList({
    super.key,
    required this.measurements,
    this.tourKeys,
    this.onTourTargetReady,
  });

  @override
  Widget build(BuildContext context) {
    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) => AnalyticsCard(
          measurements[index],
          tourKeys: index == 0 ? tourKeys : null,
          onTourTargetReady: index == 0 ? onTourTargetReady : null,
        ),
        childCount: measurements.length,
      ),
    );
  }
}
