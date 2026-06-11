import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:airqo/src/app/learn/models/learn_course_structure.dart';

/// Local persistence for Learn tab progress (SharedPreferences).
class LearnProgressService {
  LearnProgressService._();
  static final LearnProgressService instance = LearnProgressService._();

  static const _pilotSeedKey = 'learn_pilot_seeded_v3';
  static const _stepPrefix = 'learn_step_';
  static const _completePrefix = 'learn_complete_';
  static const _courseDemoKey = 'learn_course_demo_shown_';
  static const _starsPrefix = 'learn_stars_';
  static const _pointsPrefix = 'learn_points_';
  static const _quizScorePrefix = 'learn_quiz_score_';
  static const _freeTextPrefix = 'learn_free_text_';

  final ValueNotifier<int> revision = ValueNotifier(0);
  SharedPreferences? _prefs;

  Future<void> ensureInitialized() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  void _notify() => revision.value++;

  int furthestStep(String lessonKey) {
    return _prefs?.getInt('$_stepPrefix$lessonKey') ?? 0;
  }

  Future<void> recordLessonFurthestStep(String lessonKey, int step) async {
    await ensureInitialized();
    final current = furthestStep(lessonKey);
    if (step > current) {
      await _prefs!.setInt('$_stepPrefix$lessonKey', step);
      _notify();
    }
  }

  bool isLessonComplete(String lessonKey) {
    return _prefs?.getBool('$_completePrefix$lessonKey') ?? false;
  }

  Future<void> markLessonComplete(String lessonKey) async {
    await ensureInitialized();
    await _prefs!.setBool('$_completePrefix$lessonKey', true);
    _notify();
  }

  double lessonProgressRatio(String lessonKey, int totalSteps) {
    if (isLessonComplete(lessonKey)) return 1;
    if (totalSteps <= 0) return 0;
    return (furthestStep(lessonKey) / totalSteps).clamp(0.0, 1.0);
  }

  int lessonStars(String lessonKey) {
    return _prefs?.getInt('$_starsPrefix$lessonKey') ?? 0;
  }

  int lessonPoints(String lessonKey) {
    return _prefs?.getInt('$_pointsPrefix$lessonKey') ?? 0;
  }

  double lessonQuizScore(String lessonKey) {
    return _prefs?.getDouble('$_quizScorePrefix$lessonKey') ?? 0;
  }

  String? lessonFreeText(String lessonKey) {
    return _prefs?.getString('$_freeTextPrefix$lessonKey');
  }

  Future<void> saveLessonResult({
    required String lessonKey,
    required int stars,
    required int points,
    required double quizScoreRatio,
    String? freeText,
  }) async {
    await ensureInitialized();
    await _prefs!.setInt('$_starsPrefix$lessonKey', stars);
    await _prefs!.setInt('$_pointsPrefix$lessonKey', points);
    await _prefs!.setDouble('$_quizScorePrefix$lessonKey', quizScoreRatio);
    if (freeText != null && freeText.trim().isNotEmpty) {
      await _prefs!.setString('$_freeTextPrefix$lessonKey', freeText.trim());
    }
    _notify();
  }

  int totalPoints(List<LearnCourseViewModel> courses) {
    var total = 0;
    for (final course in courses) {
      for (final unit in course.units) {
        for (final lesson in unit.lessons) {
          total += lessonPoints(lesson.progressKey);
        }
      }
    }
    return total;
  }

  /// Max points if every lesson earned 3 stars (30 pts each).
  int maxPoints(List<LearnCourseViewModel> courses) {
    return catalogTotalLessons(courses) * 30;
  }

  static int catalogTotalLessons(List<LearnCourseViewModel> courses) {
    return courses.fold(0, (s, c) => s + c.totalLessons);
  }

  bool hasShownCourseDemo(String courseId) {
    return _prefs?.getBool('$_courseDemoKey$courseId') ?? false;
  }

  Future<void> markCourseDemoShown(String courseId) async {
    await ensureInitialized();
    await _prefs!.setBool('$_courseDemoKey$courseId', true);
  }

  /// Pre-seeds pilot progress: course 1 complete, course 2 in progress, 3–4 locked.
  /// In debug builds this re-applies on every launch so prototype states stay visible.
  Future<void> ensurePilotLearnDemosV3({
    required List<LearnCourseViewModel> courses,
  }) async {
    await ensureInitialized();
    if (courses.isEmpty) return;

    _syncLegacyApiProgressToCatalog(courses);

    final alreadySeeded = _prefs!.getBool(_pilotSeedKey) == true;
    if (!kDebugMode && alreadySeeded) return;

    if (kDebugMode) {
      await _clearLearnProgressKeys();
    } else if (alreadySeeded) {
      return;
    }

    Future<void> markComplete(String key) =>
        _prefs!.setBool('$_completePrefix$key', true);

    Future<void> markInProgress(String key, int step) =>
        _prefs!.setInt('$_stepPrefix$key', step);

    Future<void> seedResult(String key, {int stars = 3}) async {
      await markComplete(key);
      await _prefs!.setInt('$_starsPrefix$key', stars);
      await _prefs!.setInt('$_pointsPrefix$key', stars * 10);
      await _prefs!.setDouble('$_quizScorePrefix$key', stars / 3);
    }

    // Course 1 — fully completed.
    for (final unit in courses.first.units) {
      for (final lesson in unit.lessons) {
        await seedResult(lesson.progressKey);
      }
    }

    // Course 2 — in progress (two done, third partially started).
    if (courses.length > 1) {
      final lessons =
          courses[1].units.expand((unit) => unit.lessons).toList();
      for (var i = 0; i < lessons.length && i <= 2; i++) {
        final key = lessons[i].progressKey;
        if (i < 2) {
          await seedResult(key, stars: i == 0 ? 3 : 2);
        } else {
          await markInProgress(key, 2);
        }
      }
    }

    await _prefs!.setBool(_pilotSeedKey, true);
    _notify();
  }

  Future<void> _clearLearnProgressKeys() async {
    final keys = _prefs!.getKeys().where(
      (key) =>
          key.startsWith(_stepPrefix) ||
          key.startsWith(_completePrefix) ||
          key.startsWith(_courseDemoKey) ||
          key.startsWith(_starsPrefix) ||
          key.startsWith(_pointsPrefix) ||
          key.startsWith(_quizScorePrefix) ||
          key.startsWith(_freeTextPrefix) ||
          key == _pilotSeedKey ||
          key == 'learn_pilot_seeded_v2',
    );
    for (final key in keys) {
      await _prefs!.remove(key);
    }
  }

  /// Copies progress stored under legacy API ids onto stable catalog ids.
  void _syncLegacyApiProgressToCatalog(List<LearnCourseViewModel> courses) {
    for (final course in courses) {
      for (final unit in course.units) {
        for (final slot in unit.lessons) {
          final api = slot.apiLesson;
          if (api == null) continue;
          final catalogKey = slot.catalogId;
          final apiKey = api.id;
          if (catalogKey == apiKey) continue;

          if (isLessonComplete(apiKey) && !isLessonComplete(catalogKey)) {
            _prefs!.setBool('$_completePrefix$catalogKey', true);
          }
          final apiStep = furthestStep(apiKey);
          final catalogStep = furthestStep(catalogKey);
          if (apiStep > catalogStep) {
            _prefs!.setInt('$_stepPrefix$catalogKey', apiStep);
          }
        }
      }
    }
  }
}
