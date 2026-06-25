import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class MapControlTourStep {
  const MapControlTourStep({
    required this.targetKey,
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final GlobalKey targetKey;
  final IconData icon;
  final String title;
  final String subtitle;
}

/// Full-screen guided tour that spotlights map controls on the right edge.
///
/// Shown once per install; [steps] can omit the locate step when location is
/// unavailable.
class MapControlsTour extends StatefulWidget {
  const MapControlsTour({
    super.key,
    required this.steps,
    required this.onDismiss,
  });

  final List<MapControlTourStep> steps;
  final VoidCallback onDismiss;

  @override
  State<MapControlsTour> createState() => _MapControlsTourState();
}

class _MapControlsTourState extends State<MapControlsTour>
    with SingleTickerProviderStateMixin {
  int _stepIndex = 0;
  Rect? _targetRect;
  late AnimationController _fade;
  late Animation<double> _opacity;

  MapControlTourStep get _step => widget.steps[_stepIndex];
  bool get _isLastStep => _stepIndex >= widget.steps.length - 1;

  @override
  void initState() {
    super.initState();
    _fade = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
    );
    _opacity = CurvedAnimation(parent: _fade, curve: Curves.easeOut);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _measureTarget();
      _fade.forward();
    });
  }

  @override
  void dispose() {
    _fade.dispose();
    super.dispose();
  }

  void _measureTarget() {
    final ctx = _step.targetKey.currentContext;
    if (ctx == null) return;
    final box = ctx.findRenderObject() as RenderBox?;
    if (box == null || !box.hasSize) return;
    final topLeft = box.localToGlobal(Offset.zero);
    if (mounted) {
      setState(() {
        _targetRect = topLeft & box.size;
      });
    }
  }

  void _advance() {
    if (_isLastStep) {
      _fade.reverse().then((_) {
        if (mounted) widget.onDismiss();
      });
      return;
    }

    _fade.reverse().then((_) {
      if (!mounted) return;
      setState(() {
        _stepIndex++;
        _targetRect = null;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _measureTarget();
        _fade.forward();
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final targetRect = _targetRect;

    return FadeTransition(
      opacity: _opacity,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _advance,
        child: Stack(
          children: [
            if (targetRect != null)
              CustomPaint(
                size: MediaQuery.of(context).size,
                painter: _SpotlightPainter(spotlight: targetRect),
              )
            else
              Container(color: Colors.black54),
            if (targetRect != null)
              _TooltipBubble(
                targetRect: targetRect,
                isDark: isDark,
                step: _step,
                stepIndex: _stepIndex,
                stepCount: widget.steps.length,
                isLastStep: _isLastStep,
              ),
          ],
        ),
      ),
    );
  }
}

class _SpotlightPainter extends CustomPainter {
  final Rect spotlight;
  static const double _pad = 8;
  static const double _radius = 12;

  const _SpotlightPainter({required this.spotlight});

  Rect get _expanded => Rect.fromLTRB(
        spotlight.left - _pad,
        spotlight.top - _pad,
        spotlight.right + _pad,
        spotlight.bottom + _pad,
      );

  @override
  void paint(Canvas canvas, Size size) {
    final expanded = _expanded;
    canvas.saveLayer(Offset.zero & size, Paint());

    canvas.drawRect(
      Offset.zero & size,
      Paint()..color = Colors.black.withValues(alpha: 0.68),
    );

    canvas.drawRRect(
      RRect.fromRectAndRadius(expanded, const Radius.circular(_radius)),
      Paint()..blendMode = BlendMode.clear,
    );

    canvas.restore();

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

class _TooltipBubble extends StatelessWidget {
  final Rect targetRect;
  final bool isDark;
  final MapControlTourStep step;
  final int stepIndex;
  final int stepCount;
  final bool isLastStep;

  static const double _arrowW = 10.0;
  static const double _hPad = 16.0;
  static const double _maxBubbleWidth = 280.0;

  const _TooltipBubble({
    required this.targetRect,
    required this.isDark,
    required this.step,
    required this.stepIndex,
    required this.stepCount,
    required this.isLastStep,
  });

  @override
  Widget build(BuildContext context) {
    final padding = MediaQuery.paddingOf(context);
    final screen = MediaQuery.sizeOf(context);
    final bubbleBg = isDark ? AppColors.darkHighlight : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1A1D23);
    final subColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;

    final bubbleWidth = (screen.width -
            padding.horizontal -
            _hPad * 2 -
            _arrowW -
            12)
        .clamp(220.0, _maxBubbleWidth);
    final left = (targetRect.left - bubbleWidth - _arrowW - 12).clamp(
      _hPad + padding.left,
      screen.width - bubbleWidth - _hPad - padding.right,
    );

    final bubbleTop = (targetRect.center.dy - 72).clamp(
      padding.top + _hPad + 8,
      screen.height * 0.55,
    );

    final arrowTop = (targetRect.center.dy - bubbleTop - 10)
        .clamp(18.0, 120.0);

    return Stack(
      children: [
        Positioned(
          left: left,
          top: bubbleTop,
          width: bubbleWidth,
          child: Container(
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
                      child: Icon(
                        step.icon,
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
                            step.title,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: textColor,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            step.subtitle,
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
                  children: [
                    Text(
                      '${stepIndex + 1} of $stepCount',
                      style: TextStyle(
                        fontSize: 11,
                        color: subColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      isLastStep ? 'Tap anywhere to dismiss' : 'Tap anywhere to continue',
                      style: TextStyle(
                        fontSize: 11,
                        color: subColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      isLastStep
                          ? Icons.keyboard_arrow_down_rounded
                          : Icons.keyboard_arrow_right_rounded,
                      size: 14,
                      color: subColor,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        Positioned(
          left: left + bubbleWidth,
          top: bubbleTop + arrowTop,
          child: CustomPaint(
            size: const Size(_arrowW, 20),
            painter: _ArrowPainter(color: bubbleBg, pointingRight: true),
          ),
        ),
      ],
    );
  }
}

class _ArrowPainter extends CustomPainter {
  final Color color;
  final bool pointingRight;

  const _ArrowPainter({required this.color, this.pointingRight = false});

  @override
  void paint(Canvas canvas, Size size) {
    final path = pointingRight
        ? (Path()
          ..moveTo(0, size.height * 0.25)
          ..lineTo(size.width, size.height / 2)
          ..lineTo(0, size.height * 0.75)
          ..close())
        : (Path()
          ..moveTo(0, size.height)
          ..lineTo(size.width / 2, 0)
          ..lineTo(size.width, size.height)
          ..close());
    canvas.drawPath(path, Paint()..color = color);
  }

  @override
  bool shouldRepaint(_ArrowPainter old) =>
      old.color != color || old.pointingRight != pointingRight;
}
