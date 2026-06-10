import 'package:flutter/material.dart';

/// AirQo design system switch (animated track + thumb).
/// Track colour interpolates from the theme-aware off colour to AirQo blue.
class CustomSwitch extends StatefulWidget {
  final bool value;
  final ValueChanged<bool>? onChanged;

  const CustomSwitch({
    super.key,
    required this.value,
    this.onChanged,
  });

  @override
  State<CustomSwitch> createState() => _CustomSwitchState();
}

class _CustomSwitchState extends State<CustomSwitch> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  static const Color _onColor = Color(0xFF145FFF);

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
      value: widget.value ? 1.0 : 0.0,
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void didUpdateWidget(CustomSwitch oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      widget.value ? _animationController.forward() : _animationController.reverse();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleTap() => widget.onChanged?.call(!widget.value);

  @override
  Widget build(BuildContext context) {
    // Off-state colour adapts to the current theme so it's always visible.
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final offColor = isDark ? const Color(0xFF3E4147) : const Color(0xFFF3F6F8);

    return GestureDetector(
      onTap: _handleTap,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final trackColor = Color.lerp(offColor, _onColor, _animation.value)!;
          return Container(
            width: 36,
            height: 20,
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: trackColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Stack(
              children: [
                Positioned(
                  left: _animation.value * 16,
                  top: 0,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF536A87).withValues(alpha: 0.16),
                          offset: const Offset(0, 1),
                          blurRadius: 2,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
