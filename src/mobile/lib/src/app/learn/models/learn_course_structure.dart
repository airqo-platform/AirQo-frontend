import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/services/learn_lesson_experience_service.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';

class LearnLessonSlot {
  final String catalogId;
  final String plainTitleKey;
  final KyaLesson? apiLesson;

  const LearnLessonSlot({
    required this.catalogId,
    required this.plainTitleKey,
    this.apiLesson,
  });

  String get progressKey => catalogId;

  bool get hasContent => apiLesson != null && apiLesson!.tasks.isNotEmpty;

  /// Scripted demo flow activity count.
  int get activityCount => LearnLessonExperienceService.demoActivityCount;
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
  final List<LearnUnitViewModel> units;

  const LearnCourseViewModel({
    required this.id,
    required this.courseNumber,
    required this.title,
    required this.plainTitleKey,
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
  final int index;

  const LearnStageInfo({required this.name, required this.index});
}

enum LearnUnitStatus { locked, inProgress, completed }

/// Client-side catalog: maps flat [KyaLesson] API data into Course → Unit → Lesson.
class LearnCatalog {
  static const stages = [
    LearnStageInfo(name: 'Curious', index: 0),
    LearnStageInfo(name: 'Aware', index: 1),
    LearnStageInfo(name: 'Observer', index: 2),
    LearnStageInfo(name: 'Champion', index: 3),
    LearnStageInfo(name: 'Defender', index: 4),
  ];

  static List<LearnCourseViewModel> buildFromLessons(List<KyaLesson> apiLessons) {
    var apiIndex = 0;

    LearnLessonSlot slot(String catalogId, String title) {
      KyaLesson? api;
      if (apiIndex < apiLessons.length) {
        api = apiLessons[apiIndex++];
      }
      return LearnLessonSlot(
        catalogId: catalogId,
        plainTitleKey: title,
        apiLesson: api,
      );
    }

    List<LearnUnitViewModel> unitsForCourse(
      String courseId,
      List<({String title, String plain, List<String> lessons})> defs,
    ) {
      return List.generate(defs.length, (u) {
        final def = defs[u];
        return LearnUnitViewModel(
          id: '${courseId}_u${u + 1}',
          title: def.title,
          plainTitleKey: def.plain,
          lessons: List.generate(def.lessons.length, (l) {
            return slot('${courseId}_u${u + 1}_l$l', def.lessons[l]);
          }),
        );
      });
    }

    const course1Units = [
      (
        title: 'Air basics',
        plain: 'Air basics',
        lessons: ['What is air quality', 'Why air matters', 'About AirQo'],
      ),
      (
        title: 'Sources',
        plain: 'Pollution sources',
        lessons: ['Cooking smoke', 'Road pollution', 'Open burning'],
      ),
      (
        title: 'Health',
        plain: 'Health and air',
        lessons: ['Eyes and lungs', 'Children', 'Stay safe'],
      ),
      (
        title: 'AQI scale',
        plain: 'Air numbers',
        lessons: ['Good and bad days', 'Read the numbers', 'Color codes'],
      ),
      (
        title: 'Action',
        plain: 'Take action',
        lessons: ['At home', 'In community', 'Share knowledge'],
      ),
    ];

    const course2Units = [
      (
        title: 'AQI basics',
        plain: 'Air numbers',
        lessons: ['AQI basics', 'Color codes', 'Daily patterns'],
      ),
      (
        title: 'Forecasts',
        plain: 'Air forecasts',
        lessons: ['Read forecasts', 'Morning and evening', 'Weekend trends'],
      ),
      (
        title: 'Sensors',
        plain: 'Air sensors',
        lessons: ['Low-cost sensors', 'Calibration', 'Sensor network'],
      ),
      (
        title: 'Maps',
        plain: 'Air maps',
        lessons: ['Read the map', 'Nearest site', 'Compare places'],
      ),
      (
        title: 'Alerts',
        plain: 'Air alerts',
        lessons: ['Alert levels', 'Notifications', 'Stay safe'],
      ),
    ];

    const course3Units = [
      (
        title: 'At home',
        plain: 'At home',
        lessons: ['Ventilation', 'Safe cooking', 'Indoor air'],
      ),
      (
        title: 'Travel',
        plain: 'On the move',
        lessons: ['Walking routes', 'Public transport', 'Masks'],
      ),
      (
        title: 'Community',
        plain: 'Community',
        lessons: ['Talk to neighbors', 'Schools', 'Local leaders'],
      ),
      (
        title: 'Advocacy',
        plain: 'Advocacy',
        lessons: ['Share data', 'Report problems', 'Campaigns'],
      ),
      (
        title: 'Next steps',
        plain: 'Next steps',
        lessons: ['Review progress', 'Teach a friend', 'Stay informed'],
      ),
    ];

    const course4Units = [
      (
        title: 'Leadership',
        plain: 'Leadership',
        lessons: ['Lead by example', 'Host a talk', 'Build a team'],
      ),
      (
        title: 'Data',
        plain: 'Air data',
        lessons: ['Local trends', 'Hotspots', 'Tell the story'],
      ),
      (
        title: 'Partners',
        plain: 'Partners',
        lessons: ['Schools and NGOs', 'Health workers', 'Government'],
      ),
      (
        title: 'Momentum',
        plain: 'Keep going',
        lessons: ['Monthly check-ins', 'Celebrate wins', 'Plan ahead'],
      ),
      (
        title: 'Champion',
        plain: 'Air champion',
        lessons: ['Mentor someone', 'Run a campaign', 'Become a champion'],
      ),
    ];

    return [
      LearnCourseViewModel(
        id: 'syn_course_1',
        courseNumber: 1,
        title: 'Know your air',
        plainTitleKey: 'Know your air',
        units: unitsForCourse('syn_course_1', course1Units),
      ),
      LearnCourseViewModel(
        id: 'syn_course_2',
        courseNumber: 2,
        title: 'Read the air',
        plainTitleKey: 'Read the air',
        units: unitsForCourse('syn_course_2', course2Units),
      ),
      LearnCourseViewModel(
        id: 'syn_course_3',
        courseNumber: 3,
        title: 'Take action',
        plainTitleKey: 'Take action',
        units: unitsForCourse('syn_course_3', course3Units),
      ),
      LearnCourseViewModel(
        id: 'syn_course_4',
        courseNumber: 4,
        title: 'Air champion',
        plainTitleKey: 'Air champion',
        units: unitsForCourse('syn_course_4', course4Units),
      ),
    ];
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

  /// Picks one of the most distinct KYA lesson images for each course card.
  static String? courseCoverImage(
    LearnCourseViewModel course,
    List<KyaLesson> apiLessons,
  ) {
    if (apiLessons.isEmpty) return null;

    final uniqueImages = <String>[];
    for (final lesson in apiLessons) {
      if (lesson.image.isNotEmpty && !uniqueImages.contains(lesson.image)) {
        uniqueImages.add(lesson.image);
      }
      for (final task in lesson.tasks) {
        if (task.image.isNotEmpty && !uniqueImages.contains(task.image)) {
          uniqueImages.add(task.image);
        }
      }
    }

    if (uniqueImages.isEmpty) return null;
    if (uniqueImages.length == 1) return uniqueImages.first;

    final courseIdx = (course.courseNumber - 1).clamp(0, 3);
    if (uniqueImages.length >= 4) {
      final step = (uniqueImages.length - 1) / 3;
      return uniqueImages[(courseIdx * step).round()];
    }
    return uniqueImages[courseIdx % uniqueImages.length];
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
