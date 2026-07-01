import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/models/learn_v2_catalog.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';

class LearnLessonSlot {
  final String catalogId;
  final String plainTitleKey;
  final LearnV2Lesson? v2Lesson;

  const LearnLessonSlot({
    required this.catalogId,
    required this.plainTitleKey,
    this.v2Lesson,
  });

  String get progressKey => catalogId;

  bool get hasContent => v2Lesson != null && v2Lesson!.activities.isNotEmpty;

  int get activityCount => v2Lesson?.activities.length ?? 0;
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

  int get totalLessons => lessons.length;

  int completedLessons(LearnProgressService progress) {
    var count = 0;
    for (final lesson in lessons) {
      if (progress.isLessonComplete(lesson.progressKey)) count++;
    }
    return count;
  }
}

class LearnCourseViewModel {
  final String id;
  final int courseNumber;
  final String title;
  final String plainTitleKey;
  final String? coverImageUrl;
  final List<LearnUnitViewModel> units;

  const LearnCourseViewModel({
    required this.id,
    required this.courseNumber,
    required this.title,
    required this.plainTitleKey,
    this.coverImageUrl,
    required this.units,
  });

  int get totalLessons => units.fold(0, (sum, u) => sum + u.lessons.length);

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
  final int index;

  const LearnStageInfo({required this.name, required this.index});
}

enum LearnUnitStatus { locked, inProgress, completed }

class LearnCatalog {
  static const stages = [
    LearnStageInfo(name: 'Curious', index: 0),
    LearnStageInfo(name: 'Aware', index: 1),
    LearnStageInfo(name: 'Observer', index: 2),
    LearnStageInfo(name: 'Champion', index: 3),
    LearnStageInfo(name: 'Defender', index: 4),
  ];

  static List<LearnCourseViewModel> buildFromV2Catalog(
      List<LearnV2Course> v2Courses) {
    return v2Courses.map((course) {
      final coverImage = course.coverImageUrl ?? _deriveCoverImage(course);
      return LearnCourseViewModel(
        id: course.id,
        courseNumber: course.courseNumber,
        title: course.title,
        plainTitleKey: course.plainTitleKey,
        coverImageUrl: coverImage,
        units: course.units.map((unit) {
          return LearnUnitViewModel(
            id: unit.id,
            title: unit.title,
            plainTitleKey: unit.title,
            lessons: unit.lessons
                .map((lesson) => LearnLessonSlot(
                      catalogId: lesson.id,
                      plainTitleKey: lesson.title,
                      v2Lesson: lesson,
                    ))
                .toList(),
          );
        }).toList(),
      );
    }).toList();
  }

  static String? _deriveCoverImage(LearnV2Course course) {
    for (final unit in course.units) {
      for (final lesson in unit.lessons) {
        if (lesson.coverImageUrl != null) return lesson.coverImageUrl;
      }
    }
    return null;
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
    return priorUnit.completedLessons(progress) >= priorUnit.totalLessons;
  }

  static bool isLessonUnlocked(
    LearnUnitViewModel unit,
    int lessonIndex,
    LearnProgressService progress,
  ) {
    if (lessonIndex == 0) return true;
    final prior = unit.lessons[lessonIndex - 1];
    return progress.isLessonComplete(prior.progressKey);
  }

  static LearnUnitStatus unitStatus(
    LearnCourseViewModel course,
    LearnUnitViewModel unit,
    int unitIndex,
    LearnProgressService progress,
  ) {
    if (!isUnitUnlocked(course, unitIndex, progress)) {
      return LearnUnitStatus.locked;
    }
    if (unit.completedLessons(progress) >= unit.totalLessons) {
      return LearnUnitStatus.completed;
    }
    return LearnUnitStatus.inProgress;
  }

  static int defaultSelectedUnitIndex(
    LearnCourseViewModel course,
    LearnProgressService progress,
  ) {
    for (var i = 0; i < course.units.length; i++) {
      if (!isUnitUnlocked(course, i, progress)) continue;
      if (course.units[i].completedLessons(progress) <
          course.units[i].totalLessons) {
        return i;
      }
    }
    for (var i = 0; i < course.units.length; i++) {
      if (isUnitUnlocked(course, i, progress)) return i;
    }
    return 0;
  }

  static bool isLessonAccessible(
    LearnCourseViewModel course,
    LearnUnitViewModel unit,
    int unitIndex,
    int lessonIndex,
    LearnProgressService progress,
  ) {
    if (!isUnitUnlocked(course, unitIndex, progress)) return false;
    if (!isLessonUnlocked(unit, lessonIndex, progress)) return false;
    return true;
  }

  static LearnStageInfo currentStage(
    List<LearnCourseViewModel> courses,
    LearnProgressService progress,
  ) {
    final maxPts = progress.maxPoints(courses);
    final pts = progress.totalPoints(courses);
    if (maxPts > 0 && pts > 0) {
      final ratio = pts / maxPts;
      final idx = (ratio * stages.length).floor().clamp(0, stages.length - 1);
      return stages[idx];
    }

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
    int unitIndex,
    int lessonIndex,
    List<LearnCourseViewModel> allCourses,
  ) {
    if (lessonIndex + 1 < unit.lessons.length) {
      final next = unit.lessons[lessonIndex + 1];
      return LearnLessonContinuation(
        nextSlot: next,
        unitPlainTitle: unit.plainTitleKey,
        courseTitle: course.title,
        lessonNumberInUnit: lessonIndex + 2,
        lessonsInUnit: unit.lessons.length,
        learnCourseId: course.id,
        unitIndex: unitIndex,
        lessonIndex: lessonIndex + 1,
      );
    }
    if (unitIndex + 1 < course.units.length) {
      final nextUnit = course.units[unitIndex + 1];
      if (nextUnit.lessons.isNotEmpty) {
        return LearnLessonContinuation(
          nextSlot: nextUnit.lessons.first,
          unitPlainTitle: nextUnit.plainTitleKey,
          courseTitle: course.title,
          lessonNumberInUnit: 1,
          lessonsInUnit: nextUnit.lessons.length,
          learnCourseId: course.id,
          unitIndex: unitIndex + 1,
          lessonIndex: 0,
          isNextUnit: true,
        );
      }
    }
    return null;
  }
}
