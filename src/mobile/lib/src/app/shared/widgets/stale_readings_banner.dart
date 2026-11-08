import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

/// Calm, brand-coloured notice shown when the readings on screen are not the
/// very latest (or have not arrived yet).
///
/// Messaging rule: keep it positive and forward-looking ("fresh updates are on
/// their way"). Never state how old data is or frame it as a failure — no
/// hour counts, timestamps, "delayed", or warning colours.
class StaleReadingsBanner extends StatelessWidget {
  const StaleReadingsBanner({
    super.key,
    required this.message,
    this.elevated = false,
  });

  final String message;

  /// Floating over the map needs an opaque, raised surface to stay legible;
  /// inline in a list it sits flat on the page.
  final bool elevated;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyMedium?.color;
    final tint = AppColors.primaryColor.withValues(alpha: 0.08);

    final content = Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: elevated ? Color.alphaBlend(tint, theme.cardColor) : tint,
        borderRadius: BorderRadius.circular(elevated ? 12 : 8),
        border:
            Border.all(color: AppColors.primaryColor.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          Icon(Icons.autorenew, size: 18, color: AppColors.primaryColor),
          const SizedBox(width: 8),
          Expanded(
            child: TranslatedText(
              message,
              style: TextStyle(fontSize: 13, color: textColor),
            ),
          ),
        ],
      ),
    );

    if (!elevated) return content;
    return Material(
      elevation: 3,
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(12),
      child: content,
    );
  }
}
