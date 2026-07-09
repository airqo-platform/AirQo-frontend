import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Branding for the Africa Clean Air Forum selfie filter, based on the
/// "AQ/CAF" Figma templates (file `Z0OLd2awVqgZhytJULgO8L`, node 169:534 /
/// 169:491).
///
/// All templates were designed on a 1080x1080 canvas — [kCafReferenceWidth]
/// — so every size/gap in [CleanAirForumFilterCard] and
/// [CleanAirForumStickerFrame] is expressed as a fraction of that reference
/// and multiplied by the widget's actual rendered width. This keeps the
/// layout proportionally identical to the Figma design no matter what
/// resolution the card is previewed or captured at.
class CleanAirForumBrand {
  const CleanAirForumBrand._();

  /// "Vibrant sky blue" — matches the Africa Clean Air Network palette.
  static const Color skyBlue = Color(0xFF1E9BE0);

  /// "Nature green" — matches the Africa Clean Air Network palette.
  static const Color natureGreen = Color(0xFF2FA84F);

  /// Deep teal used for the filter card's bottom scrim, matching the Figma
  /// "AQ/CAF" template.
  static const Color scrimTeal = Color(0xFF005257);

  /// Text color for the "Shared from the AirQo app" pill/caption, matching
  /// the Figma template exactly (distinct from [scrimTeal]).
  static const Color sharedCaptionText = Color(0xFF1F3D3D);

  /// Wordmark shown top-left on the selfie filter card.
  static const String title = 'Africa Clean Air Forum';

  /// Host city + year shown under the [title] wordmark.
  static const String edition = 'Pretoria 2026';

  /// Event date range shown in the corner of the filter card.
  static const String dateRange = '13TH-16TH JULY';
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

/// AirQo icon + [CleanAirForumBrand.title] wordmark lockup shown top-left on the
/// selfie filter card: logo mark, a vertical divider, then the title/edition
/// text — matches the Figma "AQ/CAF" header exactly (node 169:538).
///
/// [scale] is the card's rendered width divided by [kCafReferenceWidth];
/// every size below is a Figma design pixel value multiplied by it.
class CleanAirForumBrandHeader extends StatelessWidget {
  final double scale;

  const CleanAirForumBrandHeader({super.key, required this.scale});

  @override
  Widget build(BuildContext context) {
    final iconSize = 143.38 * scale;
    final gap = 17 * scale;
    final dividerWidth = (4 * scale).clamp(1.0, double.infinity);
    final dividerHeight = 98 * scale;
    final titleFontSize = 35.974 * scale;

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        AirQoIconMark(size: iconSize),
        SizedBox(width: gap),
        Container(width: dividerWidth, height: dividerHeight, color: Colors.white),
        SizedBox(width: gap),
        Flexible(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                CleanAirForumBrand.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: titleFontSize,
                  height: 1.1,
                  fontWeight: FontWeight.w700,
                ),
              ),
              if (CleanAirForumBrand.edition.isNotEmpty)
                Text(
                  CleanAirForumBrand.edition,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: titleFontSize,
                    height: 1.1,
                    fontStyle: FontStyle.italic,
                    fontWeight: FontWeight.w400,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
