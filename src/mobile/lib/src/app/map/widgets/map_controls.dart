import 'package:airqo/src/app/shared/widgets/translated_tooltip.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class MapIconButton extends StatelessWidget {
  final IconData icon;
  final bool isDark;
  final bool filled;
  final VoidCallback onTap;

  const MapIconButton({
    super.key,
    required this.icon,
    required this.isDark,
    required this.onTap,
    this.filled = false,
  });

  @override
  Widget build(BuildContext context) {
    final bg = filled
        ? AppColors.primaryColor
        : (isDark
            ? AppColors.darkHighlight.withValues(alpha: 0.94)
            : Colors.white.withValues(alpha: 0.95));
    final iconColor =
        filled ? Colors.white : Theme.of(context).textTheme.bodyMedium?.color;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(8),
          boxShadow: const [
            BoxShadow(
              color: Color(0x33536A87),
              offset: Offset(0, 2),
              blurRadius: 5,
            ),
          ],
        ),
        child: Icon(icon, size: 16, color: iconColor),
      ),
    );
  }
}

class MapZoomGroup extends StatelessWidget {
  final bool isDark;
  final VoidCallback onZoomIn;
  final VoidCallback onZoomOut;

  const MapZoomGroup({
    super.key,
    required this.isDark,
    required this.onZoomIn,
    required this.onZoomOut,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isDark
        ? AppColors.darkHighlight.withValues(alpha: 0.94)
        : Colors.white.withValues(alpha: 0.95);
    final iconColor = Theme.of(context).textTheme.bodyMedium?.color;
    final divider = Colors.grey.withValues(alpha: 0.25);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33536A87),
            offset: Offset(0, 2),
            blurRadius: 5,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: onZoomIn,
            child: Container(
              width: 32,
              height: 24,
              decoration: BoxDecoration(
                color: bg,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(8)),
                border: Border(bottom: BorderSide(color: divider, width: 0.8)),
              ),
              child: Icon(Icons.add, size: 16, color: iconColor),
            ),
          ),
          GestureDetector(
            onTap: onZoomOut,
            child: Container(
              width: 32,
              height: 24,
              decoration: BoxDecoration(
                color: bg,
                borderRadius:
                    const BorderRadius.vertical(bottom: Radius.circular(8)),
              ),
              child: Icon(Icons.remove, size: 16, color: iconColor),
            ),
          ),
        ],
      ),
    );
  }
}

class MapAqLegend extends StatelessWidget {
  final bool isDark;

  const MapAqLegend({
    super.key,
    required this.isDark,
  });

  static const List<({String asset, String label})> _items = [
    (
      asset: 'assets/images/shared/airquality_indicators/good.svg',
      label: 'Air quality is Good',
    ),
    (
      asset: 'assets/images/shared/airquality_indicators/moderate.svg',
      label: 'Air quality is Moderate',
    ),
    (
      asset:
          'assets/images/shared/airquality_indicators/unhealthy-sensitive.svg',
      label: 'Unhealthy for Sensitive Groups',
    ),
    (
      asset: 'assets/images/shared/airquality_indicators/unhealthy.svg',
      label: 'Air quality is Unhealthy',
    ),
    (
      asset: 'assets/images/shared/airquality_indicators/very-unhealthy.svg',
      label: 'Air quality is Very Unhealthy',
    ),
    (
      asset: 'assets/images/shared/airquality_indicators/hazardous.svg',
      label: 'Air quality is Hazardous',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      padding: const EdgeInsets.symmetric(vertical: 7),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkHighlight.withValues(alpha: 0.94)
            : Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33536A87),
            offset: Offset(0, 2),
            blurRadius: 5,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: _items
            .map(
              (item) => Padding(
                padding: const EdgeInsets.only(top: 4),
                child: TranslatedTooltip(
                  message: item.label,
                  preferBelow: false,
                  triggerMode: TooltipTriggerMode.tap,
                  textStyle: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xff3E4147),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  verticalOffset: -18,
                  margin: const EdgeInsets.only(left: 52),
                  child: SvgPicture.asset(
                    item.asset,
                    width: 22,
                    height: 22,
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}
