import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_lesson_experience.dart';
import 'package:flutter/material.dart';

/// Hosts [LearnLessonExperience] inside a modal sheet or full-screen route.
class LessonPage extends StatelessWidget {
  final LearnLessonSlot slot;
  final LearnCourseViewModel course;
  final int unitIndex;
  final int lessonIndex;
  final String unitPlainTitle;
  final int lessonNumberInUnit;
  final int lessonsInUnit;
  final List<LearnCourseViewModel>? allCourses;
  final LearnLessonContinuation? continuation;
  final bool presentedAsModalSheet;

  const LessonPage({
    super.key,
    required this.slot,
    required this.course,
    required this.unitIndex,
    required this.lessonIndex,
    required this.unitPlainTitle,
    this.lessonNumberInUnit = 1,
    this.lessonsInUnit = 1,
    this.allCourses,
    this.continuation,
    this.presentedAsModalSheet = false,
  });

  @override
  Widget build(BuildContext context) {
    final experience = LearnLessonExperience(
      slot: slot,
      course: course,
      unitIndex: unitIndex,
      lessonIndex: lessonIndex,
      unitPlainTitle: unitPlainTitle,
      lessonNumberInUnit: lessonNumberInUnit,
      lessonsInUnit: lessonsInUnit,
      allCourses: allCourses,
      continuation: continuation,
      completionContext: context,
      onClose: () => Navigator.of(context).pop(),
    );

    if (presentedAsModalSheet) {
      return SizedBox.expand(child: experience);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lesson'),
        centerTitle: true,
      ),
      body: experience,
    );
  }
}
