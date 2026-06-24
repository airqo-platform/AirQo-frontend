import 'package:airqo/src/app/shared/widgets/translated_tooltip.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

const _mapControlTapSize = 56.0;
const _mapControlVisualSize = 44.0;
const _mapControlIconSize = 20.0;
const _mapZoomVisualHeight = 88.0;
const _mapZoomTapHeight = 96.0;

/// Visual distance from the screen edge to map control pills.
const mapControlVisualEdgeInset = 12.0;

/// Position for the 56px tap wrapper so the 44px pill sits [mapControlVisualEdgeInset] from the edge.
const mapControlSideInset =
    mapControlVisualEdgeInset - (_mapControlTapSize - _mapControlVisualSize) / 2;

/// Centers a 44px control inside the shared 56px tap column width.
class MapControlSideSlot extends StatelessWidget {
  const MapControlSideSlot({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: _mapControlTapSize,
      child: Center(child: child),
    );
  }
}

BoxDecoration _mapControlDecoration({
  required Color background,
  required BorderRadius borderRadius,
}) {
  return BoxDecoration(
    color: background,
    borderRadius: borderRadius,
    boxShadow: const [
      BoxShadow(
        color: Color(0x33536A87),
        offset: Offset(0, 2),
        blurRadius: 5,
      ),
    ],
  );
}

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
    final iconColor = filled
        ? Colors.white
        : AppTextColors.modalCloseIcon(context);

    return SizedBox(
      width: _mapControlTapSize,
      height: _mapControlTapSize,
      child: Center(
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: _mapControlVisualSize,
            height: _mapControlVisualSize,
            decoration: _mapControlDecoration(
              background: bg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: _mapControlIconSize, color: iconColor),
          ),
        ),
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
    final iconColor = AppTextColors.modalCloseIcon(context);
    final divider = Colors.grey.withValues(alpha: 0.25);

    return SizedBox(
      width: _mapControlTapSize,
      height: _mapZoomTapHeight,
      child: Center(
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapUp: (details) {
            if (details.localPosition.dy < _mapZoomVisualHeight / 2) {
              onZoomIn();
            } else {
              onZoomOut();
            }
          },
          child: Container(
            width: _mapControlVisualSize,
            height: _mapZoomVisualHeight,
            decoration: _mapControlDecoration(
              background: bg,
              borderRadius: BorderRadius.circular(10),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                Expanded(
                  child: Center(
                    child: Icon(
                      Icons.add,
                      size: _mapControlIconSize,
                      color: iconColor,
                    ),
                  ),
                ),
                Container(height: 0.8, color: divider),
                Expanded(
                  child: Center(
                    child: Icon(
                      Icons.remove,
                      size: _mapControlIconSize,
                      color: iconColor,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
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
    final bg = isDark
        ? AppColors.darkHighlight.withValues(alpha: 0.94)
        : Colors.white.withValues(alpha: 0.95);

    return Container(
      width: _mapControlVisualSize,
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: _mapControlDecoration(
        background: bg,
        borderRadius: BorderRadius.circular(10),
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
