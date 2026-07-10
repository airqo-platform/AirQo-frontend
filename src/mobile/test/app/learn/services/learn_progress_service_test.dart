import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late LearnProgressService progress;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    progress = LearnProgressService.withPrefs(
      await SharedPreferences.getInstance(),
    );
  });

  group('saveLessonResult', () {
    test('keeps the best result across replays', () async {
      await progress.saveLessonResult(
        lessonKey: 'l1',
        stars: 3,
        points: 30,
        quizScoreRatio: 1.0,
      );
      await progress.saveLessonResult(
        lessonKey: 'l1',
        stars: 1,
        points: 10,
        quizScoreRatio: 0.3,
        freeText: 'newer thought',
      );

      expect(progress.lessonStars('l1'), 3);
      expect(progress.lessonPoints('l1'), 30);
      expect(progress.lessonQuizScore('l1'), 1.0);
      // Free text is not scored — the latest submission always wins.
      expect(progress.lessonFreeText('l1'), 'newer thought');
    });

    test('a better replay overwrites the stored result', () async {
      await progress.saveLessonResult(
        lessonKey: 'l1',
        stars: 1,
        points: 10,
        quizScoreRatio: 0.3,
      );
      await progress.saveLessonResult(
        lessonKey: 'l1',
        stars: 3,
        points: 30,
        quizScoreRatio: 1.0,
      );

      expect(progress.lessonStars('l1'), 3);
      expect(progress.lessonPoints('l1'), 30);
      expect(progress.lessonQuizScore('l1'), 1.0);
    });
  });

  group('mergeServerLesson', () {
    test('adopts the server result when it is better, including the ratio',
        () async {
      await progress.saveLessonResult(
        lessonKey: 'l1',
        stars: 1,
        points: 10,
        quizScoreRatio: 0.3,
      );

      final changed = await progress.mergeServerLesson(
        lessonKey: 'l1',
        completed: true,
        furthestStep: 4,
        stars: 3,
        points: 30,
        quizScoreRatio: 1.0,
        freeTextResponse: 'from server',
      );

      expect(changed, isTrue);
      expect(progress.isLessonComplete('l1'), isTrue);
      expect(progress.furthestStep('l1'), 4);
      expect(progress.lessonStars('l1'), 3);
      expect(progress.lessonPoints('l1'), 30);
      expect(progress.lessonQuizScore('l1'), 1.0);
      expect(progress.lessonFreeText('l1'), 'from server');
    });

    test('never downgrades a better local result', () async {
      await progress.saveLessonResult(
        lessonKey: 'l1',
        stars: 3,
        points: 30,
        quizScoreRatio: 1.0,
        freeText: 'local answer',
      );

      await progress.mergeServerLesson(
        lessonKey: 'l1',
        completed: true,
        stars: 1,
        points: 10,
        quizScoreRatio: 0.3,
        freeTextResponse: 'stale server answer',
      );

      expect(progress.lessonStars('l1'), 3);
      expect(progress.lessonPoints('l1'), 30);
      expect(progress.lessonQuizScore('l1'), 1.0);
      // A locally present free text is never clobbered by the server copy.
      expect(progress.lessonFreeText('l1'), 'local answer');
    });
  });
}
