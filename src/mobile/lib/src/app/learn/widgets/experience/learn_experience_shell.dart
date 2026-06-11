import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_lesson_thumbnail.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class LearnExperienceShell extends StatelessWidget {
  final LearnLessonSlot slot;
  final int unitIndex;
  final int lessonIndex;
  final String lessonTitle;
  final String activityName;
  final int currentStep;
  final int totalSteps;
  final String activityProgressLabel;
  final Widget body;
  final Widget bottomBar;
  final VoidCallback? onClose;
  final bool showDragHandle;

  const LearnExperienceShell({
    super.key,
    required this.slot,
    required this.unitIndex,
    required this.lessonIndex,
    required this.lessonTitle,
    required this.activityName,
    required this.currentStep,
    required this.totalSteps,
    required this.activityProgressLabel,
    required this.body,
    required this.bottomBar,
    this.onClose,
    this.showDragHandle = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final subtitleColor = isDark
        ? AppColors.boldHeadlineColor2
        : AppColors.secondaryHeadlineColor4;
    final progress = totalSteps > 0 ? currentStep / totalSteps : 0.0;
    const horizontalPadding = LearnLessonExperienceBanner.horizontalInset;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (showDragHandle)
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            child: Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: subtitleColor.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
        Padding(
          padding: EdgeInsets.fromLTRB(
            horizontalPadding,
            8,
            horizontalPadding,
            8,
          ),
          child: LearnLessonExperienceBanner(
            slot: slot,
            unitIndex: unitIndex,
            lessonIndex: lessonIndex,
            lessonTitle: lessonTitle,
            activityName: activityName,
            progress: progress,
            activityProgressLabel: activityProgressLabel,
          ),
        ),
        Expanded(child: body),
        bottomBar,
      ],
    );
  }
}

class LearnExperienceBottomBar extends StatelessWidget {
  final String primaryLabel;
  final VoidCallback? onPrimary;
  final bool primaryEnabled;

  const LearnExperienceBottomBar({
    super.key,
    this.primaryLabel = 'Continue',
    this.onPrimary,
    this.primaryEnabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: ElevatedButton(
          onPressed: primaryEnabled ? onPrimary : null,
          style: learnExposurePrimaryButtonStyle(enabled: primaryEnabled),
          child: TranslatedText(primaryLabel),
        ),
      ),
    );
  }
}

class LearnActivityCardShell extends StatelessWidget {
  final Widget child;

  const LearnActivityCardShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      decoration: BoxDecoration(
        color: LearnDesignTokens.cardBg(context),
        borderRadius:
            BorderRadius.circular(LearnDesignTokens.activityCardRadius),
        border: Border.all(color: LearnDesignTokens.divider(context)),
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }
}
