import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

/// Shared primary retry/refresh CTA using the AirQo refresh glyph.
class RetryButton extends StatelessWidget {
  static const double iconSize = 18;

  final VoidCallback onPressed;
  final String label;
  final Widget? icon;
  final bool expand;

  const RetryButton({
    super.key,
    required this.onPressed,
    this.label = 'Try Again',
    this.icon,
    this.expand = false,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        minimumSize: expand ? const Size(double.infinity, 48) : Size.zero,
        tapTargetSize: expand ? null : MaterialTapTargetSize.shrinkWrap,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: Row(
        mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          icon ?? SystemGlyph.retry(size: iconSize),
          const SizedBox(width: 8),
          TranslatedText(label),
        ],
      ),
    );
  }
}
