import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class LearnQuizOptionTile extends StatelessWidget {
  final String label;
  final bool selected;
  final bool revealed;
  final bool isCorrectOption;
  final bool showCheckbox;
  final VoidCallback? onTap;

  const LearnQuizOptionTile({
    super.key,
    required this.label,
    required this.selected,
    this.revealed = false,
    this.isCorrectOption = false,
    this.showCheckbox = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    Color borderColor = theme.dividerColor;
    Color bg = Colors.transparent;

    if (revealed) {
      if (isCorrectOption) {
        borderColor = LearnDesignTokens.success;
        bg = LearnDesignTokens.successBg(context);
      } else if (selected) {
        borderColor = LearnDesignTokens.error;
        bg = LearnDesignTokens.errorBg(context);
      }
    } else if (selected) {
      borderColor = AppColors.primaryColor;
      bg = AppColors.primaryColor.withValues(alpha: 0.05);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: revealed ? null : onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              border: Border.all(
                color: borderColor,
                width: selected || (revealed && isCorrectOption) ? 2 : 1,
              ),
              borderRadius: BorderRadius.circular(8),
              color: bg,
            ),
            child: Row(
              children: [
                _LeadingIndicator(
                  selected: selected,
                  revealed: revealed,
                  isCorrectOption: isCorrectOption,
                  showCheckbox: showCheckbox,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TranslatedText(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight:
                          selected ? FontWeight.w600 : FontWeight.normal,
                      color: LearnDesignTokens.headline(context),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _LeadingIndicator extends StatelessWidget {
  final bool selected;
  final bool revealed;
  final bool isCorrectOption;
  final bool showCheckbox;

  const _LeadingIndicator({
    required this.selected,
    required this.revealed,
    required this.isCorrectOption,
    required this.showCheckbox,
  });

  @override
  Widget build(BuildContext context) {
    if (showCheckbox) {
      return Container(
        width: 20,
        height: 20,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: selected || (revealed && isCorrectOption)
                ? (isCorrectOption || selected
                    ? LearnDesignTokens.success
                    : LearnDesignTokens.error)
                : Theme.of(context).dividerColor,
            width: 2,
          ),
          color: selected || (revealed && isCorrectOption)
              ? (isCorrectOption
                  ? LearnDesignTokens.success
                  : LearnDesignTokens.error)
              : Colors.transparent,
        ),
        child: (selected || (revealed && isCorrectOption))
            ? Icon(
                Icons.check,
                size: 12,
                color: isCorrectOption || selected ? Colors.white : Colors.white,
              )
            : null,
      );
    }

    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: selected || (revealed && isCorrectOption)
              ? LearnDesignTokens.success
              : Theme.of(context).dividerColor,
          width: 2,
        ),
        color: selected || (revealed && isCorrectOption)
            ? LearnDesignTokens.success
            : Colors.transparent,
      ),
      child: (selected || (revealed && isCorrectOption))
          ? const Icon(Icons.check, size: 12, color: Colors.white)
          : null,
    );
  }
}

class LearnQuizFeedbackBanner extends StatelessWidget {
  final String message;
  final bool isCorrect;

  const LearnQuizFeedbackBanner({
    super.key,
    required this.message,
    required this.isCorrect,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 8, bottom: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isCorrect
            ? LearnDesignTokens.successBg(context)
            : LearnDesignTokens.errorBg(context),
        borderRadius: BorderRadius.circular(8),
      ),
      child: TranslatedText(
        message,
        style: TextStyle(
          fontSize: 13,
          color: isCorrect
              ? LearnDesignTokens.successText(context)
              : LearnDesignTokens.errorText(context),
          height: 1.4,
        ),
      ),
    );
  }
}
