import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';

/// Keys for the first exposure Favorite card tour.
class PlaceCardTourKeys {
  final GlobalKey cardKey = GlobalKey(debugLabel: 'exposure_favorite_card');
  final GlobalKey chevronKey =
      GlobalKey(debugLabel: 'exposure_favorite_chevron');
}

/// Full-screen guided-tour overlay that spotlights the first Favorite card and
/// tells the user they can tap it to see the hourly PM2.5 breakdown.
///
/// Show it the first time the user configures a Favorite; dismiss on any tap.
class PlaceCardTour extends StatefulWidget {
  final PlaceCardTourKeys tourKeys;
  final VoidCallback onDismiss;

  const PlaceCardTour({
    super.key,
    required this.tourKeys,
    required this.onDismiss,
  });

  @override
  State<PlaceCardTour> createState() => _PlaceCardTourState();
}

class _PlaceCardTourState extends State<PlaceCardTour>
    with SingleTickerProviderStateMixin {
  final GlobalKey _overlayKey = GlobalKey();
  Rect? _cardRect;
  Rect? _chevronRect;
  late AnimationController _fade;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _fade = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
    );
    _opacity = CurvedAnimation(parent: _fade, curve: Curves.easeOut);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _remeasureAfterLayout();
      _fade.forward();
    });
  }

  @override
  void dispose() {
    _fade.dispose();
    super.dispose();
  }

  void _remeasureAfterLayout() {
    final cardContext = widget.tourKeys.cardKey.currentContext;
    if (cardContext == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _measureTargets();
      });
      return;
    }

    // Measure only after the card has finished moving. A mid-scroll rect
    // leaves the cutout a card too low, clipping the title and covering
    // the next Favorite.
    Scrollable.ensureVisible(
      cardContext,
      alignment: 0.28,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeInOut,
    ).whenComplete(() {
      if (!mounted) return;
      _measureTargets();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _measureTargets();
      });
    });
  }

  void _measureTargets() {
    final overlayBox =
        _overlayKey.currentContext?.findRenderObject() as RenderBox?;
    if (overlayBox == null) return;

    Rect? measure(GlobalKey key) {
      final ctx = key.currentContext;
      if (ctx == null) return null;
      final box = ctx.findRenderObject() as RenderBox?;
      if (box == null || !box.hasSize) return null;
      final topLeft = overlayBox.globalToLocal(box.localToGlobal(Offset.zero));
      return topLeft & box.size;
    }

    final card = measure(widget.tourKeys.cardKey);
    final chevron = measure(widget.tourKeys.chevronKey);
    if (card == null) return;

    setState(() {
      _cardRect = card;
      _chevronRect = chevron;
    });
  }

  void _dismiss() {
    _fade.reverse().then((_) => widget.onDismiss());
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardRect = _cardRect;

    return FadeTransition(
      opacity: _opacity,
      child: SizedBox.expand(
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _dismiss,
          child: Stack(
            key: _overlayKey,
            fit: StackFit.expand,
            children: [
              if (cardRect != null)
                Positioned.fill(
                  child: CustomPaint(
                    painter: _SpotlightPainter(spotlight: cardRect),
                  ),
                )
              else
                const ColoredBox(color: Color(0xAD000000)),
              if (cardRect != null)
                _TooltipBubble(
                  cardRect: cardRect,
                  chevronRect: _chevronRect,
                  isDark: isDark,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Spotlight painter ─────────────────────────────────────────────────────────

class _SpotlightPainter extends CustomPainter {
  final Rect spotlight;
  // The card render box includes `margin: EdgeInsets.only(bottom: 12)`.
  // Drop that margin before padding, so the cutout frames this Favorite
  // and does not swallow the next card.
  static const double _pad = 6;
  static const double _bottomMargin = 12;
  static const double _radius = 12;

  const _SpotlightPainter({required this.spotlight});

  Rect get _expanded => Rect.fromLTRB(
        spotlight.left - _pad,
        spotlight.top - _pad,
        spotlight.right + _pad,
        spotlight.bottom - _bottomMargin + _pad,
      );

  @override
  void paint(Canvas canvas, Size size) {
    final expanded = _expanded;
    canvas.saveLayer(Offset.zero & size, Paint());

    // Dark scrim
    canvas.drawRect(
      Offset.zero & size,
      Paint()..color = Colors.black.withValues(alpha: 0.68),
    );

    // Punch-out spotlight
    canvas.drawRRect(
      RRect.fromRectAndRadius(expanded, const Radius.circular(_radius)),
      Paint()..blendMode = BlendMode.clear,
    );

    canvas.restore();

    // Spotlight border ring
    canvas.drawRRect(
      RRect.fromRectAndRadius(expanded, const Radius.circular(_radius)),
      Paint()
        ..color = Colors.white.withValues(alpha: 0.25)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5,
    );
  }

  @override
  bool shouldRepaint(_SpotlightPainter old) => old.spotlight != spotlight;
}

// ── Tooltip bubble ────────────────────────────────────────────────────────────

class _TooltipBubble extends StatelessWidget {
  final Rect cardRect;
  final Rect? chevronRect;
  final bool isDark;
  static const double _arrowH = 10.0;
  static const double _hPad = 16.0;
  static const double _gap = 8.0;

  const _TooltipBubble({
    required this.cardRect,
    required this.chevronRect,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final padding = MediaQuery.paddingOf(context);
    final screen = MediaQuery.sizeOf(context);
    final bubbleBg = isDark ? AppColors.darkHighlight : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1A1D23);
    // Match card / sheet secondary copy: neutral grey in dark (not blue-grey).
    final subColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;

    final pointerTarget = chevronRect ?? cardRect;
    final spotlightTop = cardRect.top - 8;
    final bubbleBottom = spotlightTop - _gap - _arrowH;
    final textScaler = MediaQuery.textScalerOf(context);
    final estimatedHeight = textScaler.scale(168) + _arrowH;
    final spaceAbove = spotlightTop - (padding.top + 8);
    final placeBelow = spaceAbove < estimatedHeight + _gap;

    // Arrow follows the hourly chevron, not the card centre.
    final arrowCx = pointerTarget.center.dx
        .clamp(_hPad + padding.left + 20, screen.width - _hPad - padding.right - 20)
        .toDouble();

    final bubble = Container(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            decoration: BoxDecoration(
              color: bubbleBg,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.18),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.primaryColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: AqHand(
                        size: 20,
                        color: AppColors.primaryColor,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tap a card',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: textColor,
                              height: 1.2,
                              decoration: TextDecoration.none,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'See the hourly PM2.5 breakdown for each Favorite and how your usual schedule shapes exposure.',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 13,
                              fontWeight: FontWeight.w400,
                              color: subColor,
                              height: 1.45,
                              decoration: TextDecoration.none,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'Tap anywhere to dismiss',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 11,
                        height: 1,
                        color: subColor,
                        fontWeight: FontWeight.w500,
                        decoration: TextDecoration.none,
                      ),
                    ),
                    const SizedBox(width: 2),
                    AqChevronDown(
                      size: 16,
                      color: subColor,
                    ),
                  ],
                ),
              ],
            ),
          );

    final arrow = Padding(
      padding: EdgeInsets.only(
        left: (arrowCx - _hPad - padding.left - 10)
            .clamp(0.0, screen.width - (_hPad + padding.horizontal) - 20)
            .toDouble(),
      ),
      child: CustomPaint(
        size: const Size(20, _arrowH),
        painter: _ArrowPainter(color: bubbleBg, pointsDown: !placeBelow),
      ),
    );

    return Positioned(
      top: placeBelow ? cardRect.bottom + _gap : null,
      bottom: placeBelow ? null : screen.height - bubbleBottom,
      left: _hPad + padding.left,
      right: _hPad + padding.right,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: placeBelow ? [arrow, bubble] : [bubble, arrow],
      ),
    );
  }
}

// ── Arrow painter ─────────────────────────────────────────────────────────────

class _ArrowPainter extends CustomPainter {
  final Color color;
  final bool pointsDown;
  const _ArrowPainter({required this.color, this.pointsDown = false});

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    if (pointsDown) {
      path
        ..moveTo(0, 0)
        ..lineTo(size.width / 2, size.height)
        ..lineTo(size.width, 0);
    } else {
      path
        ..moveTo(0, size.height)
        ..lineTo(size.width / 2, 0)
        ..lineTo(size.width, size.height);
    }
    path.close();
    canvas.drawPath(path, Paint()..color = color);
  }

  @override
  bool shouldRepaint(_ArrowPainter old) =>
      old.color != color || old.pointsDown != pointsDown;
}
