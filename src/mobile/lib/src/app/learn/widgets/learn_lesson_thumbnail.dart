import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

/// Full-width header gradient for lesson cards.
class LearnLessonThumbnail extends StatelessWidget {
  static const height = 72.0;

  /// Non-semantic palettes: USG orange, hazardous, light blue.
  static const _gradients = [
    (
      light: Color(0xFFFFC170),
      dark: Color(0xFFFF851F),
      number: Color(0xFF9A4E00),
    ),
    (
      light: Color(0xFFF0B1D8),
      dark: Color(0xFFD95BA3),
      number: Color(0xFF8B2868),
    ),
    (
      light: Color(0xFFBFE7FF),
      dark: Color(0xFF5EB3F5),
      number: Color(0xFF1A5F8F),
    ),
  ];

  final LearnLessonSlot slot;
  final int unitIndex;
  final int lessonIndex;

  const LearnLessonThumbnail({
    super.key,
    required this.slot,
    required this.unitIndex,
    required this.lessonIndex,
  });

  static int gradientIndex(int unitIndex, int lessonIndex) {
    return (lessonIndex + unitIndex) % _gradients.length;
  }

  static LinearGradient gradientFor(int unitIndex, int lessonIndex) {
    final palette = _gradients[gradientIndex(unitIndex, lessonIndex)];
    return LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [palette.light, palette.dark],
    );
  }

  static Color numberColorFor(int unitIndex, int lessonIndex) {
    return _gradients[gradientIndex(unitIndex, lessonIndex)].number;
  }

  static Color progressTrackColorFor(int unitIndex, int lessonIndex) {
    return numberColorFor(unitIndex, lessonIndex).withValues(alpha: 0.35);
  }

  @override
  Widget build(BuildContext context) {
    final numberColor = numberColorFor(unitIndex, lessonIndex);

    return SizedBox(
      width: double.infinity,
      height: height,
      child: Stack(
        fit: StackFit.expand,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: gradientFor(unitIndex, lessonIndex),
            ),
          ),
          Positioned(
            top: 8,
            right: 16,
            child: Text(
              '${lessonIndex + 1}',
              style: TextStyle(
                fontSize: 44,
                fontWeight: FontWeight.w800,
                height: 1,
                color: numberColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Lesson flow header banner — gradient, number, lesson tag, activity title, progress.
class LearnLessonExperienceBanner extends StatelessWidget {
  static const height = 132.0;
  static const radius = 10.0;
  static const horizontalInset = 12.0;

  final LearnLessonSlot slot;
  final int unitIndex;
  final int lessonIndex;
  final String lessonTitle;
  final String activityName;
  final double progress;
  final String activityProgressLabel;

  const LearnLessonExperienceBanner({
    super.key,
    required this.slot,
    required this.unitIndex,
    required this.lessonIndex,
    required this.lessonTitle,
    required this.activityName,
    required this.progress,
    required this.activityProgressLabel,
  });

  @override
  Widget build(BuildContext context) {
    const textColor = Colors.white;
    final trackColor =
        LearnLessonThumbnail.progressTrackColorFor(unitIndex, lessonIndex);

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: SizedBox(
        width: double.infinity,
        height: height,
        child: Stack(
          fit: StackFit.expand,
          children: [
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LearnLessonThumbnail.gradientFor(
                  unitIndex,
                  lessonIndex,
                ),
              ),
            ),
            Positioned(
              top: 6,
              right: 14,
              child: Text(
                '${lessonIndex + 1}',
                style: const TextStyle(
                  fontSize: 44,
                  fontWeight: FontWeight.w800,
                  height: 1,
                  color: textColor,
                ),
              ),
            ),
            Positioned(
              left: 14,
              right: 14,
              bottom: 14,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Wrap(
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text(
                        '${learnLessonLabel(lessonIndex)} — ',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5,
                          color: textColor,
                        ),
                      ),
                      TranslatedText(
                        lessonTitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          height: 1.2,
                          color: textColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  TranslatedText(
                    activityName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      height: 1.15,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: progress.clamp(0.0, 1.0),
                      minHeight: 3,
                      backgroundColor: trackColor,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    activityProgressLabel,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: textColor,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
