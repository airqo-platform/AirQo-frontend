import 'package:app/utils/extensions.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app/models/models.dart';

void main() {
  KyaLesson kyaLesson = const KyaLesson(
    title: 'Lesson Title',
    imageUrl: 'https://example.com/image.jpg',
    id: 'lesson_id',
    tasks: [
      KyaTask(
        id: 'task_id',
        title: 'Task Title',
        imageUrl: 'https://example.com/task_image.jpg',
        content: 'Task Content',
      ),
    ],
    activeTask: 1,
    status: KyaLessonStatus.todo,
    completionMessage: 'Lesson completed!',
  );
  group('KyaExt', () {
    setUpAll(() {});
    test('startButtonText returns "Begin" when activeTask is 1', () {
      final buttonText = kyaLesson.startButtonText();

      expect(buttonText, 'Begin');
    });

    test('startButtonText returns "Resume" when activeTask is not 1', () {
      kyaLesson = kyaLesson.copyWith(activeTask: 2);

      final buttonText = kyaLesson.startButtonText();

      expect(buttonText, 'Resume');
    });

    test('getKyaMessage returns "Start learning" for KyaLessonStatus.todo', () {
      final message = kyaLesson.getKyaMessage();

      expect(message, 'Start learning');
    });

    test(
        'getKyaMessage returns "Complete! Move to For You" for KyaLessonStatus.pendingCompletion',
        () {
      kyaLesson = kyaLesson.copyWith(status: KyaLessonStatus.pendingCompletion);

      final message = kyaLesson.getKyaMessage();

      expect(message, 'Complete! Move to For You');
    });

    test(
        'getKyaMessage returns "Continue" for KyaLessonStatus.complete and activeTask is not 1',
        () {
      kyaLesson = kyaLesson.copyWith(
        status: KyaLessonStatus.complete,
        activeTask: 2,
      );

      final message = kyaLesson.getKyaMessage();

      expect(message, 'Continue');
    });
  });

  group('kyaList Extension', () {
    List<KyaLesson> lessons = [];

    setUp(() => {
          lessons = List.generate(
            4,
            (index) => KyaLesson(
              activeTask: index == 0
                  ? 1
                  : index == 1
                      ? 5
                      : index == 2
                          ? 9
                          : 0,
              completionMessage: 'Lesson ${index + 1} Completed',
              id: (index + 1).toString(),
              imageUrl: '',
              status: index == 0
                  ? KyaLessonStatus.todo
                  : index == 1
                      ? KyaLessonStatus.inProgress
                      : index == 2
                          ? KyaLessonStatus.pendingCompletion
                          : KyaLessonStatus.complete,
              shareLink: '',
              title: '',
              tasks: const [],
            ),
          ),
        });

    test(
        'filterInCompleteLessons returns pendingCompletion lessons if available',
        () {
      final result = lessons.filterInCompleteLessons();

      expect(
          result.every(
              (lesson) => lesson.status == KyaLessonStatus.pendingCompletion),
          true);
    });

    test(
        'filterInCompleteLessons returns inProgress lessons if pendingCompletion lessons are empty',
        () {
      lessons.removeWhere(
          (lesson) => lesson.status == KyaLessonStatus.pendingCompletion);
      final result = lessons.filterInCompleteLessons();

      expect(
          result.every((lesson) => lesson.status == KyaLessonStatus.inProgress),
          true);
    });

    test(
        'filterInCompleteLessons returns todo lessons if both pendingCompletion and inProgress lessons are empty',
        () {
      lessons.removeWhere((lesson) =>
          lesson.status == KyaLessonStatus.pendingCompletion ||
          lesson.status == KyaLessonStatus.inProgress);
      final result = lessons.filterInCompleteLessons();

      expect(result.every((lesson) => lesson.status == KyaLessonStatus.todo),
          true);
    });
  });
}
