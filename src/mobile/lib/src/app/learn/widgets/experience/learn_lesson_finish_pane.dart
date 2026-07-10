import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_completion_sheet.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnLessonFinishPane extends StatelessWidget {
  final LearnLessonResult result;
  final int lessonNumberInUnit;
  final int lessonsInUnit;
  final String? unitPlainTitle;
  final VoidCallback onDone;
  final VoidCallback? onNext;
  final bool isNextUnit;

  const LearnLessonFinishPane({
    super.key,
    required this.result,
    required this.lessonNumberInUnit,
    required this.lessonsInUnit,
    this.unitPlainTitle,
    required this.onDone,
    this.onNext,
    this.isNextUnit = false,
  });

  String get _primaryLabel => isNextUnit ? 'Next unit' : 'Next lesson';

  @override
  Widget build(BuildContext context) {
    final unitTitle = unitPlainTitle;
    final hasNext = onNext != null;
    final captionStyle = LearnDesignTokens.completionCaption(context);

    return LearnCompletionSheet.compactBody(
      context: context,
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: LearnDesignTokens.successBg(context),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              LearnDesignTokens.completedCheckIcon,
              size: 28,
              color: LearnDesignTokens.success,
            ),
          ),
          const SizedBox(height: 14),
          TranslatedText(
            'Lesson completed',
            style: LearnDesignTokens.completionTitle(context),
          ),
          const SizedBox(height: 4),
          if (unitTitle != null && unitTitle.isNotEmpty)
            TranslatedText(
              learnLessonCompleteSubtitle(
                lessonNumberInUnit - 1,
                unitTitle,
              ),
              textAlign: TextAlign.center,
              style: LearnDesignTokens.completionSubtitle(context),
            ),
          const SizedBox(height: 10),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(3, (i) {
              final earned = i < result.stars;
              return Icon(
                earned ? Icons.star_rounded : Icons.star_outline_rounded,
                size: 28,
                color: earned
                    ? const Color(0xFFFFB300)
                    : LearnDesignTokens.muted(context),
              );
            }),
          ),
          const SizedBox(height: 8),
          Text(
            '${result.pointsEarned} points earned',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: LearnDesignTokens.primary(context),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '$lessonNumberInUnit of $lessonsInUnit lessons in this unit',
            textAlign: TextAlign.center,
            style: captionStyle,
          ),
        ],
      ),
      actions: [
        if (hasNext) ...[
          ElevatedButton(
            onPressed: onNext,
            style: learnExposurePrimaryButtonStyle(),
            child: TranslatedText(_primaryLabel),
          ),
          const SizedBox(height: 8),
        ],
        OutlinedButton(
          onPressed: onDone,
          style: learnExposureSecondaryButtonStyle(context),
          child: const TranslatedText('Done'),
        ),
      ],
    );
  }
}
