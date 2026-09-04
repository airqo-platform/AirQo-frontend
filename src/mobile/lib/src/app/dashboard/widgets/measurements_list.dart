import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/measurement_card_tour.dart';
import 'package:airqo/src/app/shared/widgets/empty_state_view.dart';
import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'analytics_card.dart';

class MeasurementsList extends StatelessWidget {
  final List<Measurement> measurements;
  final MeasurementCardTourKeys? tourKeys;
  final VoidCallback? onTourTargetReady;
  final VoidCallback? onRetry;

  const MeasurementsList({
    super.key,
    required this.measurements,
    this.tourKeys,
    this.onTourTargetReady,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    if (measurements.isEmpty) {
      return SliverToBoxAdapter(
        child: EmptyStateView(
          icon: SystemGlyph.emptyPlace(context),
          title: 'No air quality stations available',
          message: "We couldn't find any stations right now. Please try again.",
          actionLabel: onRetry != null ? 'Try Again' : null,
          onAction: onRetry,
        ),
      );
    }

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
