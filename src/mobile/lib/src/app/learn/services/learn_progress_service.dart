import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Local persistence for Learn tab progress (SharedPreferences).
class LearnProgressService {
  LearnProgressService._();
  static final LearnProgressService instance = LearnProgressService._();

  static const _pilotSeedKey = 'learn_pilot_seeded_v2';
  static const _stepPrefix = 'learn_step_';
  static const _completePrefix = 'learn_complete_';
  static const _courseDemoKey = 'learn_course_demo_shown_';

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

  bool hasShownCourseDemo(String courseId) {
    return _prefs?.getBool('$_courseDemoKey$courseId') ?? false;
  }

  Future<void> markCourseDemoShown(String courseId) async {
    await ensureInitialized();
    await _prefs!.setBool('$_courseDemoKey$courseId', true);
  }

  /// Pre-seeds pilot progress so QA sees in-progress / resume states.
  Future<void> ensurePilotLearnDemosV2({
    required List<String> lessonKeys,
  }) async {
    await ensureInitialized();
    if (_prefs!.getBool(_pilotSeedKey) == true) return;

    for (var i = 0; i < lessonKeys.length; i++) {
      final key = lessonKeys[i];
      if (i == 0) {
        await _prefs!.setBool('$_completePrefix$key', true);
      } else if (i == 1) {
        await _prefs!.setInt('$_stepPrefix$key', 2);
      }
    }
    await _prefs!.setBool(_pilotSeedKey, true);
    _notify();
  }
}
