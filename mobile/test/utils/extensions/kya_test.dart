import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Kya Extension', () {
    List<KyaLesson> kyaLessons = [];

    setUp(() => {
          kyaLessons = List.generate(
            4,
            (index) => KyaLesson(
              completionMessage: 'Lesson ${index + 1} Completed',
              id: (index + 1).toString(),
              imageUrl: '',
              status: KyaLessonStatus.todo,
              tasks: const [],
              shareLink: '',
              title: '',
            ),
          ),
        });

    group('Filter Complete', () {
      test('returns empty list when all Kyas are not yet completed', () {
        kyaLessons = [kyaLessons[0], kyaLessons[1], kyaLessons[3]];

        final filteredKyas = kyaLessons.filterCompleteLessons();
        expect(filteredKyas.isEmpty, true);
      });
      test('Should return only completed Lessons', () {
        if (kyaLessons.length == 1 && kyaLessons.contains(kyaLessons[2])) {
          fail('Kyas already does not contain uncompleted lessons');
        }

        Set<KyaLesson> unCompletedKyasSet = {
          kyaLessons[1],
          kyaLessons[0],
          kyaLessons[3]
        };

        final completedKyas = kyaLessons.filterCompleteLessons();
        expect(completedKyas.length, 1);
        expect(completedKyas.contains(kyaLessons[2]), isTrue);
        expect(completedKyas.toSet().intersection(unCompletedKyasSet).isEmpty,
            isTrue);
      });
    });

    group('Filter ToDo', () {
      test('Should return only elements that are to do', () {
        if (kyaLessons.length == 1 && kyaLessons.contains(kyaLessons[3])) {
          fail('Kyas already does not contain ToDo lessons');
        }

        Set<KyaLesson> toDoKyasSet = {kyaLessons[3]};
        Set<KyaLesson> startedKyasSet =
            kyaLessons.toSet().difference(toDoKyasSet);

        final toDoKyas = kyaLessons.filterLessonsInToDo();
        expect(toDoKyas.length, 1);
        expect(toDoKyas.contains(kyaLessons[3]), isTrue);
        expect(toDoKyas.toSet().intersection(startedKyasSet).isEmpty, isTrue);
      });
    });

    group('Filter Pending Completion', () {
      test('Should return only elements that are pending completion', () {
        if (kyaLessons.length == 1 && kyaLessons.contains(kyaLessons[0])) {
          fail('Kyas already does not contain pending completion lessons');
        }
        Set<KyaLesson> pendingCompletionKyasSet = {kyaLessons[0]};
        Set<KyaLesson> othersSet =
            kyaLessons.toSet().difference(pendingCompletionKyasSet);

        final pendingCompletionKyas = kyaLessons.filterLessonsPendingTransfer();
        expect(pendingCompletionKyas.length, 1);
        expect(pendingCompletionKyas.contains(kyaLessons[0]), isTrue);
        expect(pendingCompletionKyas.toSet().intersection(othersSet).isEmpty,
            isTrue);
      });
    });

    group('Filter In Progress', () {
      test('Should return only elements that are In Progress', () {
        if (kyaLessons.length == 1 && kyaLessons.contains(kyaLessons[1])) {
          fail('Kyas already does not contain In Progress lessons');
        }
        Set<KyaLesson> inProgressKyasSet = {kyaLessons[1]};
        Set<KyaLesson> othersSet =
            kyaLessons.toSet().difference(inProgressKyasSet);

        final inProgressKyas = kyaLessons.filterLessonsInProgress();
        expect(inProgressKyas.length, 1);
        expect(inProgressKyas.contains(kyaLessons[1]), isTrue);
        expect(inProgressKyas.toSet().intersection(othersSet).isEmpty, isTrue);
      });
    });
  });
}
