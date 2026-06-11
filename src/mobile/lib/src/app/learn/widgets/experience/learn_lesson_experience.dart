import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/services/learn_lesson_experience_service.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/services/learn_quiz_scoring_service.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_article_activity.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_course_certificate.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_image_activity.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_lesson_finish_pane.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_activity.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_video_activity.dart';
import 'package:airqo/src/app/learn/widgets/learn_bottom_sheets.dart';
import 'package:airqo/src/app/learn/widgets/learn_lesson_confetti.dart';
import 'package:flutter/material.dart';

enum _ExperiencePhase { activities, lessonComplete, courseComplete }

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
  _ExperiencePhase _phase = _ExperiencePhase.activities;
  LearnLessonResult? _result;

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
      _phase = _isCourseFinal ? _ExperiencePhase.courseComplete : _ExperiencePhase.lessonComplete;
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
    setState(() {
      _result = result;
      _phase = _isCourseFinal
          ? _ExperiencePhase.courseComplete
          : _ExperiencePhase.lessonComplete;
    });
  }

  void _recordQuizGrade(LearnQuizGrade grade) {
    if (_current.type != LearnActivityType.quiz) return;
    if (_current.quiz?.format == LearnQuizFormat.freeText) return;
    _gradedResults.add(grade.isCorrect);
  }

  void _openNextLesson() {
    final next = widget.continuation;
    if (next == null) {
      widget.onClose();
      return;
    }

    final courses = widget.allCourses;
    LearnLessonContinuation? chain;
    if (courses != null) {
      final course = courses.firstWhere((c) => c.id == next.learnCourseId);
      final unit = course.units[next.unitIndex];
      chain = LearnCatalog.continuationFor(
        course,
        unit,
        next.unitIndex,
        next.lessonIndex,
        courses,
      );
    }

    widget.onClose();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!context.mounted) return;
      LearnBottomSheets.showLessonExperience(
        context,
        slot: next.nextSlot,
        course: courses!.firstWhere((c) => c.id == next.learnCourseId),
        unitIndex: next.unitIndex,
        lessonIndex: next.lessonIndex,
        unitPlainTitle: next.unitPlainTitle,
        lessonNumberInUnit: next.lessonNumberInUnit,
        lessonsInUnit: next.lessonsInUnit,
        allCourses: courses,
        continuation: chain,
      );
    });
  }

  Widget _buildActivityBody() {
    final activity = _current;
    switch (activity.type) {
      case LearnActivityType.article:
        return LearnArticleActivity(
          payload: activity.article!,
          onContinue: _advanceActivity,
        );
      case LearnActivityType.video:
        return LearnVideoActivity(
          payload: activity.video!,
          onContinue: _advanceActivity,
        );
      case LearnActivityType.image:
        return LearnImageActivity(
          payload: activity.image!,
          onContinue: _advanceActivity,
        );
      case LearnActivityType.quiz:
        return LearnQuizActivity(
          quiz: activity.quiz!,
          onGraded: _recordQuizGrade,
          onFreeText: (text) => _freeTextResponse = text,
          onContinue: _advanceActivity,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_phase == _ExperiencePhase.courseComplete) {
      final stage = LearnCatalog.currentStage(
        widget.allCourses ?? [widget.course],
        _progress,
      );
      return LearnCourseCertificatePane(
        course: widget.course,
        stage: stage,
        onDone: widget.onClose,
      );
    }

    if (_phase == _ExperiencePhase.lessonComplete && _result != null) {
      return Stack(
        children: [
          LearnLessonFinishPane(
            result: _result!,
            lessonNumberInUnit: widget.lessonNumberInUnit,
            lessonsInUnit: widget.lessonsInUnit,
            unitPlainTitle: widget.unitPlainTitle,
            onDone: widget.onClose,
            onNext: widget.continuation != null ? _openNextLesson : null,
          ),
          const LearnLessonConfetti(),
        ],
      );
    }

    final lessonTitle =
        learnDisplayTitle(widget.apiLesson?.title ?? widget.slot.plainTitleKey);

    return LearnExperienceShell(
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
    );
  }
}
