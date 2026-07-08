import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Rasterizes the [RepaintBoundary] under [key] into PNG bytes for sharing.
/// The device-pixel ratio is clamped so share images stay sharp without
/// ballooning memory on high-density screens.
Future<Uint8List?> captureShareBoundary(
  BuildContext context,
  GlobalKey key,
) async {
  final pixelRatio =
      MediaQuery.of(context).devicePixelRatio.clamp(2.0, 3.0).toDouble();

  await Future<void>.delayed(const Duration(milliseconds: 16));

  final boundary =
      key.currentContext?.findRenderObject() as RenderRepaintBoundary?;
  if (boundary == null) return null;

  final image = await boundary.toImage(pixelRatio: pixelRatio);
  try {
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    return byteData?.buffer.asUint8List();
  } finally {
    image.dispose();
  }
}

/// Signature the share tabs use to surface a short status line in the
/// sheet's inline banner. [actionLabel]/[onAction] add a single tap action
/// (e.g. Retry, Settings).
typedef ShareSheetMessenger = void Function(
  String message, {
  bool isError,
  String? actionLabel,
  VoidCallback? onAction,
});

class InlineMessageBanner extends StatelessWidget {
  final String message;
  final bool isError;
  final String? actionLabel;
  final VoidCallback? onAction;

  const InlineMessageBanner({
    super.key,
    required this.message,
    this.isError = false,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final errorColor = Theme.of(context).colorScheme.error;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: isError
            ? errorColor.withValues(alpha: 0.10)
            : LearnDesignTokens.nestedSurface(context),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: 14,
          vertical: actionLabel == null ? 10 : 4,
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isError
                      ? errorColor
                      : LearnDesignTokens.headline(context),
                ),
              ),
            ),
            if (actionLabel != null) ...[
              const SizedBox(width: 8),
              TextButton(
                onPressed: onAction,
                child: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Matches the pill-shaped view/country selector used on the dashboard, map,
/// and learn tab (see `ViewSelector._buildViewButton`).
class ShareTabChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const ShareTabChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primaryColor
              : (isDark
                  ? AppColors.darkHighlight
                  : AppColors.dividerColorlight),
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: selected
                ? Colors.white
                : (isDark ? Colors.white : Colors.black87),
          ),
        ),
      ),
    );
  }
}

class ShareActionButton extends StatelessWidget {
  final String label;
  final bool loading;
  final VoidCallback? onPressed;

  const ShareActionButton({
    super.key,
    required this.label,
    required this.loading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      style: learnExposurePrimaryButtonStyle(enabled: onPressed != null),
      icon: loading
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Colors.white,
              ),
            )
          : SvgPicture.asset(
              'assets/icons/share-icon.svg',
              width: 18,
              height: 18,
              colorFilter:
                  const ColorFilter.mode(Colors.white, BlendMode.srcIn),
            ),
      label: Text(label),
    );
  }
}

/// Simple checkerboard backdrop shown only in-app (not part of the captured
/// image) so users can see the sticker preview really is transparent.
class CheckerboardBackground extends StatelessWidget {
  final Widget child;
  final double borderRadius;

  const CheckerboardBackground({
    super.key,
    required this.child,
    this.borderRadius = 0,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: CustomPaint(
        painter: _CheckerboardPainter(),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: child,
        ),
      ),
    );
  }
}

class _CheckerboardPainter extends CustomPainter {
  static const double _tile = 10;

  @override
  void paint(Canvas canvas, Size size) {
    final light = Paint()..color = const Color(0xFFEDEDED);
    final dark = Paint()..color = const Color(0xFFD8D8D8);

    canvas.drawRect(Offset.zero & size, light);

    for (double y = 0; y < size.height; y += _tile) {
      for (double x = 0; x < size.width; x += _tile) {
        final isDark = ((x / _tile).floor() + (y / _tile).floor()) % 2 == 0;
        if (isDark) {
          canvas.drawRect(Rect.fromLTWH(x, y, _tile, _tile), dark);
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
