import 'package:airqo/src/app/shared/widgets/empty_state_view.dart';
import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'package:flutter/material.dart';

class MapErrorView extends StatelessWidget {
  final VoidCallback onRetry;
  final bool isOffline;

  const MapErrorView({super.key, required this.onRetry, this.isOffline = false});

  @override
  Widget build(BuildContext context) {
    return EmptyStateView(
      icon: isOffline
          ? SystemGlyph.offline(context)
          : SystemGlyph.error(context),
      title: 'Unable to load map data',
      message: isOffline
          ? 'Please check your connection and try again'
          : 'Something went wrong. Please try again later',
      actionLabel: 'Try Again',
      onAction: onRetry,
    );
  }
}
