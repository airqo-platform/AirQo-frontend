import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/services/learn_quiz_scoring_service.dart';
import 'package:airqo/src/app/learn/services/learn_sync_service.dart';
import 'package:loggy/loggy.dart';

/// Orchestrates finishing a lesson: scoring, local persistence, session
/// cleanup, and the server progress report. Extracted from the lesson
/// experience widget so the UI layer holds no business logic and the flow
/// can be tested with fakes.
class LearnLessonCompletionService with UiLoggy {
  LearnLessonCompletionService({
    LearnProgressService? progress,
    LearnSyncService? sync,
  })  : _progress = progress ?? LearnProgressService.instance,
        _sync = sync ?? LearnSyncService.instance;

  final LearnProgressService _progress;
  final LearnSyncService _sync;

  /// Scores the lesson, saves the best-result locally, clears the in-lesson
  /// session state, and reports completion to the server (fire-and-forget —
  /// failures are buffered by the sync service for later flush).
  Future<LearnLessonResult> completeLesson({
    required String lessonKey,
    required List<QuizAttemptData> quizAttempts,
    required int furthestActivityIndex,
    String? combinedFreeText,
  }) async {
    // Free-text responses are saved locally and excluded from scoring.
    final gradedResults = quizAttempts
        .where((a) => a.format != LearnQuizFormat.freeText.apiKey)
        .map((a) => a.isCorrect)
        .toList();
    final result = LearnQuizScoringService.computeLessonResult(
      gradedQuizResults: gradedResults,
      freeTextResponse: combinedFreeText,
    );

    await _progress.markLessonComplete(lessonKey);
    await _progress.saveLessonResult(
      lessonKey: lessonKey,
      stars: result.stars,
      points: result.pointsEarned,
      quizScoreRatio: result.quizScoreRatio,
      freeText: result.freeTextResponse,
    );
    await _progress.clearLessonSession(lessonKey);

    final correctCount = gradedResults.where((r) => r).length;
    loggy.info('Lesson $lessonKey: completed — '
        '$correctCount/${gradedResults.length} quizzes correct, '
        '${result.stars} star(s), ${result.pointsEarned} points');

    _sync
        .reportCompletion(
          lessonKey,
          furthestActivityIndex: furthestActivityIndex,
          quizAttempts: List.unmodifiable(quizAttempts),
          freeTextResponse: result.freeTextResponse,
        )
        .catchError((_) {});
    return result;
  }
}
