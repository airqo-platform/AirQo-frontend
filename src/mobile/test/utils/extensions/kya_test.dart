import 'package:app/models/models.dart';
import 'package:app/utils/extensions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

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
    hasCompleted: false,
  );
  group('KyaExt', () {
    testWidgets(
      'startButtonText returns "Begin" when activeTask is 1',
      (WidgetTester tester) async {
        final key = GlobalKey();

        await tester.pumpWidget(
          MaterialApp(
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('en'),
              Locale('fr'),
            ],
            home: Placeholder(key: key),
          ),
        );
        await tester.pumpAndSettle();

        BuildContext? buildContext = key.currentContext;
        expect(buildContext, isNotNull);

        if (buildContext == null) {
          return;
        }

        final buttonText = kyaLesson.startButtonText(buildContext);
        expect(buttonText, 'Begin');
      },
    );

    testWidgets(
      'startButtonText returns "Resume" when activeTask is not 1',
      (WidgetTester tester) async {
        final key = GlobalKey();

        await tester.pumpWidget(
          MaterialApp(
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('en'),
              Locale('fr'),
            ],
            home: Placeholder(key: key),
          ),
        );
        await tester.pumpAndSettle();

        BuildContext? buildContext = key.currentContext;
        expect(buildContext, isNotNull);

        if (buildContext == null) {
          return;
        }

        kyaLesson = kyaLesson.copyWith(activeTask: 2);

        final buttonText = kyaLesson.startButtonText(buildContext);

        expect(buttonText, 'Resume');
      },
    );

    testWidgets(
      'getKyaMessage returns "Start learning" for KyaLessonStatus.todo',
      (WidgetTester tester) async {
        final key = GlobalKey();

        await tester.pumpWidget(
          MaterialApp(
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('en'),
              Locale('fr'),
            ],
            home: Placeholder(key: key),
          ),
        );
        await tester.pumpAndSettle();

        BuildContext? buildContext = key.currentContext;
        expect(buildContext, isNotNull);

        if (buildContext == null) {
          return;
        }

        final message = kyaLesson.getKyaMessage(buildContext);

        expect(message, 'Start learning');
      },
    );

    testWidgets(
      'getKyaMessage returns "Complete! Move to For You" for KyaLessonStatus.pendingCompletion',
      (WidgetTester tester) async {
        final key = GlobalKey();

        await tester.pumpWidget(
          MaterialApp(
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('en'),
              Locale('fr'),
            ],
            home: Placeholder(key: key),
          ),
        );
        await tester.pumpAndSettle();

        BuildContext? buildContext = key.currentContext;
        expect(buildContext, isNotNull);

        if (buildContext == null) {
          return;
        }

        final message = kyaLesson.getKyaMessage(buildContext);

        expect(message, 'Complete! Move to For You');
      },
    );

    testWidgets(
      'getKyaMessage returns "Continue" for KyaLessonStatus.complete and activeTask is not 1',
      (WidgetTester tester) async {
        final key = GlobalKey();

        await tester.pumpWidget(
          MaterialApp(
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('en'),
              Locale('fr'),
            ],
            home: Placeholder(key: key),
          ),
        );
        await tester.pumpAndSettle();

        BuildContext? buildContext = key.currentContext;
        expect(buildContext, isNotNull);

        if (buildContext == null) {
          return;
        }

        kyaLesson = kyaLesson.copyWith(
          status: KyaLessonStatus.complete,
          activeTask: 2,
        );

        final message = kyaLesson.getKyaMessage(buildContext);

        expect(message, 'Continue');
      },
    );
  });

  group(
    'kyaList Extension',
    () {
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
                        : KyaLessonStatus.complete,
                shareLink: '',
                title: '',
                tasks: const [],
                hasCompleted: false,
              ),
            ),
          });

      test(
          'filterInCompleteLessons returns inProgress lessons if complete lessons are empty',
          () {
        lessons
            .removeWhere((lesson) => lesson.status == KyaLessonStatus.complete);
        final result = lessons.filterInCompleteLessons();

        expect(
            result
                .every((lesson) => lesson.status == KyaLessonStatus.inProgress),
            true);
      });

      test(
          'filterInCompleteLessons returns todo lessons if both  inProgress lessons are empty',
          () {
        lessons.removeWhere(
            (lesson) => lesson.status == KyaLessonStatus.inProgress);
        final result = lessons.filterInCompleteLessons();

        expect(result.every((lesson) => lesson.status == KyaLessonStatus.todo),
            true);
      });
    },
  );
}
