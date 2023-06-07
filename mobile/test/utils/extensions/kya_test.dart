import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('KYA Lesson tests', () {
    test('Should return complete tasks', () {
      KyaLesson lesson = KyaLesson(
        title: "",
        imageUrl: "",
        id: "",
        status: KyaLessonStatus.inProgress,
        completionMessage: "",
        shareLink: "",
        tasks: KyaTaskStatus.values
            .map(
              (status) => KyaTask(
                id: status.name,
                status: status,
                title: '',
                imageUrl: '',
                body: '',
              ),
            )
            .toList(),
      );
      List<KyaTask> completeTasks = lesson.completeTasks();
      expect(completeTasks, isNotEmpty);
      expect(
        completeTasks.map((task) => task.status).toList(),
        everyElement(equals(KyaTaskStatus.complete)),
      );
    });
    test('Should return title used on the lesson page', () {
      KyaLesson lesson = KyaLesson(
        title: "",
        imageUrl: "",
        id: "",
        status: KyaLessonStatus.todo,
        completionMessage: "",
        shareLink: "",
        tasks: KyaTaskStatus.values
            .map(
              (status) => KyaTask(
                id: status.name,
                status: status,
                title: '',
                imageUrl: '',
                body: '',
              ),
            )
            .toList(),
      );
      expect(lesson.getKyaLessonPageTitle(), "Begin");

      lesson = lesson.copyWith(status: KyaLessonStatus.inProgress);
      expect(lesson.getKyaLessonPageTitle(), "Resume");

      lesson = lesson.copyWith(status: KyaLessonStatus.pendingTransfer);
      expect(lesson.getKyaLessonPageTitle(), "Restart");

      lesson = lesson.copyWith(status: KyaLessonStatus.complete);
      expect(lesson.getKyaLessonPageTitle(), "Restart");
    });
    test('Should return a message used on the lesson card', () {
      KyaLesson lesson = KyaLesson(
        title: "",
        imageUrl: "",
        id: "",
        status: KyaLessonStatus.todo,
        completionMessage: "",
        shareLink: "",
        tasks: KyaTaskStatus.values
            .map(
              (status) => KyaTask(
                id: status.name,
                status: status,
                title: '',
                imageUrl: '',
                body: '',
              ),
            )
            .toList(),
      );
      expect(lesson.getKyaLessonCardMessage(), "Start learning");

      lesson = lesson.copyWith(status: KyaLessonStatus.inProgress);
      expect(lesson.getKyaLessonCardMessage(), "Continue");

      lesson = lesson.copyWith(status: KyaLessonStatus.pendingTransfer);
      expect(lesson.getKyaLessonCardMessage(), "Complete! Move to For You");

      lesson = lesson.copyWith(status: KyaLessonStatus.complete);
      expect(lesson.getKyaLessonCardMessage(), "Complete! Move to For You");
    });
  });

  group('KYA Lesson list tests', () {
    List<KyaLesson> lessons = [];

    setUp(() {
      lessons = KyaLessonStatus.values
          .map(
            (status) => KyaLesson(
              title: "",
              imageUrl: "",
              id: status.name,
              tasks: const [],
              status: status,
              completionMessage: "",
              shareLink: "",
            ),
          )
          .toList();
    });

    test('Should return lessons in to do', () {
      List<KyaLesson> toDoLessons = lessons.filterLessonsInToDo();
      expect(toDoLessons, isNotEmpty);
      expect(
        toDoLessons.map((lesson) => lesson.status).toList(),
        everyElement(
          equals(KyaLessonStatus.todo),
        ),
      );
    });

    test('Should return lessons in progress', () {
      List<KyaLesson> lessonsInProgress = lessons.filterLessonsInProgress();
      expect(lessonsInProgress, isNotEmpty);
      expect(
        lessonsInProgress.map((lesson) => lesson.status).toList(),
        everyElement(
          equals(KyaLessonStatus.inProgress),
        ),
      );
    });

    test('Should return lessons pending transfer', () {
      List<KyaLesson> lessonsPendingTransfer =
          lessons.filterLessonsPendingTransfer();
      expect(lessonsPendingTransfer, isNotEmpty);
      expect(
        lessonsPendingTransfer.map((lesson) => lesson.status).toList(),
        everyElement(
          equals(KyaLessonStatus.pendingTransfer),
        ),
      );
    });

    test('Should return complete lessons', () {
      List<KyaLesson> completeLessons = lessons.filterCompleteLessons();
      expect(completeLessons, isNotEmpty);
      expect(
        completeLessons.map((lesson) => lesson.status).toList(),
        everyElement(
          equals(KyaLessonStatus.complete),
        ),
      );
    });

    test('Should return lessons used on home page cards', () {
      List<KyaLesson> homepageLessons = lessons.filterHomePageCardsLessons();
      expect(
        homepageLessons.map((lesson) => lesson.status).toList(),
        orderedEquals(
          [
            KyaLessonStatus.pendingTransfer,
            KyaLessonStatus.inProgress,
            KyaLessonStatus.todo,
          ],
        ),
      );
    });
  });
}
