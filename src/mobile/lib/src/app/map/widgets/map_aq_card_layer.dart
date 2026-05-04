import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/map/widgets/map_air_quality_card.dart';
import 'package:flutter/material.dart';

class MapAqCardLayer extends StatelessWidget {
  const MapAqCardLayer({
    super.key,
    required this.bottom,
    required this.onDismiss,
    required this.onViewForecast,
    this.measurement,
  });

  final double bottom;
  final Measurement? measurement;
  final VoidCallback onDismiss;
  final VoidCallback onViewForecast;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: bottom,
      left: 12,
      right: 12,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        transitionBuilder: (child, animation) => SlideTransition(
          position: Tween(begin: const Offset(0, 0.25), end: Offset.zero)
              .animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
          child: FadeTransition(opacity: animation, child: child),
        ),
        child: measurement == null
            ? const SizedBox.shrink()
            : MapAirQualityCard(
                key: ValueKey(measurement!.id),
                measurement: measurement!,
                onDismiss: onDismiss,
                onViewForecast: onViewForecast,
              ),
      ),
    );
  }
}
