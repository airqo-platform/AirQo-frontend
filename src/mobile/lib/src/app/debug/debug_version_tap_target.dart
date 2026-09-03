import 'dart:async';

import 'package:airqo/src/app/debug/debug_api_override_sheet.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// Opens the debug API override sheet after 7 taps (debug builds only).
class DebugVersionTapTarget extends StatefulWidget {
  final Widget child;

  const DebugVersionTapTarget({super.key, required this.child});

  @override
  State<DebugVersionTapTarget> createState() => _DebugVersionTapTargetState();
}

class _DebugVersionTapTargetState extends State<DebugVersionTapTarget> {
  int _taps = 0;
  Timer? _reset;

  @override
  void dispose() {
    _reset?.cancel();
    super.dispose();
  }

  void _onTap() {
    if (!kDebugMode) return;
    _taps++;
    _reset?.cancel();
    _reset = Timer(const Duration(seconds: 2), () => _taps = 0);
    if (_taps < 7) return;
    _taps = 0;
    showDebugApiOverrideSheet(context);
  }

  @override
  Widget build(BuildContext context) {
    if (!kDebugMode) return widget.child;
    return GestureDetector(
      onTap: _onTap,
      behavior: HitTestBehavior.opaque,
      child: widget.child,
    );
  }
}
