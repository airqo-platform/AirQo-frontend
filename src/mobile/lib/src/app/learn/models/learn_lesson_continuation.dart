import 'package:airqo/src/app/learn/models/lesson_response_model.dart';

/// Optional next-lesson CTA shown on the lesson finish pane.
class LearnLessonContinuation {
  final KyaLesson nextLesson;
  final String nextProgressKey;
  final String unitPlainTitle;
  final String courseTitle;
  final int lessonNumberInUnit;
  final int lessonsInUnit;
  final String learnCourseId;

  const LearnLessonContinuation({
    required this.nextLesson,
    required this.nextProgressKey,
    required this.unitPlainTitle,
    required this.courseTitle,
    required this.lessonNumberInUnit,
    required this.lessonsInUnit,
    required this.learnCourseId,
  });
}
