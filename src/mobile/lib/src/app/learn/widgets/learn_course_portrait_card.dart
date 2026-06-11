import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnCoursePortraitCard extends StatelessWidget {
  final LearnCourseViewModel course;
  final bool locked;
  final VoidCallback? onTap;

  const LearnCoursePortraitCard({
    super.key,
    required this.course,
    required this.locked,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final progress = LearnProgressService.instance;
    final completed = course.completedLessons(progress);
    final total = course.totalLessons;
    final ratio = total > 0 ? completed / total : 0.0;

    return GestureDetector(
      onTap: locked ? null : onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(LearnDesignTokens.portraitCardRadius),
          color: LearnDesignTokens.cardBg(context),
          border: Border.all(color: LearnDesignTokens.divider(context)),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: const Color(0xffE8F0FF),
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(LearnDesignTokens.portraitCardRadius),
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(course.emoji, style: const TextStyle(fontSize: 40)),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Course ${course.courseNumber}',
                        style: LearnDesignTokens.lessonLabel(context),
                      ),
                      TranslatedText(
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
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: ratio,
                          minHeight: 3,
                          backgroundColor: LearnDesignTokens.divider(context),
                          color: LearnDesignTokens.primary(context),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$completed / $total',
                        style: LearnDesignTokens.activitySubtitle(context),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (locked)
              Container(
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.35),
                  borderRadius:
                      BorderRadius.circular(LearnDesignTokens.portraitCardRadius),
                ),
                alignment: Alignment.center,
                child: Icon(Icons.lock, color: Colors.white.withValues(alpha: 0.9), size: 28),
              ),
          ],
        ),
      ),
    );
  }
}
