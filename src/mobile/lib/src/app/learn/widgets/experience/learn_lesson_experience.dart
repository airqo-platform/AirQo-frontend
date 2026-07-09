import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/services/learn_lesson_experience_service.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/services/learn_quiz_scoring_service.dart';
import 'package:airqo/src/app/learn/services/learn_sync_service.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_article_activity.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_image_activity.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_activity.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_video_activity.dart';
import 'package:airqo/src/app/learn/widgets/learn_bottom_sheets.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnLessonExperience extends StatefulWidget {
  final LearnLessonSlot slot;
  final LearnCourseViewModel course;
  final int unitIndex;
  final int lessonIndex;
  final String unitPlainTitle;
  final int lessonNumberInUnit;
  final int lessonsInUnit;
  final List<LearnCourseViewModel>? allCourses;
  final LearnLessonContinuation? continuation;
  final VoidCallback onClose;
  final BuildContext completionContext;

  const LearnLessonExperience({
    super.key,
    required this.slot,
    required this.course,
    required this.unitIndex,
    required this.lessonIndex,
    required this.unitPlainTitle,
    required this.lessonNumberInUnit,
    required this.lessonsInUnit,
    required this.onClose,
    required this.completionContext,
    this.allCourses,
    this.continuation,
  });

  @override
  State<LearnLessonExperience> createState() => _LearnLessonExperienceState();
}

class _LearnLessonExperienceState extends State<LearnLessonExperience> {
  late final List<LearnLessonActivity> _script;
  late int _activityIndex;
  final _progress = LearnProgressService.instance;
  final List<QuizAttemptData> _quizAttempts = [];
  final Map<int, String> _freeTextResponses = {};
  LearnLessonResult? _result;

  @override
  void initState() {
    super.initState();
    _script = widget.slot.v2Lesson != null
        ? LearnLessonExperienceService.buildFromV2Lesson(
            lesson: widget.slot.v2Lesson!,
          )
        : const [];
    // Already-complete lessons replay from step 0 with a fresh session.
    // In-progress lessons resume from their furthest step with earlier
    // answers restored, so the final score reflects the whole lesson.
    final key = widget.slot.progressKey;
    if (_progress.isLessonComplete(key)) {
      _activityIndex = 0;
      _progress.clearLessonSession(key);
    } else {
      final saved = _progress.furthestStep(key);
      _activityIndex = _script.isEmpty ? 0 : saved.clamp(0, _script.length - 1);
      _quizAttempts.addAll(
        _progress.sessionQuizAttempts(key).map(QuizAttemptData.fromJson),
      );
      _freeTextResponses.addAll(_progress.sessionFreeTextResponses(key));
    }
  }

  String? get _combinedFreeText {
    if (_freeTextResponses.isEmpty) return null;
    final keys = _freeTextResponses.keys.toList()..sort();
    return keys.map((k) => _freeTextResponses[k]).join('\n\n');
  }

  bool get _isCourseFinal => LearnLessonExperienceService.isCourseFinalLesson(
        widget.course,
        widget.unitIndex,
        widget.lessonIndex,
      );

  LearnLessonActivity get _current => _script[_activityIndex];

  Future<void> _advanceActivity() async {
    await _progress.recordLessonFurthestStep(
      widget.slot.progressKey,
      _activityIndex + 1,
    );
    if (_activityIndex >= _script.length - 1) {
      await _completeLesson();
    } else {
      setState(() => _activityIndex++);
    }
  }

  Future<void> _completeLesson() async {
    final result = LearnQuizScoringService.computeLessonResult(
      gradedQuizResults: _quizAttempts.map((a) => a.isCorrect).toList(),
      freeTextResponse: _combinedFreeText,
    );
    await _progress.markLessonComplete(widget.slot.progressKey);
    await _progress.saveLessonResult(
      lessonKey: widget.slot.progressKey,
      stars: result.stars,
      points: result.pointsEarned,
      quizScoreRatio: result.quizScoreRatio,
      freeText: result.freeTextResponse,
    );
    await _progress.clearLessonSession(widget.slot.progressKey);
    LearnSyncService.instance.reportCompletion(
      widget.slot.progressKey,
      totalActivities: _script.length,
      quizAttempts: List.unmodifiable(_quizAttempts),
      freeTextResponse: _combinedFreeText,
    ).catchError((_) {});
    _result = result;
    _presentCompletionSheet();
  }

  void _presentCompletionSheet() {
    if (!mounted || _result == null) return;

    final callerContext = widget.completionContext;
    final result = _result!;
    final isCourseFinal = _isCourseFinal;
    widget.onClose();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!callerContext.mounted) return;
      if (isCourseFinal) {
        final stage = LearnCatalog.currentStage(
          widget.allCourses ?? [widget.course],
          _progress,
        );
        await LearnBottomSheets.showCourseComplete(
          callerContext,
          course: widget.course,
          stage: stage,
        );
        return;
      }

      await LearnBottomSheets.showLessonComplete(
        callerContext,
        result: result,
        lessonNumberInUnit: widget.lessonNumberInUnit,
        lessonsInUnit: widget.lessonsInUnit,
        unitPlainTitle: widget.unitPlainTitle,
        continuation: widget.continuation,
        allCourses: widget.allCourses,
      );
    });
  }

  void _recordQuizGrade(LearnQuizGrade grade) {
    if (_current.type != LearnActivityType.quiz) return;
    if (_current.quiz?.format == LearnQuizFormat.freeText) return;
    final attempt = QuizAttemptData(
      activityId: _current.index.toString(),
      format: _current.quiz!.format.apiKey,
      selectedIndex: grade.selectedIndex,
      isCorrect: grade.isCorrect,
    );
    final existing =
        _quizAttempts.indexWhere((a) => a.activityId == attempt.activityId);
    if (existing >= 0) {
      _quizAttempts[existing] = attempt;
    } else {
      _quizAttempts.add(attempt);
    }
    _progress.saveSessionQuizAttempts(
      widget.slot.progressKey,
      _quizAttempts.map((a) => a.toJson()).toList(),
    );
  }

  void _recordFreeText(String text) {
    _freeTextResponses[_current.index] = text;
    _progress.saveSessionFreeTextResponses(
      widget.slot.progressKey,
      Map.of(_freeTextResponses),
    );
  }

  Widget _buildActivityBody() {
    final activity = _current;
    final typeLabel = learnActivityTypeHeader(
      _activityIndex,
      LearnLessonExperienceService.activityTypeKey(activity),
    );
    switch (activity.type) {
      case LearnActivityType.article:
        return LearnArticleActivity(
          payload: activity.article!,
          activityTypeLabel: typeLabel,
          onContinue: _advanceActivity,
        );
      case LearnActivityType.video:
        return LearnVideoActivity(
          payload: activity.video!,
          activityTypeLabel: typeLabel,
          onContinue: _advanceActivity,
        );
      case LearnActivityType.image:
        return LearnImageActivity(
          payload: activity.image!,
          activityTypeLabel: typeLabel,
          onContinue: _advanceActivity,
        );
      case LearnActivityType.quiz:
        return LearnQuizActivity(
          quiz: activity.quiz!,
          activityTypeLabel: typeLabel,
          onGraded: _recordQuizGrade,
          onFreeText: _recordFreeText,
          onContinue: _advanceActivity,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_script.isEmpty) return _buildEmptyState(context);

    final lessonTitle = learnDisplayTitle(
      widget.slot.v2Lesson?.title ?? widget.slot.plainTitleKey,
    );

    return SizedBox.expand(
      child: LearnExperienceShell(
        slot: widget.slot,
        unitIndex: widget.unitIndex,
        lessonIndex: widget.lessonIndex,
        lessonTitle: lessonTitle,
        activityName: _current.title,
        currentStep: _activityIndex + 1,
        totalSteps: _script.length,
        activityProgressLabel: learnActivityProgressLabel(
          _activityIndex,
          _script.length,
        ),
        onClose: widget.onClose,
        showDragHandle: false,
        body: KeyedSubtree(
          key: ValueKey(_activityIndex),
          child: _buildActivityBody(),
        ),
        bottomBar: const SizedBox.shrink(),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return SizedBox.expand(
      child: Column(
        children: [
          Expanded(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.menu_book_outlined,
                      size: 48,
                      color: Theme.of(context).disabledColor,
                    ),
                    const SizedBox(height: 12),
                    const TranslatedText(
                      'This lesson is not available yet. Please check back later.',
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),
          LearnExperienceBottomBar(
            primaryLabel: 'Close',
            onPrimary: widget.onClose,
          ),
        ],
      ),
    );
  }
}
