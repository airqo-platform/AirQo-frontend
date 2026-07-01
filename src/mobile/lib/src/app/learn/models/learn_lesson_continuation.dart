import 'package:airqo/src/app/learn/models/learn_course_structure.dart';

/// Optional next-lesson CTA shown on the lesson finish pane.
class LearnLessonContinuation {
  final LearnLessonSlot nextSlot;
  final String unitPlainTitle;
  final String courseTitle;
  final int lessonNumberInUnit;
  final int lessonsInUnit;
  final String learnCourseId;
  final int unitIndex;
  final int lessonIndex;
  final bool isNextUnit;

  const LearnLessonContinuation({
    required this.nextSlot,
    required this.unitPlainTitle,
    required this.courseTitle,
    required this.lessonNumberInUnit,
    required this.lessonsInUnit,
    required this.learnCourseId,
    required this.unitIndex,
    required this.lessonIndex,
    this.isNextUnit = false,
  });

  String get nextProgressKey => nextSlot.progressKey;
}
