import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_bottom_sheets.dart';
import 'package:airqo/src/app/learn/widgets/learn_lesson_activities.dart';
import 'package:airqo/src/app/learn/widgets/learn_lesson_confetti.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/app/surveys/widgets/survey_progress_indicator.dart';
import 'package:flutter/material.dart';

class LessonPage extends StatefulWidget {
  final KyaLesson lesson;
  final bool presentedAsModalSheet;
  final String? unitPlainTitle;
  final String? courseTitle;
  final int lessonNumberInUnit;
  final int lessonsInUnit;
  final String? learnCourseId;
  final LearnLessonContinuation? continuation;

  const LessonPage(
    this.lesson, {
    super.key,
    this.presentedAsModalSheet = false,
    this.unitPlainTitle,
    this.courseTitle,
    this.lessonNumberInUnit = 1,
    this.lessonsInUnit = 1,
    this.learnCourseId,
    this.continuation,
  });

  @override
  State<LessonPage> createState() => _LessonPageState();
}

class _LessonPageState extends State<LessonPage> {
  late int _stepIndex;
  bool _finished = false;
  final _progress = LearnProgressService.instance;

  @override
  void initState() {
    super.initState();
    final saved = _progress.furthestStep(widget.lesson.id);
    _stepIndex = saved.clamp(0, widget.lesson.tasks.length - 1);
    if (_progress.isLessonComplete(widget.lesson.id)) {
      _finished = true;
    }
  }

  Task get _currentTask => widget.lesson.tasks[_stepIndex];

  Future<void> _advance() async {
    await _progress.recordLessonFurthestStep(widget.lesson.id, _stepIndex + 1);
    if (_stepIndex >= widget.lesson.tasks.length - 1) {
      await _progress.markLessonComplete(widget.lesson.id);
      setState(() => _finished = true);
    } else {
      setState(() => _stepIndex++);
    }
  }

  void _openNextLesson() {
    final next = widget.continuation;
    if (next == null) {
      Navigator.of(context).pop();
      return;
    }
    Navigator.of(context).pop();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!context.mounted) return;
      LearnBottomSheets.showLesson(
        context,
        lesson: next.nextLesson,
        unitPlainTitle: next.unitPlainTitle,
        courseTitle: next.courseTitle,
        lessonNumberInUnit: next.lessonNumberInUnit,
        lessonsInUnit: next.lessonsInUnit,
        learnCourseId: next.learnCourseId,
      );
    });
  }

  Widget _buildBody() {
    if (_finished) {
      return Stack(
        children: [
          _LessonFinishPane(
            onDone: () => Navigator.of(context).pop(),
            onNext: widget.continuation != null ? _openNextLesson : null,
          ),
          const LearnLessonConfetti(),
        ],
      );
    }

    final activity = _stepIndex.isEven
        ? LearnImageActivityCard(
            title: _currentTask.title,
            body: _currentTask.content,
            imageUrl: _currentTask.image,
            onContinue: _advance,
          )
        : LearnNotesActivityCard(
            title: _currentTask.title,
            body: _currentTask.content,
            onContinue: _advance,
          );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.presentedAsModalSheet) LearnDesignTokens.dragHandle(context),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: Row(
            children: [
              Expanded(child: _buildHeader()),
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
        ),
        SurveyProgressIndicator(
          currentQuestion: _stepIndex + 1,
          totalQuestions: widget.lesson.tasks.length,
          showQuestionNumbers: false,
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
        ),
        Expanded(child: activity),
      ],
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          learnLessonLabel(widget.lessonNumberInUnit - 1),
          style: LearnDesignTokens.lessonLabel(context),
        ),
        TranslatedText(
          learnDisplayTitle(widget.lesson.title),
          style: LearnDesignTokens.lessonTitle(context),
        ),
        const SizedBox(height: 4),
        TranslatedText(
          'Activity ${_stepIndex + 1} of ${widget.lesson.tasks.length}: ${_currentTask.title}',
          style: LearnDesignTokens.activitySubtitle(context),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    // Nested Scaffold breaks Expanded layout inside modal bottom sheets.
    final body = _buildBody();
    if (widget.presentedAsModalSheet) {
      return SizedBox.expand(child: body);
    }
    return Scaffold(
      appBar: AppBar(
        title: const TranslatedText('Lesson'),
        centerTitle: true,
      ),
      body: body,
    );
  }
}

class _LessonFinishPane extends StatelessWidget {
  final VoidCallback onDone;
  final VoidCallback? onNext;

  const _LessonFinishPane({
    required this.onDone,
    this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('🎉', style: TextStyle(fontSize: 48)),
            const SizedBox(height: 16),
            TranslatedText(
              'Great Job!',
              style: LearnDesignTokens.lessonTitle(context),
            ),
            const SizedBox(height: 8),
            TranslatedText(
              'You finished this lesson. Keep going to learn more about your air.',
              textAlign: TextAlign.center,
              style: LearnDesignTokens.activitySubtitle(context),
            ),
            const SizedBox(height: 24),
            if (onNext != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: ElevatedButton(
                  onPressed: onNext,
                  style: learnExposurePrimaryButtonStyle(),
                  child: const TranslatedText('Next lesson'),
                ),
              ),
            OutlinedButton(
              onPressed: onDone,
              style: learnExposureSecondaryButtonStyle(context),
              child: const TranslatedText('Done'),
            ),
          ],
        ),
      ),
    );
  }
}
