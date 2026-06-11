import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnCoursePortraitCard extends StatelessWidget {
  static const _footerHeight = 92.0;

  final LearnCourseViewModel course;
  final bool locked;
  final String? coverImageUrl;
  final VoidCallback? onTap;

  const LearnCoursePortraitCard({
    super.key,
    required this.course,
    required this.locked,
    this.coverImageUrl,
    this.onTap,
  });

  bool _hasPartialProgress(LearnProgressService progress) {
    for (final unit in course.units) {
      for (final lesson in unit.lessons) {
        if (progress.furthestStep(lesson.progressKey) > 0 &&
            !progress.isLessonComplete(lesson.progressKey)) {
          return true;
        }
      }
    }
    return false;
  }

  String _statusLabel({
    required bool isComplete,
    required bool isInProgress,
  }) {
    if (isComplete) return 'Completed';
    if (isInProgress) return 'In progress';
    return 'Not started';
  }

  @override
  Widget build(BuildContext context) {
    final progress = LearnProgressService.instance;
    final completed = course.completedLessons(progress);
    final total = course.totalLessons;
    final ratio = total > 0 ? completed / total : 0.0;
    final isComplete = !locked && total > 0 && completed >= total;
    final isInProgress = !locked &&
        !isComplete &&
        (completed > 0 || _hasPartialProgress(progress));
    final progressColor = isComplete
        ? LearnDesignTokens.success
        : LearnDesignTokens.primary(context);
    final radius = BorderRadius.circular(LearnDesignTokens.portraitCardRadius);
    final topRadius = BorderRadius.vertical(
      top: Radius.circular(LearnDesignTokens.portraitCardRadius),
    );

    Widget card = Container(
      decoration: BoxDecoration(
        borderRadius: radius,
        color: LearnDesignTokens.cardBg(context),
        border: Border.all(color: LearnDesignTokens.divider(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: topRadius,
              child: coverImageUrl != null && coverImageUrl!.isNotEmpty
                  ? Image.network(
                      coverImageUrl!,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                      errorBuilder: (_, __, ___) => Container(
                        color: Theme.of(context).highlightColor,
                      ),
                    )
                  : Container(color: Theme.of(context).highlightColor),
            ),
          ),
          SizedBox(
            height: _footerHeight,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Course ${course.courseNumber}',
                    style: LearnDesignTokens.lessonLabel(context),
                  ),
                  const SizedBox(height: 2),
                  Expanded(
                    child: TranslatedText(
                      course.plainTitleKey,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: LearnDesignTokens.headline(context),
                        height: 1.2,
                      ),
                    ),
                  ),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: ratio,
                      minHeight: 3,
                      backgroundColor: LearnDesignTokens.divider(context),
                      color: progressColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  TranslatedText(
                    _statusLabel(
                      isComplete: isComplete,
                      isInProgress: isInProgress,
                    ),
                    style: LearnDesignTokens.activitySubtitle(context),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );

    if (locked) {
      card = LearnDesignTokens.lockedContentBlur(
        borderRadius: radius,
        child: card,
      );
    }

    return GestureDetector(
      onTap: locked ? null : onTap,
      child: card,
    );
  }
}
