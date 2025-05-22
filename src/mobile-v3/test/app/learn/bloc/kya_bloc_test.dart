import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'dart:async';
import 'package:airqo/src/app/learn/bloc/kya_bloc.dart';
import 'package:airqo/src/app/learn/repository/kya_repository.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';

// Generate mocks
@GenerateMocks([KyaRepository])
import 'kya_bloc_test.mocks.dart';

void main() {
  group('KyaBloc', () {
    late MockKyaRepository mockRepository;
    late KyaBloc kyaBloc;

    setUp(() {
      mockRepository = MockKyaRepository();
      kyaBloc = KyaBloc(mockRepository);
    });

    tearDown(() {
      kyaBloc.close();
    });

    test('initial state is KyaInitial', () {
      expect(kyaBloc.state, equals(KyaInitial()));
    });

    group('LoadLessons', () {
      final mockLessonResponse = LessonResponseModel(
        success: true,
        message: 'Lessons loaded successfully',
        kyaLessons: [
          KyaLesson(
            id: 'lesson-1',
            title: 'Understanding Air Quality',
            completionMessage: 'Not completed',
            image: 'https://example.com/lesson1.jpg',
            tasks: [
              Task(
                id: 'task-1',
                title: 'Introduction to PM2.5',
                content: 'Learn about particulate matter and its health effects',
                image: 'https://example.com/task1.jpg',
                createdAt: DateTime.parse('2024-01-15T12:00:00Z'),
                updatedAt: DateTime.parse('2024-01-15T12:00:00Z'),
                v: 0,
                kyaLesson: 'lesson-1',
                taskPosition: 1,
              ),
            ],
          ),
          KyaLesson(
            id: 'lesson-2',
            title: 'Health Effects of Air Pollution',
            completionMessage: 'Completed',
            image: 'https://example.com/lesson2.jpg',
            tasks: [
              Task(
                id: 'task-2',
                title: 'Respiratory Health',
                content: 'Understanding how air pollution affects your lungs',
                image: 'https://example.com/task2.jpg',
                createdAt: DateTime.parse('2024-01-15T12:00:00Z'),
                updatedAt: DateTime.parse('2024-01-15T12:00:00Z'),
                v: 0,
                kyaLesson: 'lesson-2',
                taskPosition: 1,
              ),
            ],
          ),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'emits [LessonsLoading, LessonsLoaded] when LoadLessons succeeds',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => mockLessonResponse);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          LessonsLoaded(mockLessonResponse),
        ],
        verify: (_) {
          verify(mockRepository.fetchLessons(forceRefresh: false)).called(1);
        },
      );

      blocTest<KyaBloc, KyaState>(
        'emits [LessonsLoading, LessonsLoadingError] when LoadLessons fails',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenThrow(Exception('Network error'));
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoadingError>()
              .having((state) => state.message, 'message', contains('Network error')),
        ],
        verify: (_) {
          verify(mockRepository.fetchLessons(forceRefresh: false)).called(1);
        },
      );

      blocTest<KyaBloc, KyaState>(
        'emits [LessonsLoading, LessonsLoaded] with empty lessons when repository returns empty list',
        build: () {
          final emptyResponse = LessonResponseModel(
            success: true,
            message: 'No lessons available',
            kyaLessons: [],
          );
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => emptyResponse);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoaded>()
              .having((state) => state.model.kyaLessons, 'lessons', isEmpty),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'handles API response with success false',
        build: () {
          final failedResponse = LessonResponseModel(
            success: false,
            message: 'Failed to load lessons',
            kyaLessons: [],
          );
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => failedResponse);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoaded>()
              .having((state) => state.model.success, 'success', false)
              .having((state) => state.model.message, 'message', 'Failed to load lessons'),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'handles timeout exception',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenThrow(TimeoutException('Request timeout', Duration(seconds: 30)));
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoadingError>()
              .having((state) => state.message, 'message', contains('timeout')),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'handles HTTP exception',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenThrow(Exception('HTTP 500: Internal Server Error'));
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoadingError>()
              .having((state) => state.message, 'message', contains('500')),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'handles force refresh parameter correctly',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: true))
              .thenAnswer((_) async => mockLessonResponse);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons(forceRefresh: true)),
        expect: () => [
          LessonsLoading(),
          LessonsLoaded(mockLessonResponse),
        ],
        verify: (_) {
          verify(mockRepository.fetchLessons(forceRefresh: true)).called(1);
        },
      );
    });

    group('Multiple LoadLessons events', () {
      final mockResponse = LessonResponseModel(
        success: true,
        message: 'Success',
        kyaLessons: [
          KyaLesson(
            id: 'lesson-1',
            title: 'Test Lesson',
            completionMessage: 'Not completed',
            image: 'test.jpg',
            tasks: [],
          ),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'handles multiple rapid LoadLessons events correctly',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => mockResponse);
          return kyaBloc;
        },
        act: (bloc) {
          bloc.add(LoadLessons());
          bloc.add(LoadLessons());
          bloc.add(LoadLessons());
        },
        expect: () => [
          LessonsLoading(),
          LessonsLoaded(mockResponse),
          LessonsLoading(),
          LessonsLoaded(mockResponse),
          LessonsLoading(),
          LessonsLoaded(mockResponse),
        ],
        verify: (_) {
          verify(mockRepository.fetchLessons(forceRefresh: false)).called(3);
        },
      );
    });

    group('State transitions', () {
      blocTest<KyaBloc, KyaState>(
        'maintains state consistency during error recovery',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenThrow(Exception('First call fails'));
          return kyaBloc;
        },
        act: (bloc) {
          bloc.add(LoadLessons()); // This will fail
        },
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoadingError>(),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'recovers from error on subsequent call',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => LessonResponseModel(
                    success: true,
                    message: 'Recovery successful',
                    kyaLessons: [],
                  ));
          return kyaBloc;
        },
        act: (bloc) {
          bloc.add(LoadLessons()); // This will succeed
        },
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoaded>()
              .having((state) => state.model.message, 'message', 'Recovery successful'),
        ],
      );
    });

    group('Edge cases', () {
      blocTest<KyaBloc, KyaState>(
        'handles null response gracefully',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => throw Exception('Null response'));
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoadingError>(),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'handles lesson with missing required fields',
        build: () {
          final responseWithIncompleteLesson = LessonResponseModel(
            success: true,
            message: 'Success',
            kyaLessons: [
              KyaLesson(
                id: 'incomplete-lesson',
                title: 'Incomplete Lesson',
                completionMessage: '', // Empty completion message
                image: '', // Empty image
                tasks: [], // Empty tasks
              ),
            ],
          );
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => responseWithIncompleteLesson);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoaded>()
              .having((state) => state.model.kyaLessons.length, 'lessons count', 1)
              .having((state) => state.model.kyaLessons.first.title, 'lesson title', 'Incomplete Lesson')
              .having((state) => state.model.kyaLessons.first.completionMessage, 'completion message', ''),
        ],
      );
    });

    group('Error handling with cached data', () {
      blocTest<KyaBloc, KyaState>(
        'emits LessonsLoadingError when fetch fails',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenThrow(Exception('Network failed'));
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoadingError>()
              .having((state) => state.message, 'error message', contains('Network failed')),
        ],
      );
    });

    group('LoadLessons event variants', () {
      blocTest<KyaBloc, KyaState>(
        'handles LoadLessons with forceRefresh true',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: true))
              .thenAnswer((_) async => LessonResponseModel(
                    success: true,
                    message: 'Force refreshed',
                    kyaLessons: [],
                  ));
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons(forceRefresh: true)),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoaded>()
              .having((state) => state.model.message, 'message', 'Force refreshed'),
        ],
        verify: (_) {
          verify(mockRepository.fetchLessons(forceRefresh: true)).called(1);
          verifyNever(mockRepository.fetchLessons(forceRefresh: false));
        },
      );

      blocTest<KyaBloc, KyaState>(
        'handles LoadLessons with forceRefresh false (default)',
        build: () {
          when(mockRepository.fetchLessons(forceRefresh: false))
              .thenAnswer((_) async => LessonResponseModel(
                    success: true,
                    message: 'Normal load',
                    kyaLessons: [],
                  ));
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()), // Default forceRefresh is false
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoaded>()
              .having((state) => state.model.message, 'message', 'Normal load'),
        ],
        verify: (_) {
          verify(mockRepository.fetchLessons(forceRefresh: false)).called(1);
        },
      );
    });

    group('Task model validation', () {
      blocTest<KyaBloc, KyaState>(
        'handles lessons with complex task structures',
        build: () {
          final complexResponse = LessonResponseModel(
            success: true,
            message: 'Complex lessons loaded',
            kyaLessons: [
              KyaLesson(
                id: 'complex-lesson',
                title: 'Complex Lesson with Multiple Tasks',
                completionMessage: 'In progress',
                image: 'https://example.com/complex.jpg',
                tasks: [
                  Task(
                    id: 'task-1',
                    title: 'First Task',
                    content: 'Content for first task',
                    image: 'https://example.com/task1.jpg',
                    createdAt: DateTime.parse('2024-01-15T10:00:00Z'),
                    updatedAt: DateTime.parse('2024-01-15T11:00:00Z'),
                    v: 1,
                    kyaLesson: 'complex-lesson',
                    taskPosition: 1,
                  ),
                  Task(
                    id: 'task-2',
                    title: 'Second Task',
                    content: 'Content for second task',
                    image: 'https://example.com/task2.jpg',
                    createdAt: DateTime.parse('2024-01-15T12:00:00Z'),
                    updatedAt: DateTime.parse('2024-01-15T13:00:00Z'),
                    v: 2,
                    kyaLesson: 'complex-lesson',
                    taskPosition: 2,
                  ),
                ],
              ),
            ],
          );
          when(mockRepository.fetchLessons(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => complexResponse);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoaded>()
              .having((state) => state.model.kyaLessons.length, 'lessons count', 1)
              .having((state) => state.model.kyaLessons.first.tasks.length, 'tasks count', 2),
        ],
      );
    });
  });
}