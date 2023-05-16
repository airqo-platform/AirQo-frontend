import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('kyaextension', () {
    List<Kya> kyas = [];
    bool isNotSorted(List<Kya> kyas) {
      for (int x = 0, y = 1; x < kyas.length - 1; x++, y++) {
        double a = kyas[x].progress == -1 ? 2 : kyas[x].progress;
        double b = kyas[y].progress == -1 ? 2 : kyas[y].progress;
        if (a < b) {
          return true;
        }
      }
      kyas.shuffle();
      isNotSorted(kyas);
      return true;
    }

    setUp(() => {
          kyas = List.generate(
            4,
            (index) => Kya(
              progress: index == 0
                  ? 1
                  : index == 1
                      ? 0.5
                      : index == 2
                          ? -1
                          : 0,
              completionMessage: 'Lesson ${index + 1} Completed',
              id: (index + 1).toString(),
              imageUrl: '',
              lessons: const [],
              secondaryImageUrl: '',
              shareLink: '',
              title: '',
            ),
          ),
        });

    group('sortByProgress', () {
      test('Should sort Kyas in descending order by progress', () {
        List<Kya> unsortedKyas = [kyas[0], kyas[1], kyas[2], kyas[3]];
        if (isNotSorted(kyas)) {
          kyas.sortByProgress();
        }

        expect(
            kyas,
            containsAllInOrder([
              unsortedKyas[2],
              unsortedKyas[0],
              unsortedKyas[1],
              unsortedKyas[3]
            ]));
      });
    });

    group('Filter Complete', () {
      test('returns empty list when all Kyas are in progress', () {
        kyas = [kyas[0], kyas[1], kyas[3]];

        final filteredKyas = kyas.filterComplete();
        expect(filteredKyas.isEmpty, true);
      });
      test('Should return only completed Lessons', () {
        if (kyas.length == 1 && kyas.contains(kyas[2])) {
          fail('Kyas already does not contain uncompleted lessons');
        }

        Set<Kya> unCompletedKyasSet = {kyas[1], kyas[0], kyas[3]};

        final completedKyas = kyas.filterComplete();
        expect(completedKyas.length, 1);
        expect(completedKyas.contains(kyas[2]), isTrue);
        expect(completedKyas.toSet().intersection(unCompletedKyasSet).isEmpty,
            isTrue);
      });
    });

    group('Filter ToDo', () {
      test('Should return only elements that are to do', () {
        if (kyas.length == 1 && kyas.contains(kyas[3])) {
          fail('Kyas already does not contain ToDo lessons');
        }

        Set<Kya> toDoKyasSet = {kyas[3]};
        Set<Kya> startedKyasSet = kyas.toSet().difference(toDoKyasSet);

        final toDoKyas = kyas.filterToDo();
        expect(toDoKyas.length, 1);
        expect(toDoKyas.contains(kyas[3]), isTrue);
        expect(toDoKyas.toSet().intersection(startedKyasSet).isEmpty, isTrue);
      });
    });

    group('Filter Pending Completion', () {
      test('Should return only elements that are pending completion', () {
        if (kyas.length == 1 && kyas.contains(kyas[0])) {
          fail('Kyas already does not contain pending completion lessons');
        }
        Set<Kya> pendingCompletionKyasSet = {kyas[0]};
        Set<Kya> othersSet = kyas.toSet().difference(pendingCompletionKyasSet);

        final pendingCompletionKyas = kyas.filterPendingCompletion();
        expect(pendingCompletionKyas.length, 1);
        expect(pendingCompletionKyas.contains(kyas[0]), isTrue);
        expect(pendingCompletionKyas.toSet().intersection(othersSet).isEmpty,
            isTrue);
      });
    });

    group('Filter In Progress', () {
      test('Should return only elements that are In Progress', () {
        if (kyas.length == 1 && kyas.contains(kyas[1])) {
          fail('Kyas already does not contain In Progress lessons');
        }
        Set<Kya> inProgressKyasSet = {kyas[1]};
        Set<Kya> othersSet = kyas.toSet().difference(inProgressKyasSet);

        final inProgressKyas = kyas.filterInProgressKya();
        expect(inProgressKyas.length, 1);
        expect(inProgressKyas.contains(kyas[1]), isTrue);
        expect(
            inProgressKyas.toSet().intersection(othersSet).isEmpty, isTrue);
      });
    });
  });
}
