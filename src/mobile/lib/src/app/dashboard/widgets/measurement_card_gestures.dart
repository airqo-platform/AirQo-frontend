import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Debounced single-tap + double-tap layer for measurement cards.
///
/// Single tap opens forecast after [tapDelay]; double tap cancels the pending
/// tap and invokes [onShareDoubleTap] with light haptic feedback.
class MeasurementCardTapLayer extends StatefulWidget {
  final Widget child;
  final VoidCallback onForecast;
  final VoidCallback onShareDoubleTap;
  final bool enabled;

  const MeasurementCardTapLayer({
    super.key,
    required this.child,
    required this.onForecast,
    required this.onShareDoubleTap,
    this.enabled = true,
  });

  @override
  State<MeasurementCardTapLayer> createState() =>
      _MeasurementCardTapLayerState();
}

class _MeasurementCardTapLayerState extends State<MeasurementCardTapLayer> {
  static const _tapDelay = Duration(milliseconds: 250);
  Timer? _singleTapTimer;

  @override
  void dispose() {
    _singleTapTimer?.cancel();
    super.dispose();
  }

  void _handleTap() {
    if (!widget.enabled) return;
    _singleTapTimer?.cancel();
    _singleTapTimer = Timer(_tapDelay, () {
      if (!mounted) return;
      widget.onForecast();
    });
  }

  void _handleDoubleTap() {
    if (!widget.enabled) return;
    _singleTapTimer?.cancel();
    HapticFeedback.lightImpact();
    widget.onShareDoubleTap();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: widget.enabled ? _handleTap : null,
      onDoubleTap: widget.enabled ? _handleDoubleTap : null,
      child: widget.child,
    );
  }
}
