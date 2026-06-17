import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_lesson_thumbnail.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnLevelUnlockPane extends StatelessWidget {
  final LearnStageInfo previousStage;
  final LearnStageInfo newStage;
  final VoidCallback onContinue;

  const LearnLevelUnlockPane({
    super.key,
    required this.previousStage,
    required this.newStage,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    final iconBg = LearnDesignTokens.iconBg(context);

    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
        LearnLessonExperienceBanner.horizontalInset,
        28,
        LearnLessonExperienceBanner.horizontalInset,
        16 + MediaQuery.paddingOf(context).bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: iconBg,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.emoji_events_outlined,
              size: 28,
              color: LearnDesignTokens.primary(context),
            ),
          ),
          const SizedBox(height: 14),
          TranslatedText(
            'Level unlocked',
            style: LearnDesignTokens.lessonTitle(context),
          ),
          const SizedBox(height: 4),
          TranslatedText(
            'You reached a new stage in your air quality journey.',
            textAlign: TextAlign.center,
            style: LearnDesignTokens.activitySubtitle(context),
          ),
          const SizedBox(height: 16),
          _LevelTransitionRow(
            previousStage: previousStage,
            newStage: newStage,
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: onContinue,
            style: learnExposurePrimaryButtonStyle(),
            child: const TranslatedText('Continue'),
          ),
        ],
      ),
    );
  }
}

class _LevelTransitionRow extends StatelessWidget {
  final LearnStageInfo previousStage;
  final LearnStageInfo newStage;

  const _LevelTransitionRow({
    required this.previousStage,
    required this.newStage,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: LearnDesignTokens.cardBg(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: LearnDesignTokens.divider(context)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _StageChip(
              stage: previousStage,
              highlighted: false,
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Icon(
              Icons.arrow_forward_rounded,
              size: 18,
              color: LearnDesignTokens.muted(context),
            ),
          ),
          Expanded(
            child: _StageChip(
              stage: newStage,
              highlighted: true,
            ),
          ),
        ],
      ),
    );
  }
}

class _StageChip extends StatelessWidget {
  final LearnStageInfo stage;
  final bool highlighted;

  const _StageChip({
    required this.stage,
    required this.highlighted,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: highlighted
                ? const Color(0xffE8F0FF)
                : LearnDesignTokens.successBg(context),
            border: Border.all(
              color: highlighted
                  ? LearnDesignTokens.primary(context)
                  : LearnDesignTokens.success,
              width: highlighted ? 2 : 1.5,
            ),
          ),
          child: Center(
            child: highlighted
                ? Text(
                    '${stage.index + 1}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: LearnDesignTokens.primary(context),
                    ),
                  )
                : LearnDesignTokens.completedCheckIconWidget(size: 16),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          stage.name,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 13,
            fontWeight: highlighted ? FontWeight.w700 : FontWeight.w500,
            color: highlighted
                ? LearnDesignTokens.primary(context)
                : LearnDesignTokens.muted(context),
          ),
        ),
      ],
    );
  }
}
