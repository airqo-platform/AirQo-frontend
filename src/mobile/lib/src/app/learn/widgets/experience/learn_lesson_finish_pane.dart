import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
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

  const LearnLessonFinishPane({
    super.key,
    required this.result,
    required this.lessonNumberInUnit,
    required this.lessonsInUnit,
    this.unitPlainTitle,
    required this.onDone,
    this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    final unitTitle = unitPlainTitle;

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(3, (i) {
                    final filled = i < result.stars;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Icon(
                        filled ? Icons.star_rounded : Icons.star_outline_rounded,
                        size: 36,
                        color: filled
                            ? const Color(0xFFF5A623)
                            : LearnDesignTokens.disabled,
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 14),
                TranslatedText(
                  'Star earned!',
                  style: LearnDesignTokens.lessonTitle(context),
                ),
                const SizedBox(height: 6),
                if (unitTitle != null && unitTitle.isNotEmpty)
                  TranslatedText(
                    learnLessonCompleteSubtitle(
                      lessonNumberInUnit - 1,
                      unitTitle,
                    ),
                    textAlign: TextAlign.center,
                    style: LearnDesignTokens.activitySubtitle(context),
                  ),
                const SizedBox(height: 12),
                Text(
                  '${result.pointsEarned} points earned',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: LearnDesignTokens.primary(context),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '$lessonNumberInUnit of $lessonsInUnit lessons in this unit',
                  style: LearnDesignTokens.activitySubtitle(context),
                ),
              ],
            ),
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              children: [
                if (onNext != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: ElevatedButton(
                      onPressed: onNext,
                      style: learnExposurePrimaryButtonStyle(),
                      child: const TranslatedText('Next lesson'),
                    ),
                  ),
                OutlinedButton(
                  onPressed: onDone,
                  style: learnExposureSecondaryButtonStyle(context),
                  child: const TranslatedText('Done'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
