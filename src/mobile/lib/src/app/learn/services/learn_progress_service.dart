import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/services/learn_lesson_experience_service.dart';

/// Local persistence for Learn tab progress (SharedPreferences).
class LearnProgressService {
  LearnProgressService._();
  static final LearnProgressService instance = LearnProgressService._();

  static const _pilotSeedKey = 'learn_pilot_seeded_v3';
  static const _pilotCleanupDoneKey = 'learn_pilot_cleanup_v1';
  static const _stepPrefix = 'learn_step_';
  static const _completePrefix = 'learn_complete_';
  static const _courseDemoKey = 'learn_course_demo_shown_';
  static const _starsPrefix = 'learn_stars_';
  static const _pointsPrefix = 'learn_points_';
  static const _quizScorePrefix = 'learn_quiz_score_';
  static const _freeTextPrefix = 'learn_free_text_';
  static const _sessionAttemptsPrefix = 'learn_session_attempts_';
  static const _sessionFreeTextPrefix = 'learn_session_freetext_';

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

  /// Saves a lesson result, keeping the best score across replays so a
  /// weaker replay never lowers previously earned stars/points.
  Future<void> saveLessonResult({
    required String lessonKey,
    required int stars,
    required int points,
    required double quizScoreRatio,
    String? freeText,
  }) async {
    await ensureInitialized();
    final hasPrevious = _prefs!.containsKey('$_pointsPrefix$lessonKey');
    final isBetter = points > lessonPoints(lessonKey) ||
        (points == lessonPoints(lessonKey) && stars > lessonStars(lessonKey));
    if (!hasPrevious || isBetter) {
      await _prefs!.setInt('$_starsPrefix$lessonKey', stars);
      await _prefs!.setInt('$_pointsPrefix$lessonKey', points);
      await _prefs!.setDouble('$_quizScorePrefix$lessonKey', quizScoreRatio);
    }
    if (freeText != null && freeText.trim().isNotEmpty) {
      await _prefs!.setString('$_freeTextPrefix$lessonKey', freeText.trim());
    }
    _notify();
  }

  /// Merges one lesson's server-side progress into local storage, keeping
  /// whichever side is further along. Returns true if anything changed.
  /// Callers batch-merging several lessons should call [notifyChanged] once
  /// afterwards.
  Future<bool> mergeServerLesson({
    required String lessonKey,
    required bool completed,
    int? furthestStep,
    required int stars,
    required int points,
  }) async {
    await ensureInitialized();
    var changed = false;
    if (completed && !isLessonComplete(lessonKey)) {
      await _prefs!.setBool('$_completePrefix$lessonKey', true);
      changed = true;
    }
    if (furthestStep != null && furthestStep > this.furthestStep(lessonKey)) {
      await _prefs!.setInt('$_stepPrefix$lessonKey', furthestStep);
      changed = true;
    }
    final localPoints = lessonPoints(lessonKey);
    final localStars = lessonStars(lessonKey);
    if (points > localPoints ||
        (points == localPoints && stars > localStars)) {
      await _prefs!.setInt('$_starsPrefix$lessonKey', stars);
      await _prefs!.setInt('$_pointsPrefix$lessonKey', points);
      changed = true;
    }
    return changed;
  }

  void notifyChanged() => _notify();

  // ---- In-lesson session state (quiz attempts, free-text drafts) ----------
  // Persisted per lesson so quitting mid-lesson and resuming keeps earlier
  // answers; cleared on completion or replay.

  List<Map<String, dynamic>> sessionQuizAttempts(String lessonKey) {
    final raw = _prefs?.getString('$_sessionAttemptsPrefix$lessonKey');
    if (raw == null) return const [];
    try {
      return (json.decode(raw) as List)
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    } catch (_) {
      return const [];
    }
  }

  Future<void> saveSessionQuizAttempts(
    String lessonKey,
    List<Map<String, dynamic>> attempts,
  ) async {
    await ensureInitialized();
    await _prefs!
        .setString('$_sessionAttemptsPrefix$lessonKey', json.encode(attempts));
  }

  Map<int, String> sessionFreeTextResponses(String lessonKey) {
    final raw = _prefs?.getString('$_sessionFreeTextPrefix$lessonKey');
    if (raw == null) return {};
    try {
      final decoded = json.decode(raw) as Map<String, dynamic>;
      return {
        for (final entry in decoded.entries)
          if (int.tryParse(entry.key) != null)
            int.parse(entry.key): entry.value.toString(),
      };
    } catch (_) {
      return {};
    }
  }

  Future<void> saveSessionFreeTextResponses(
    String lessonKey,
    Map<int, String> responses,
  ) async {
    await ensureInitialized();
    await _prefs!.setString(
      '$_sessionFreeTextPrefix$lessonKey',
      json.encode(responses.map((k, v) => MapEntry(k.toString(), v))),
    );
  }

  Future<void> clearLessonSession(String lessonKey) async {
    await ensureInitialized();
    await _prefs!.remove('$_sessionAttemptsPrefix$lessonKey');
    await _prefs!.remove('$_sessionFreeTextPrefix$lessonKey');
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

  /// Max points if every gradeable quiz were answered correctly (10 pts
  /// each) — mirrors how points are actually awarded in
  /// LearnQuizScoringService.computeLessonResult.
  int maxPoints(List<LearnCourseViewModel> courses) {
    var total = 0;
    for (final course in courses) {
      for (final unit in course.units) {
        for (final lesson in unit.lessons) {
          final v2 = lesson.v2Lesson;
          if (v2 == null) continue;
          total += LearnLessonExperienceService.gradedQuizCount(v2) * 10;
        }
      }
    }
    return total;
  }

  static int catalogTotalLessons(List<LearnCourseViewModel> courses) {
    return courses.fold(0, (s, c) => s + c.totalLessons);
  }

  /// One-time migration: removes any progress data that was seeded by the
  /// pilot demo seeder, so real users start with a clean slate.
  Future<void> clearPilotSeedIfNeeded() async {
    await ensureInitialized();
    if (_prefs!.getBool(_pilotCleanupDoneKey) == true) return;
    if (_prefs!.getBool(_pilotSeedKey) == true) {
      await _clearLearnProgressKeys();
    }
    await _prefs!.setBool(_pilotCleanupDoneKey, true);
    _notify();
  }

  bool hasShownCourseDemo(String courseId) {
    return _prefs?.getBool('$_courseDemoKey$courseId') ?? false;
  }

  Future<void> markCourseDemoShown(String courseId) async {
    await ensureInitialized();
    await _prefs!.setBool('$_courseDemoKey$courseId', true);
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
          key.startsWith(_sessionAttemptsPrefix) ||
          key.startsWith(_sessionFreeTextPrefix) ||
          key == _pilotSeedKey ||
          key == 'learn_pilot_seeded_v2',
    );
    for (final key in keys) {
      await _prefs!.remove(key);
    }
  }

}
