import 'package:airqo/src/app/dashboard/widgets/measurement_card_action_strip.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// GlobalKey for the first dashboard measurement card used by the gestures tour.
class MeasurementCardTourKeys {
  final GlobalKey cardKey = GlobalKey(debugLabel: 'measurement_card');
  final GlobalKey shareIconKey = GlobalKey(debugLabel: 'measurement_share');
  final GlobalKey forecastIconKey =
      GlobalKey(debugLabel: 'measurement_forecast');

  /// Composited anchors. The spotlight follows these, so it stays on the
  /// painted control instead of a one-shot layout measurement.
  final LayerLink cardLink = LayerLink();
  final LayerLink shareLink = LayerLink();
  final LayerLink forecastLink = LayerLink();
}

/// Wraps [child] in a tour anchor when [link] is set.
Widget measurementCardTourAnchor({
  required LayerLink? link,
  required Widget child,
}) {
  if (link == null) return child;
  return CompositedTransformTarget(link: link, child: child);
}

const String measurementCardGesturesTourSeenKey =
    'measurement_card_forecast_tour_seen_v2';

/// Set to true when ready to show the first-run card gestures tour again.
const bool kMeasurementCardGesturesTourEnabled = true;

enum MeasurementCardTourTargetKind { tapZone, shareIcon, forecastIcon }

/// Whether the first card is attached and laid out.
bool measurementCardTourTargetsReady(MeasurementCardTourKeys keys) {
  return keys.cardKey.currentContext != null &&
      keys.forecastIconKey.currentContext != null;
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

Rect? _boxRect(GlobalKey key, RenderBox? relativeTo) {
  final box = key.currentContext?.findRenderObject() as RenderBox?;
  if (box == null || !box.hasSize) return null;
  final globalTopLeft = box.localToGlobal(Offset.zero);
  final topLeft = relativeTo?.globalToLocal(globalTopLeft) ?? globalTopLeft;
  return topLeft & box.size;
}

/// The keyed card box includes the container margin. Icon slots sit inside
/// the painted card, so geometry has to drop that margin first.
Rect _cardContentRect(Rect cardBox) {
  return Rect.fromLTRB(
    cardBox.left + 16,
    cardBox.top + 8,
    cardBox.right - 16,
    cardBox.bottom - 8,
  );
}

Rect _shareIconRect(Rect content) {
  return Rect.fromLTWH(
    content.right -
        kMeasurementCardHorizontalPadding -
        kMeasurementCardActionTapTarget,
    content.top + kMeasurementCardTopPadding,
    kMeasurementCardActionTapTarget,
    kMeasurementCardActionTapTarget,
  );
}

Rect _forecastIconRect(Rect content) {
  return Rect.fromLTWH(
    content.right -
        kMeasurementCardHorizontalPadding -
        kMeasurementCardActionTapTarget,
    content.bottom -
        kMeasurementCardBottomPadding -
        kMeasurementCardActionTapTarget,
    kMeasurementCardActionTapTarget,
    kMeasurementCardActionTapTarget,
  );
}

/// Spotlight rect for one tour step.
///
/// The forecast step must land on the bottom chevron. A measured box that
/// overlaps the top share icon is rejected, so the hole cannot stick to the
/// share control.
Rect measurementCardTourTargetRect(
  MeasurementCardTourKeys keys,
  MeasurementCardTourTargetKind kind, {
  RenderBox? relativeTo,
}) {
  final card = _boxRect(keys.cardKey, relativeTo);
  if (card == null) return Rect.zero;
  final content = _cardContentRect(card);

  switch (kind) {
    case MeasurementCardTourTargetKind.tapZone:
      return Rect.fromLTRB(
        content.left,
        content.top,
        content.right -
            kMeasurementCardHorizontalPadding -
            kMeasurementCardActionTapTarget,
        content.bottom -
            kMeasurementCardBottomPadding -
            kMeasurementCardActionTapTarget,
      );
    case MeasurementCardTourTargetKind.shareIcon:
      final expected = _shareIconRect(content);
      final measured = _boxRect(keys.shareIconKey, relativeTo);
      if (measured != null && measured.overlaps(expected.inflate(12))) {
        return measured;
      }
      return expected;
    case MeasurementCardTourTargetKind.forecastIcon:
      final expected = _forecastIconRect(content);
      final measured = _boxRect(keys.forecastIconKey, relativeTo);
      final share = _shareIconRect(content);
      final measuredIsShareIcon =
          measured != null && measured.overlaps(share.inflate(12));
      if (measured != null &&
          !measuredIsShareIcon &&
          measured.overlaps(expected.inflate(12))) {
        return measured;
      }
      return expected;
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

enum MeasurementCardTourView { nearYou, favorites, locations }

List<MeasurementCardTourStep> buildMeasurementCardGesturesTourSteps({
  MeasurementCardTourView view = MeasurementCardTourView.locations,
}) {
  if (view == MeasurementCardTourView.nearYou) {
    return const [
      MeasurementCardTourStep(
        targetKind: MeasurementCardTourTargetKind.forecastIcon,
        svgAssetPath: 'assets/icons/chevron-right.svg',
        title: 'See the forecast',
        subtitle:
            'Tap the chevron to view the hourly and daily forecast for this place.',
      ),
    ];
  }

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
      subtitle: 'You can also tap the share icon here to open sharing options.',
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

class _MeasurementCardGesturesTourState
    extends State<MeasurementCardGesturesTour>
    with SingleTickerProviderStateMixin {
  final GlobalKey _overlayKey = GlobalKey();
  final GlobalKey _markerKey = GlobalKey();
  int _stepIndex = 0;
  Rect? _targetRect;
  bool _tracking = false;
  int _syncAttempts = 0;
  late AnimationController _fade;
  late Animation<double> _opacity;

  MeasurementCardTourStep get _step => widget.steps[_stepIndex];
  bool get _isLastStep => _stepIndex >= widget.steps.length - 1;

  GlobalKey get _targetKey => switch (_step.targetKind) {
        MeasurementCardTourTargetKind.shareIcon => widget.tourKeys.shareIconKey,
        MeasurementCardTourTargetKind.forecastIcon =>
          widget.tourKeys.forecastIconKey,
        MeasurementCardTourTargetKind.tapZone => widget.tourKeys.cardKey,
      };

  LayerLink get _stepLink => switch (_step.targetKind) {
        MeasurementCardTourTargetKind.shareIcon => widget.tourKeys.shareLink,
        MeasurementCardTourTargetKind.forecastIcon =>
          widget.tourKeys.forecastLink,
        MeasurementCardTourTargetKind.tapZone => widget.tourKeys.cardLink,
      };

  bool get _preferAbove =>
      _step.targetKind == MeasurementCardTourTargetKind.forecastIcon;

  @override
  void initState() {
    super.initState();
    _fade = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
    );
    _opacity = CurvedAnimation(parent: _fade, curve: Curves.easeOut);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollTargetIntoView();
      _startTracking();
      _fade.forward();
    });
  }

  @override
  void dispose() {
    _tracking = false;
    _fade.dispose();
    super.dispose();
  }

  void _scrollTargetIntoView() {
    final ctx =
        _targetKey.currentContext ?? widget.tourKeys.cardKey.currentContext;
    if (ctx == null) return;
    Scrollable.ensureVisible(
      ctx,
      alignment: 0.58,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeInOut,
    );
  }

  void _startTracking() {
    if (_tracking) return;
    _tracking = true;
    WidgetsBinding.instance.addPostFrameCallback((_) => _syncHole());
  }

  /// Reads the composited position of the anchored control. Layout-box
  /// coordinates were landing on the next card; the follower transform matches
  /// where the chevron is actually painted.
  void _syncHole() {
    if (!mounted || !_tracking) return;
    final marker = _markerKey.currentContext?.findRenderObject() as RenderBox?;
    final overlay =
        _overlayKey.currentContext?.findRenderObject() as RenderBox?;
    if (marker != null &&
        overlay != null &&
        marker.attached &&
        overlay.attached &&
        marker.hasSize) {
      final topLeft = marker.localToGlobal(Offset.zero, ancestor: overlay);
      final rect = topLeft & marker.size;
      final previous = _targetRect;
      final plausible = rect.width > 1 && rect.height > 1 && rect.top > 40;
      final moved = previous == null ||
          (previous.center - rect.center).distance > 0.5 ||
          (previous.width - rect.width).abs() > 0.5;
      if (plausible && moved) {
        setState(() => _targetRect = rect);
      }
      if (!plausible && _syncAttempts < 40) {
        _syncAttempts++;
        WidgetsBinding.instance.scheduleFrame();
      }
    } else if (_syncAttempts < 40) {
      _syncAttempts++;
      WidgetsBinding.instance.scheduleFrame();
    }
    WidgetsBinding.instance.addPostFrameCallback((_) => _syncHole());
  }

  Size _markerSize() {
    final box = _targetKey.currentContext?.findRenderObject() as RenderBox?;
    if (box != null && box.hasSize && box.size.shortestSide > 0) {
      return box.size;
    }
    return const Size(
      kMeasurementCardActionTapTarget,
      kMeasurementCardActionTapTarget,
    );
  }

  /// Trailing share and forecast slots share the same horizontal inset.
  double _anchorCenterX(double screenWidth) {
    switch (_step.targetKind) {
      case MeasurementCardTourTargetKind.shareIcon:
      case MeasurementCardTourTargetKind.forecastIcon:
        return screenWidth -
            16 -
            kMeasurementCardHorizontalPadding -
            kMeasurementCardActionTapTarget / 2;
      case MeasurementCardTourTargetKind.tapZone:
        return screenWidth / 2;
    }
  }

  Rect? _spotlightRect() {
    final raw = _targetRect;
    if (raw == null) return null;
    if (_step.targetKind == MeasurementCardTourTargetKind.tapZone) {
      final deflated = Rect.fromLTRB(
        raw.left + 16,
        raw.top + 8,
        raw.right - 16,
        raw.bottom - 8,
      );
      if (deflated.width < 8 || deflated.height < 8) return raw;
      return deflated;
    }
    // Icon slots are 40px. The follower box can report a much larger size,
    // which was opening a hole over the next card. Pin the hole to the
    // anchored corner.
    const slot = kMeasurementCardActionTapTarget;
    return Rect.fromLTWH(raw.left, raw.top, slot, slot).inflate(6);
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
        _syncAttempts = 0;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scrollTargetIntoView();
        _fade.forward();
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final spotlight = _spotlightRect();
    final preferAbove = _preferAbove;

    return FadeTransition(
      opacity: _opacity,
      child: SizedBox.expand(
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _advance,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final overlaySize =
                  Size(constraints.maxWidth, constraints.maxHeight);
              final bubbleWidth = overlaySize.width - 32;
              final markerSize = _markerSize();
              final hole = spotlight;
              final placeBelow = hole != null &&
                  (!preferAbove || hole.top < 180);
              final anchorX = hole?.center.dx ?? _anchorCenterX(overlaySize.width);
              final arrowLeft =
                  (anchorX - 16 - 10).clamp(0.0, bubbleWidth - 20);
              final bubble = _CardTourTooltipBubble(
                isDark: isDark,
                step: _step,
                stepIndex: _stepIndex,
                stepCount: widget.steps.length,
                isLastStep: _isLastStep,
                placeBelow: placeBelow,
                arrowLeft: arrowLeft,
              );

              return Stack(
                key: _overlayKey,
                children: [
                  Positioned.fill(
                    child: CustomPaint(
                      painter: _CardSpotlightPainter(spotlight: spotlight),
                    ),
                  ),
                  CompositedTransformFollower(
                    link: _stepLink,
                    showWhenUnlinked: false,
                    targetAnchor: Alignment.topLeft,
                    followerAnchor: Alignment.topLeft,
                    child: SizedBox(
                      key: _markerKey,
                      width: markerSize.width,
                      height: markerSize.height,
                    ),
                  ),
                  if (hole != null)
                    Positioned(
                      left: 16,
                      right: 16,
                      top: placeBelow ? hole.bottom + 8 : null,
                      bottom: placeBelow
                          ? null
                          : overlaySize.height - hole.top + 8,
                      child: bubble,
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _CardSpotlightPainter extends CustomPainter {
  final Rect? spotlight;

  static const double _radius = 12;

  const _CardSpotlightPainter({required this.spotlight});

  @override
  void paint(Canvas canvas, Size size) {
    final hole = spotlight;
    final scrim = Paint()..color = Colors.black.withValues(alpha: 0.68);
    if (hole == null || hole.width < 1 || hole.height < 1) {
      canvas.drawRect(Offset.zero & size, scrim);
      return;
    }

    canvas.saveLayer(Offset.zero & size, Paint());
    canvas.drawRect(Offset.zero & size, scrim);
    canvas.drawRRect(
      RRect.fromRectAndRadius(hole, const Radius.circular(_radius)),
      Paint()..blendMode = BlendMode.clear,
    );
    canvas.restore();

    canvas.drawRRect(
      RRect.fromRectAndRadius(hole, const Radius.circular(_radius)),
      Paint()
        ..color = Colors.white.withValues(alpha: 0.25)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5,
    );
  }

  @override
  bool shouldRepaint(_CardSpotlightPainter old) => old.spotlight != spotlight;
}

class _CardTourTooltipBubble extends StatelessWidget {
  final bool isDark;
  final MeasurementCardTourStep step;
  final int stepIndex;
  final int stepCount;
  final bool isLastStep;
  final bool placeBelow;
  final double arrowLeft;

  static const double _arrowH = 10.0;

  const _CardTourTooltipBubble({
    required this.isDark,
    required this.step,
    required this.stepIndex,
    required this.stepCount,
    required this.isLastStep,
    required this.placeBelow,
    required this.arrowLeft,
  });

  @override
  Widget build(BuildContext context) {
    final bubbleBg = isDark ? AppColors.darkHighlight : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1A1D23);
    final subColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;
    final arrow = Padding(
      padding: EdgeInsets.only(left: arrowLeft),
      child: CustomPaint(
        size: const Size(20, _arrowH),
        painter: placeBelow
            ? _UpArrowPainter(color: bubbleBg)
            : _DownArrowPainter(color: bubbleBg),
      ),
    );
    final body = _bubbleBody(bubbleBg, textColor, subColor);

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: placeBelow ? [arrow, body] : [body, arrow],
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
                      step.subtitle,
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
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                '${stepIndex + 1} of $stepCount',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 11,
                  height: 1,
                  color: subColor,
                  fontWeight: FontWeight.w600,
                  decoration: TextDecoration.none,
                ),
              ),
              const Spacer(),
              Text(
                isLastStep
                    ? 'Tap anywhere to dismiss'
                    : 'Tap anywhere to continue',
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
              isLastStep
                  ? AqChevronDown(
                      size: 16,
                      color: subColor,
                    )
                  : AqChevronRight(
                      size: 16,
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
        colorFilter: ColorFilter.mode(AppColors.primaryColor, BlendMode.srcIn),
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
