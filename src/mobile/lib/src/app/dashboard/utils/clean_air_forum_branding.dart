import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';

/// Visual theme for the AirQo selfie filter, based on the "AQ/CAF" Figma
/// templates (file `Z0OLd2awVqgZhytJULgO8L`, node 169:534 / 169:491).
///
/// All templates were designed on a 1080x1080 canvas — [kCafReferenceWidth]
/// — so every size/gap in [CleanAirForumFilterCard] and
/// [CleanAirForumStickerFrame] is expressed as a fraction of that reference
/// and multiplied by the widget's actual rendered width. This keeps the
/// layout proportionally identical to the Figma design no matter what
/// resolution the card is previewed or captured at.
class CleanAirForumBrand {
  const CleanAirForumBrand._();

  /// Deep teal used for the filter card's bottom scrim (default option).
  static const Color scrimTeal = Color(0xFF005257);

  /// Text color for the "Shared from the AirQo app" pill/caption.
  static const Color sharedCaptionText = Color(0xFF1F3D3D);
}

/// Selectable bottom-scrim colors for the selfie filter overlay.
enum FilterScrimColor {
  teal('Teal', Color(0xFF005257)),
  airqoBlue('AirQo blue', Color(0xFF145FFF)),
  pink('Pink', Color(0xFFE8538F));

  final String label;
  final Color color;

  const FilterScrimColor(this.label, this.color);
}

/// Formats the timestamp shown on the filter card, e.g. "5 Aug 2026 · 7:33 PM".
String formatFilterTimestamp(DateTime dateTime) {
  return DateFormat('d MMM yyyy · h:mm a').format(dateTime);
}

/// Reference canvas width the Figma "AQ/CAF" templates were designed at.
/// Multiply this against any Figma pixel value, divided by this constant,
/// to get a proportionally-correct size for a card of a given width.
const double kCafReferenceWidth = 1080.0;

/// AirQo house-mark icon, recolorable for use on photos/colored backgrounds.
///
/// The "airqo" wordmark is cut out of the shape as negative space (rather
/// than drawn), so whatever sits behind the icon shows through the letters
/// — matching the Figma logo lockup exactly.
class AirQoIconMark extends StatelessWidget {
  final double size;
  final Color color;

  const AirQoIconMark({super.key, this.size = 28, this.color = Colors.white});

  /// Intrinsic aspect ratio of the source asset (143.38 x 97).
  static const double aspectRatio = 97 / 143.38;

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      'assets/images/shared/airqo_icon_mark.svg',
      width: size,
      height: size * aspectRatio,
      colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    );
  }
}

/// AirQo icon shown top-left on the selfie filter card.
///
/// [scale] is the card's rendered width divided by [kCafReferenceWidth];
/// every size below is a Figma design pixel value multiplied by it.
class AirQoFilterHeader extends StatelessWidget {
  final double scale;

  const AirQoFilterHeader({super.key, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: AirQoIconMark(size: 143.38 * scale),
    );
  }
}

/// Horizontal row of scrim color swatches for filter personalization.
class FilterScrimColorPicker extends StatelessWidget {
  final FilterScrimColor selected;
  final ValueChanged<FilterScrimColor> onSelected;

  const FilterScrimColorPicker({
    super.key,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (final option in FilterScrimColor.values) ...[
          if (option != FilterScrimColor.values.first) const SizedBox(width: 12),
          _ScrimSwatch(
            label: option.label,
            color: option.color,
            selected: selected == option,
            onTap: () => onSelected(option),
          ),
        ],
      ],
    );
  }
}

class _ScrimSwatch extends StatelessWidget {
  final String label;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  const _ScrimSwatch({
    required this.label,
    required this.color,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: 'Filter color, $label',
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color,
            border: Border.all(
              color: selected ? Colors.white : Colors.transparent,
              width: 2,
            ),
            boxShadow: selected
                ? [
                    BoxShadow(
                      color: color.withValues(alpha: 0.5),
                      blurRadius: 6,
                      spreadRadius: 1,
                    ),
                  ]
                : null,
          ),
          child: selected
              ? const Icon(Icons.check, color: Colors.white, size: 18)
              : null,
        ),
      ),
    );
  }
}
