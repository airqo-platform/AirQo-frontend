import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';

/// Full-screen guided-tour overlay that spotlights the first place card and
/// tells the user they can tap it to see the hourly PM2.5 breakdown.
///
/// Show it the first time the user adds a place; dismiss on any tap.
class PlaceCardTour extends StatefulWidget {
  final GlobalKey cardKey;
  final VoidCallback onDismiss;

  const PlaceCardTour({
    super.key,
    required this.cardKey,
    required this.onDismiss,
  });

  @override
  State<PlaceCardTour> createState() => _PlaceCardTourState();
}

class _PlaceCardTourState extends State<PlaceCardTour>
    with SingleTickerProviderStateMixin {
  Rect? _cardRect;
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

    // Wait for the card to be laid out before reading its position.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _measureCard();
      _fade.forward();
    });
  }

  @override
  void dispose() {
    _fade.dispose();
    super.dispose();
  }

  void _measureCard() {
    final ctx = widget.cardKey.currentContext;
    if (ctx == null) return;
    final box = ctx.findRenderObject() as RenderBox?;
    if (box == null || !box.hasSize) return;
    final topLeft = box.localToGlobal(Offset.zero);
    if (mounted) {
      setState(() {
        _cardRect = topLeft & box.size;
      });
    }
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
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _dismiss,
        child: Stack(
          children: [
            // ── Spotlight backdrop ───────────────────────────────
            if (cardRect != null)
              CustomPaint(
                size: MediaQuery.of(context).size,
                painter: _SpotlightPainter(spotlight: cardRect),
              )
            else
              Container(color: Colors.black54),

            // ── Tooltip bubble ───────────────────────────────────
            if (cardRect != null)
              _TooltipBubble(cardRect: cardRect, isDark: isDark),
          ],
        ),
      ),
    );
  }
}

// ── Spotlight painter ─────────────────────────────────────────────────────────

class _SpotlightPainter extends CustomPainter {
  final Rect spotlight;
  // The card Container has margin: EdgeInsets.only(bottom: 12), which is
  // included in box.size. We expand top/sides by _pad but deflect the bottom
  // by _pad so the cutout ends inside the card content area, well clear of
  // the next card.
  static const double _pad = 8;
  static const double _radius = 12;

  const _SpotlightPainter({required this.spotlight});

  Rect get _expanded => Rect.fromLTRB(
        spotlight.left - _pad,
        spotlight.top - _pad,
        spotlight.right + _pad,
        spotlight.bottom - _pad, // trim bottom: card margin is 12px, so this leaves ~4px gap
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
  final bool isDark;
  static const double _arrowH = 10.0;
  static const double _hPad = 16.0;

  const _TooltipBubble({required this.cardRect, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final screen = MediaQuery.of(context).size;
    final bubbleBg = isDark ? AppColors.darkHighlight : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1A1D23);
    // Match card / sheet secondary copy: neutral grey in dark (not blue-grey).
    final subColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;

    // Position bubble below the spotlight cutout (bottom = cardRect.bottom - 8
    // after asymmetric inflation, then add a small gap before the arrow).
    final spotBottom = cardRect.bottom - 8 + 6; // spotlight bottom + breathing room
    final topOfBubble = spotBottom + _arrowH;

    // Arrow horizontal centre follows card centre, clamped to screen.
    final arrowCx = cardRect.center.dx.clamp(40.0, screen.width - 40.0);

    return Positioned(
      top: topOfBubble,
      left: _hPad,
      right: _hPad,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Arrow pointer aligned with card centre
          Padding(
            padding: EdgeInsets.only(left: (arrowCx - _hPad - 10).clamp(0, screen.width - _hPad * 2 - 20)),
            child: CustomPaint(
              size: const Size(20, _arrowH),
              painter: _ArrowPainter(color: bubbleBg),
            ),
          ),

          // Bubble body
          Container(
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
                    // Tap icon
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.primaryColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.touch_app_rounded,
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
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: textColor,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'See the hourly PM2.5 breakdown for each of your places.',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w400,
                              color: subColor,
                              height: 1.45,
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
                  children: [
                    Text(
                      'Tap anywhere to dismiss',
                      style: TextStyle(
                        fontSize: 11,
                        color: subColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      Icons.keyboard_arrow_down_rounded,
                      size: 14,
                      color: subColor,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Arrow painter ─────────────────────────────────────────────────────────────

class _ArrowPainter extends CustomPainter {
  final Color color;
  const _ArrowPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()
      ..moveTo(0, size.height)
      ..lineTo(size.width / 2, 0)
      ..lineTo(size.width, size.height)
      ..close();
    canvas.drawPath(path, Paint()..color = color);
  }

  @override
  bool shouldRepaint(_ArrowPainter old) => old.color != color;
}
