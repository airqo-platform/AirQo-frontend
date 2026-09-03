import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/app/shared/widgets/retry_button.dart';
import 'package:flutter/material.dart';

/// Shared empty/error UI: system glyph, title, message, and optional action.
class EmptyStateView extends StatelessWidget {
  final Widget icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Widget? actionIcon;
  final bool compact;

  const EmptyStateView({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
    this.actionIcon,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final titleColor = Theme.of(context).textTheme.headlineMedium?.color;
    final bodyColor = Theme.of(context).textTheme.bodyMedium?.color;
    final titleSize = compact ? 16.0 : 18.0;
    final bodySize = compact ? 14.0 : 16.0;

    return Center(
      child: Padding(
        padding: EdgeInsets.all(compact ? 16.0 : 24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            icon,
            SizedBox(height: compact ? 12 : 16),
            TranslatedText(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: titleSize,
                fontWeight: FontWeight.bold,
                color: titleColor,
              ),
            ),
            SizedBox(height: compact ? 6 : 8),
            TranslatedText(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: bodySize,
                color: bodyColor,
              ),
            ),
            if (actionLabel != null && onAction != null) ...[
              SizedBox(height: compact ? 16 : 24),
              RetryButton(
                onPressed: onAction!,
                label: actionLabel!,
                icon: actionIcon,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
