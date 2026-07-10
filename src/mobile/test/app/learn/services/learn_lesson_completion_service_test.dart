import 'package:airqo/src/app/learn/services/learn_lesson_completion_service.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/services/learn_sync_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

class _RecordingSyncService implements LearnSyncService {
  String? reportedLessonId;
  int? reportedFurthestIndex;
  List<QuizAttemptData>? reportedAttempts;
  String? reportedFreeText;

  @override
  Future<void> reportCompletion(
    String lessonId, {
    required int furthestActivityIndex,
    List<QuizAttemptData> quizAttempts = const [],
    String? freeTextResponse,
  }) async {
    reportedLessonId = lessonId;
    reportedFurthestIndex = furthestActivityIndex;
    reportedAttempts = quizAttempts;
    reportedFreeText = freeTextResponse;
  }

  @override
  Future<void> ensureGuestSession() async {}
  @override
  Future<void> linkProgressToAccount(String authToken) async {}
  @override
  Future<void> syncPendingProgress() async {}
  @override
  Future<LearnServerProgress?> fetchProgress({String? authToken}) async =>
      null;
  @override
  Future<void> hydrateLocalProgress({String? authToken}) async {}
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late LearnProgressService progress;
  late _RecordingSyncService sync;
  late LearnLessonCompletionService service;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    progress = LearnProgressService.withPrefs(
      await SharedPreferences.getInstance(),
    );
    sync = _RecordingSyncService();
    service = LearnLessonCompletionService(progress: progress, sync: sync);
  });

  const attempts = [
    QuizAttemptData(
        activityId: 'a1', format: 'single_choice', isCorrect: true),
    QuizAttemptData(
        activityId: 'a2', format: 'multi_choice', isCorrect: false),
    // Free text is excluded from grading even though marked correct.
    QuizAttemptData(activityId: 'a3', format: 'free_text', isCorrect: true),
  ];

  test('scores graded attempts only and persists the result', () async {
    await progress.saveSessionQuizAttempts('l1', [
      {'activity_id': 'a1'},
    ]);

    final result = await service.completeLesson(
      lessonKey: 'l1',
      quizAttempts: attempts,
      furthestActivityIndex: 5,
      combinedFreeText: 'my thought',
    );

    // 1 of 2 graded correct: 10 points, ratio 0.5, 2 stars.
    expect(result.pointsEarned, 10);
    expect(result.quizScoreRatio, 0.5);
    expect(result.stars, 2);
    expect(result.freeTextResponse, 'my thought');

    expect(progress.isLessonComplete('l1'), isTrue);
    expect(progress.lessonPoints('l1'), 10);
    expect(progress.lessonStars('l1'), 2);
    expect(progress.lessonQuizScore('l1'), 0.5);
    expect(progress.lessonFreeText('l1'), 'my thought');
    // In-lesson session state is cleared on completion.
    expect(progress.sessionQuizAttempts('l1'), isEmpty);
  });

  test('reports completion to the sync service', () async {
    await service.completeLesson(
      lessonKey: 'l1',
      quizAttempts: attempts,
      furthestActivityIndex: 5,
      combinedFreeText: 'my thought',
    );

    expect(sync.reportedLessonId, 'l1');
    expect(sync.reportedFurthestIndex, 5);
    // All attempts go to the server, including the free-text one — the
    // backend excludes free text from scoring itself.
    expect(sync.reportedAttempts, hasLength(3));
    expect(sync.reportedFreeText, 'my thought');
  });

  test('a lesson without graded quizzes earns one star and no points',
      () async {
    final result = await service.completeLesson(
      lessonKey: 'l2',
      quizAttempts: const [],
      furthestActivityIndex: 2,
    );

    expect(result.stars, 1);
    expect(result.pointsEarned, 0);
    expect(result.quizScoreRatio, 1.0);
  });
}
