import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/services/learn_lesson_experience_service.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/services/learn_quiz_scoring_service.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_article_activity.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_image_activity.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_activity.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_video_activity.dart';
import 'package:airqo/src/app/learn/widgets/learn_bottom_sheets.dart';
import 'package:flutter/material.dart';

class LearnLessonExperience extends StatefulWidget {
  final LearnLessonSlot slot;
  final KyaLesson? apiLesson;
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
    this.apiLesson,
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
  final List<bool> _gradedResults = [];
  String? _freeTextResponse;
  LearnLessonResult? _result;
  bool _presentingCompletion = false;

  @override
  void initState() {
    super.initState();
    final lessonTitle = widget.apiLesson?.title ?? widget.slot.plainTitleKey;
    _script = LearnLessonExperienceService.buildDemoScript(
      lessonTitle: lessonTitle,
      unitTitle: widget.unitPlainTitle,
      slot: widget.slot,
      apiLesson: widget.apiLesson,
    );
    final saved = _progress.furthestStep(widget.slot.progressKey);
    _activityIndex = saved.clamp(0, _script.length - 1);
    if (_progress.isLessonComplete(widget.slot.progressKey)) {
      _result = LearnLessonResult(
        stars: _progress.lessonStars(widget.slot.progressKey).clamp(1, 3),
        pointsEarned: _progress.lessonPoints(widget.slot.progressKey),
        quizScoreRatio: _progress.lessonQuizScore(widget.slot.progressKey),
        freeTextResponse: _progress.lessonFreeText(widget.slot.progressKey),
      );
      _presentingCompletion = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        _presentCompletionSheet();
      });
    }
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
      gradedQuizResults: _gradedResults,
      freeTextResponse: _freeTextResponse,
    );
    await _progress.markLessonComplete(widget.slot.progressKey);
    await _progress.saveLessonResult(
      lessonKey: widget.slot.progressKey,
      stars: result.stars,
      points: result.pointsEarned,
      quizScoreRatio: result.quizScoreRatio,
      freeText: result.freeTextResponse,
    );
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
    _gradedResults.add(grade.isCorrect);
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
          onFreeText: (text) => _freeTextResponse = text,
          onContinue: _advanceActivity,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_presentingCompletion) {
      return const SizedBox.shrink();
    }

    final lessonTitle =
        learnDisplayTitle(widget.apiLesson?.title ?? widget.slot.plainTitleKey);

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
        body: _buildActivityBody(),
        bottomBar: const SizedBox.shrink(),
      ),
    );
  }
}
