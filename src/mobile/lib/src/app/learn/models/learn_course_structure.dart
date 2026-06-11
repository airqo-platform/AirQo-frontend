import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:flutter/material.dart';

class LearnLessonSlot {
  final String catalogId;
  final String plainTitleKey;
  final String emoji;
  final Color placeholderColor;
  final KyaLesson? apiLesson;

  const LearnLessonSlot({
    required this.catalogId,
    required this.plainTitleKey,
    required this.emoji,
    required this.placeholderColor,
    this.apiLesson,
  });

  String get progressKey => apiLesson?.id ?? catalogId;

  bool get hasContent => apiLesson != null && apiLesson!.tasks.isNotEmpty;
}

class LearnUnitViewModel {
  final String id;
  final String title;
  final String plainTitleKey;
  final List<LearnLessonSlot> lessons;

  const LearnUnitViewModel({
    required this.id,
    required this.title,
    required this.plainTitleKey,
    required this.lessons,
  });

  int get lessonCount => lessons.length;
}

class LearnCourseViewModel {
  final String id;
  final int courseNumber;
  final String title;
  final String plainTitleKey;
  final String emoji;
  final List<LearnUnitViewModel> units;

  const LearnCourseViewModel({
    required this.id,
    required this.courseNumber,
    required this.title,
    required this.plainTitleKey,
    required this.emoji,
    required this.units,
  });

  int get totalLessons =>
      units.fold(0, (sum, u) => sum + u.lessons.length);

  int completedLessons(LearnProgressService progress) {
    var count = 0;
    for (final unit in units) {
      for (final lesson in unit.lessons) {
        if (progress.isLessonComplete(lesson.progressKey)) count++;
      }
    }
    return count;
  }
}

class LearnStageInfo {
  final String name;
  final String emoji;
  final int index;

  const LearnStageInfo({
    required this.name,
    required this.emoji,
    required this.index,
  });
}

/// Client-side catalog: maps flat [KyaLesson] API data into Course → Unit → Lesson.
class LearnCatalog {
  static const stages = [
    LearnStageInfo(name: 'Curious', emoji: '🌱', index: 0),
    LearnStageInfo(name: 'Aware', emoji: '🌿', index: 1),
    LearnStageInfo(name: 'Observer', emoji: '👀', index: 2),
    LearnStageInfo(name: 'Champion', emoji: '🏆', index: 3),
    LearnStageInfo(name: 'Defender', emoji: '🛡️', index: 4),
  ];

  static List<LearnCourseViewModel> buildFromLessons(List<KyaLesson> apiLessons) {
    final bound = _bindApiLessons(apiLessons);
    return [
      LearnCourseViewModel(
        id: 'syn_course_1',
        courseNumber: 1,
        title: 'Know Your Air',
        plainTitleKey: 'Know Your Air',
        emoji: '🌍',
        units: [
          LearnUnitViewModel(
            id: 'syn_course_1_u1',
            title: 'Sources',
            plainTitleKey: 'Where pollution comes from',
            lessons: [
              _slot('syn_course_1_u1_l0', 'Your cooking fire', '🍳',
                  const Color(0xffC8D8F8), bound, 0),
              _slot('syn_course_1_u1_l1', 'Road outside your door', '🚗',
                  const Color(0xffFDE8C8), bound, 1),
              _slot('syn_course_1_u1_l2', 'Open burning', '🔥',
                  const Color(0xffF5D5D5), bound, 2),
              _slot('syn_course_1_u1_l3', 'Workshop dust', '🏭',
                  const Color(0xffE8EEF5), bound, 3),
            ],
          ),
          LearnUnitViewModel(
            id: 'syn_course_1_u2',
            title: 'Health effects',
            plainTitleKey: 'How dirty air affects your body',
            lessons: [
              _slot('syn_course_1_u2_l0', 'Eyes and lungs', '👁️',
                  const Color(0xffE8F0FF), bound, 4),
              _slot('syn_course_1_u2_l1', 'Children first', '👶',
                  const Color(0xffFFF0E8), bound, 5),
            ],
          ),
        ],
      ),
      LearnCourseViewModel(
        id: 'syn_course_2',
        courseNumber: 2,
        title: 'Reading the air',
        plainTitleKey: 'What the numbers mean',
        emoji: '📊',
        units: [
          LearnUnitViewModel(
            id: 'syn_course_2_u1',
            title: 'AQI scale',
            plainTitleKey: 'What the numbers mean',
            lessons: [
              _slot('syn_course_2_u1_l0', 'Good vs bad days', '☀️',
                  const Color(0xffE8F5E9), bound, 6),
            ],
          ),
        ],
      ),
      LearnCourseViewModel(
        id: 'syn_course_3',
        courseNumber: 3,
        title: 'Take action',
        plainTitleKey: 'Simple steps you can take',
        emoji: '✊',
        units: [
          LearnUnitViewModel(
            id: 'syn_course_3_u1',
            title: 'Take action',
            plainTitleKey: 'Simple steps you can take',
            lessons: [
              _slot('syn_course_3_u1_l0', 'Protect your home', '🏠',
                  const Color(0xffF3E8FF), bound, 7),
            ],
          ),
        ],
      ),
    ];
  }

  static LearnLessonSlot _slot(
    String catalogId,
    String plainTitleKey,
    String emoji,
    Color color,
    List<KyaLesson> bound,
    int apiIndex,
  ) {
    KyaLesson? api;
    if (apiIndex < bound.length) {
      api = bound[apiIndex];
    }
    return LearnLessonSlot(
      catalogId: catalogId,
      plainTitleKey: plainTitleKey,
      emoji: emoji,
      placeholderColor: color,
      apiLesson: api,
    );
  }

  static List<KyaLesson> _bindApiLessons(List<KyaLesson> apiLessons) {
    if (apiLessons.isEmpty) return const [];
    return List<KyaLesson>.from(apiLessons);
  }

  static bool isCourseUnlocked(
    List<LearnCourseViewModel> courses,
    int courseIndex,
    LearnProgressService progress,
  ) {
    if (courseIndex == 0) return true;
    final prior = courses[courseIndex - 1];
    return prior.completedLessons(progress) >= prior.totalLessons;
  }

  static bool isUnitUnlocked(
    LearnCourseViewModel course,
    int unitIndex,
    LearnProgressService progress,
  ) {
    if (unitIndex == 0) return true;
    final priorUnit = course.units[unitIndex - 1];
    for (final lesson in priorUnit.lessons) {
      if (!progress.isLessonComplete(lesson.progressKey)) return false;
    }
    return true;
  }

  static bool isLessonUnlocked(
    LearnUnitViewModel unit,
    int lessonIndex,
    LearnUnitViewModel unitModel,
    LearnProgressService progress,
  ) {
    if (lessonIndex == 0) return true;
    final prior = unit.lessons[lessonIndex - 1];
    return progress.isLessonComplete(prior.progressKey);
  }

  static LearnStageInfo currentStage(
    List<LearnCourseViewModel> courses,
    LearnProgressService progress,
  ) {
    final total = courses.fold(0, (s, c) => s + c.totalLessons);
    final done = courses.fold(0, (s, c) => s + c.completedLessons(progress));
    if (total == 0) return stages.first;
    final ratio = done / total;
    final idx = (ratio * stages.length).floor().clamp(0, stages.length - 1);
    return stages[idx];
  }

  static int catalogCompletedLessons(
    List<LearnCourseViewModel> courses,
    LearnProgressService progress,
  ) {
    return courses.fold(0, (s, c) => s + c.completedLessons(progress));
  }

  static int catalogTotalLessons(List<LearnCourseViewModel> courses) {
    return courses.fold(0, (s, c) => s + c.totalLessons);
  }

  static LearnLessonContinuation? continuationFor(
    LearnCourseViewModel course,
    LearnUnitViewModel unit,
    int lessonIndex,
    List<LearnCourseViewModel> allCourses,
  ) {
    if (lessonIndex + 1 < unit.lessons.length) {
      final next = unit.lessons[lessonIndex + 1];
      if (!next.hasContent) return null;
      return LearnLessonContinuation(
        nextLesson: next.apiLesson!,
        unitPlainTitle: unit.plainTitleKey,
        courseTitle: course.title,
        lessonNumberInUnit: lessonIndex + 2,
        lessonsInUnit: unit.lessons.length,
        learnCourseId: course.id,
      );
    }
    return null;
  }
}
