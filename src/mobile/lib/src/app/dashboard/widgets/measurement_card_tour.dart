import 'package:airqo/src/app/dashboard/widgets/measurement_card_action_strip.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// GlobalKey for the first dashboard measurement card used by the gestures tour.
class MeasurementCardTourKeys {
  final GlobalKey cardKey = GlobalKey(debugLabel: 'measurement_card');
}

const String measurementCardGesturesTourSeenKey =
    'measurement_card_gestures_tour_seen';

/// Set to true when ready to show the first-run card gestures tour again.
const bool kMeasurementCardGesturesTourEnabled = false;

enum MeasurementCardTourTargetKind { tapZone, shareIcon, forecastIcon }

/// Whether the first card is attached and laid out.
bool measurementCardTourTargetsReady(MeasurementCardTourKeys keys) {
  return keys.cardKey.currentContext != null;
}

/// Waits until the tour card is measurable, then invokes [onReady] once.
void scheduleMeasurementCardTourReady({
  required MeasurementCardTourKeys keys,
  required VoidCallback onReady,
  required bool Function() isActive,
  int attempt = 0,
  int maxAttempts = 40,
}) {
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!isActive()) return;
    if (measurementCardTourTargetsReady(keys)) {
      onReady();
      return;
    }
    if (attempt < maxAttempts) {
      scheduleMeasurementCardTourReady(
        keys: keys,
        onReady: onReady,
        isActive: isActive,
        attempt: attempt + 1,
        maxAttempts: maxAttempts,
      );
    }
  });
}

/// Spotlight rect derived from the card bounds and known icon layout constants.
Rect measurementCardTourTargetRect(
  MeasurementCardTourKeys keys,
  MeasurementCardTourTargetKind kind,
) {
  final ctx = keys.cardKey.currentContext;
  if (ctx == null) return Rect.zero;
  final box = ctx.findRenderObject() as RenderBox?;
  if (box == null || !box.hasSize) return Rect.zero;

  final card = box.localToGlobal(Offset.zero) & box.size;
  const footerHeight =
      kMeasurementCardBottomPadding + kMeasurementCardActionTapTarget;

  switch (kind) {
    case MeasurementCardTourTargetKind.tapZone:
      return Rect.fromLTRB(
        card.left,
        card.top,
        card.right,
        card.bottom - footerHeight,
      );
    case MeasurementCardTourTargetKind.shareIcon:
      return Rect.fromLTWH(
        card.right -
            kMeasurementCardHorizontalPadding -
            kMeasurementCardActionTapTarget,
        card.top + kMeasurementCardTopPadding,
        kMeasurementCardActionTapTarget,
        kMeasurementCardActionTapTarget,
      );
    case MeasurementCardTourTargetKind.forecastIcon:
      return Rect.fromLTWH(
        card.right -
            kMeasurementCardHorizontalPadding -
            kMeasurementCardActionTapTarget,
        card.bottom - footerHeight,
        kMeasurementCardActionTapTarget,
        kMeasurementCardActionTapTarget,
      );
  }
}

class MeasurementCardTourStep {
  const MeasurementCardTourStep({
    required this.targetKind,
    required this.title,
    required this.subtitle,
    this.icon,
    this.svgAssetPath,
  }) : assert(icon != null || svgAssetPath != null);

  final MeasurementCardTourTargetKind targetKind;
  final IconData? icon;
  final String? svgAssetPath;
  final String title;
  final String subtitle;
}

List<MeasurementCardTourStep> buildMeasurementCardGesturesTourSteps() {
  return const [
    MeasurementCardTourStep(
      targetKind: MeasurementCardTourTargetKind.tapZone,
      icon: Icons.touch_app_rounded,
      title: 'Tap for forecast',
      subtitle:
          'Tap the card once to open the air quality forecast for this location.',
    ),
    MeasurementCardTourStep(
      targetKind: MeasurementCardTourTargetKind.tapZone,
      icon: Icons.touch_app_rounded,
      title: 'Double tap to share',
      subtitle:
          'Double tap the card to share air quality instantly with friends.',
    ),
    MeasurementCardTourStep(
      targetKind: MeasurementCardTourTargetKind.shareIcon,
      svgAssetPath: 'assets/icons/share-icon.svg',
      title: 'Share button',
      subtitle:
          'You can also tap the share icon here to open sharing options.',
    ),
    MeasurementCardTourStep(
      targetKind: MeasurementCardTourTargetKind.forecastIcon,
      svgAssetPath: 'assets/icons/chevron-right.svg',
      title: 'Forecast shortcut',
      subtitle: 'Tap the arrow to jump straight to the forecast.',
    ),
  ];
}

/// Guided tour for dashboard measurement card gestures.
class MeasurementCardGesturesTour extends StatefulWidget {
  const MeasurementCardGesturesTour({
    super.key,
    required this.tourKeys,
    required this.steps,
    required this.onDismiss,
  });

  final MeasurementCardTourKeys tourKeys;
  final List<MeasurementCardTourStep> steps;
  final VoidCallback onDismiss;

  @override
  State<MeasurementCardGesturesTour> createState() =>
      _MeasurementCardGesturesTourState();
}

class _MeasurementCardGesturesTourState extends State<MeasurementCardGesturesTour>
    with SingleTickerProviderStateMixin {
  int _stepIndex = 0;
  Rect? _targetRect;
  late AnimationController _fade;
  late Animation<double> _opacity;

  MeasurementCardTourStep get _step => widget.steps[_stepIndex];
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
      _remeasureTargetAfterLayout();
      _fade.forward();
    });
  }

  @override
  void dispose() {
    _fade.dispose();
    super.dispose();
  }

  void _applyTargetRect() {
    final rect = measurementCardTourTargetRect(
      widget.tourKeys,
      _step.targetKind,
    );
    if (rect == Rect.zero || !mounted) return;
    setState(() => _targetRect = rect);
  }

  void _remeasureTargetAfterLayout() {
    final ctx = widget.tourKeys.cardKey.currentContext;
    if (ctx != null) {
      Scrollable.ensureVisible(
        ctx,
        alignment: 0.05,
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeInOut,
      );
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _applyTargetRect();
      if (_targetRect == null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) _applyTargetRect();
        });
      }
    });
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
        _remeasureTargetAfterLayout();
        _fade.forward();
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final targetRect = _targetRect;
    final compact = targetRect != null && _isCompactTarget(targetRect);

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
                painter: _CardSpotlightPainter(
                  spotlight: targetRect,
                  compact: compact,
                ),
              )
            else
              Container(color: Colors.black54),
            if (targetRect != null)
              _CardTourTooltipBubble(
                targetRect: targetRect,
                isDark: isDark,
                step: _step,
                stepIndex: _stepIndex,
                stepCount: widget.steps.length,
                isLastStep: _isLastStep,
                compact: compact,
                preferAbove: _step.targetKind ==
                    MeasurementCardTourTargetKind.forecastIcon,
              ),
          ],
        ),
      ),
    );
  }

  static bool _isCompactTarget(Rect rect) =>
      rect.width <= 80 && rect.height <= 80;
}

class _CardSpotlightPainter extends CustomPainter {
  final Rect spotlight;
  final bool compact;

  static const double _pad = 8;
  static const double _radius = 12;

  const _CardSpotlightPainter({
    required this.spotlight,
    required this.compact,
  });

  Rect get _expanded {
    if (compact) {
      return Rect.fromLTRB(
        spotlight.left - _pad,
        spotlight.top - _pad,
        spotlight.right + _pad,
        spotlight.bottom + _pad,
      );
    }
    return Rect.fromLTRB(
      spotlight.left - _pad,
      spotlight.top - _pad,
      spotlight.right + _pad,
      spotlight.bottom - _pad,
    );
  }

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
  bool shouldRepaint(_CardSpotlightPainter old) =>
      old.spotlight != spotlight || old.compact != compact;
}

class _CardTourTooltipBubble extends StatelessWidget {
  final Rect targetRect;
  final bool isDark;
  final MeasurementCardTourStep step;
  final int stepIndex;
  final int stepCount;
  final bool isLastStep;
  final bool compact;
  final bool preferAbove;

  static const double _arrowH = 10.0;
  static const double _hPad = 16.0;
  static const double _gap = 8.0;
  static const double _estimatedBubbleHeight = 150.0;

  const _CardTourTooltipBubble({
    required this.targetRect,
    required this.isDark,
    required this.step,
    required this.stepIndex,
    required this.stepCount,
    required this.isLastStep,
    required this.compact,
    required this.preferAbove,
  });

  @override
  Widget build(BuildContext context) {
    final padding = MediaQuery.paddingOf(context);
    final screen = MediaQuery.sizeOf(context);
    final bubbleBg = isDark ? AppColors.darkHighlight : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1A1D23);
    final subColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;

    final spotlightBottom = compact
        ? targetRect.bottom + _gap
        : targetRect.bottom - 8 + _gap;
    final spotlightTop = compact ? targetRect.top - _gap : targetRect.top - 8;

    final placeBelow = !preferAbove &&
        spotlightBottom + _arrowH + _estimatedBubbleHeight <=
            screen.height - padding.bottom - _hPad;
    final arrowCx =
        targetRect.center.dx.clamp(_hPad + 20, screen.width - _hPad - 20);

    if (placeBelow) {
      return Positioned(
        top: spotlightBottom + _arrowH,
        left: _hPad + padding.left,
        right: _hPad + padding.right,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.only(
                left: (arrowCx - _hPad - padding.left - 10)
                    .clamp(0.0, screen.width - (_hPad + padding.horizontal) - 20),
              ),
              child: CustomPaint(
                size: const Size(20, _arrowH),
                painter: _UpArrowPainter(color: bubbleBg),
              ),
            ),
            _bubbleBody(bubbleBg, textColor, subColor),
          ],
        ),
      );
    }

    final bubbleBottom = spotlightTop - _arrowH;
    return Positioned(
      bottom: screen.height - bubbleBottom,
      left: _hPad + padding.left,
      right: _hPad + padding.right,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _bubbleBody(bubbleBg, textColor, subColor),
          Padding(
            padding: EdgeInsets.only(
              left: (arrowCx - _hPad - padding.left - 10)
                  .clamp(0.0, screen.width - (_hPad + padding.horizontal) - 20),
            ),
            child: CustomPaint(
              size: const Size(20, _arrowH),
              painter: _DownArrowPainter(color: bubbleBg),
            ),
          ),
        ],
      ),
    );
  }

  Widget _bubbleBody(Color bubbleBg, Color textColor, Color subColor) {
    return Container(
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
                child: Center(child: _stepIcon()),
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
                isLastStep
                    ? 'Tap anywhere to dismiss'
                    : 'Tap anywhere to continue',
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
    );
  }

  Widget _stepIcon() {
    if (step.svgAssetPath != null) {
      return SvgPicture.asset(
        step.svgAssetPath!,
        width: 20,
        height: 20,
        colorFilter:
            ColorFilter.mode(AppColors.primaryColor, BlendMode.srcIn),
      );
    }
    return Icon(
      step.icon,
      size: 20,
      color: AppColors.primaryColor,
    );
  }
}

class _UpArrowPainter extends CustomPainter {
  final Color color;
  const _UpArrowPainter({required this.color});

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
  bool shouldRepaint(_UpArrowPainter old) => old.color != color;
}

class _DownArrowPainter extends CustomPainter {
  final Color color;
  const _DownArrowPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width / 2, size.height)
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(path, Paint()..color = color);
  }

  @override
  bool shouldRepaint(_DownArrowPainter old) => old.color != color;
}
