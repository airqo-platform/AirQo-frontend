import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
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
            description: 'Learn the basics of air quality measurement',
            image: 'https://example.com/lesson1.jpg',
            completion: Completion(
              status: false,
              completionMessage: 'Not completed',
            ),
            tasks: [
              Task(
                title: 'Introduction to PM2.5',
                taskPosition: 1,
                isCompleted: false,
                content: TaskContent(
                  id: 'content-1',
                  title: 'What is PM2.5?',
                  content: 'Particulate matter...',
                  contentType: 'text',
                ),
              ),
            ],
          ),
          KyaLesson(
            id: 'lesson-2',
            title: 'Health Effects of Air Pollution',
            description: 'Understand how air pollution affects your health',
            image: 'https://example.com/lesson2.jpg',
            completion: Completion(
              status: true,
              completionMessage: 'Completed',
            ),
            tasks: [
              Task(
                title: 'Respiratory Health',
                taskPosition: 1,
                isCompleted: true,
                content: TaskContent(
                  id: 'content-2',
                  title: 'Impact on Lungs',
                  content: 'Air pollution can...',
                  contentType: 'text',
                ),
              ),
            ],
          ),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'emits [LessonsLoading, LessonsLoaded] when LoadLessons succeeds',
        build: () {
          when(mockRepository.fetchLessons())
              .thenAnswer((_) async => mockLessonResponse);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          LessonsLoaded(mockLessonResponse),
        ],
        verify: (_) {
          verify(mockRepository.fetchLessons()).called(1);
        },
      );

      blocTest<KyaBloc, KyaState>(
        'emits [LessonsLoading, LessonsLoadingError] when LoadLessons fails',
        build: () {
          when(mockRepository.fetchLessons())
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
          verify(mockRepository.fetchLessons()).called(1);
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
          when(mockRepository.fetchLessons())
              .thenAnswer((_) async => emptyResponse);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          LessonsLoaded(emptyResponse),
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
          when(mockRepository.fetchLessons())
              .thenAnswer((_) async => failedResponse);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          LessonsLoaded(failedResponse), // The bloc loads regardless of success flag
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'handles timeout exception',
        build: () {
          when(mockRepository.fetchLessons())
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
          when(mockRepository.fetchLessons())
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
    });

    group('Multiple LoadLessons events', () {
      final mockResponse = LessonResponseModel(
        success: true,
        message: 'Success',
        kyaLessons: [
          KyaLesson(
            id: 'lesson-1',
            title: 'Test Lesson',
            description: 'Test Description',
            image: 'test.jpg',
            completion: Completion(status: false, completionMessage: 'Not completed'),
            tasks: [],
          ),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'handles multiple rapid LoadLessons events correctly',
        build: () {
          when(mockRepository.fetchLessons())
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
          verify(mockRepository.fetchLessons()).called(3);
        },
      );
    });

    group('State transitions', () {
      blocTest<KyaBloc, KyaState>(
        'maintains state consistency during error recovery',
        build: () {
          when(mockRepository.fetchLessons())
              .thenThrow(Exception('First call fails'))
              .thenAnswer((_) async => LessonResponseModel(
                    success: true,
                    message: 'Recovery successful',
                    kyaLessons: [],
                  ));
          return kyaBloc;
        },
        act: (bloc) {
          bloc.add(LoadLessons()); // This will fail
          bloc.add(LoadLessons()); // This will succeed
        },
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoadingError>(),
          LessonsLoading(),
          isA<LessonsLoaded>(),
        ],
      );
    });

    group('Edge cases', () {
      blocTest<KyaBloc, KyaState>(
        'handles null response gracefully',
        build: () {
          when(mockRepository.fetchLessons())
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
                description: '', // Empty description
                image: '', // Empty image
                completion: Completion(status: false, completionMessage: ''),
                tasks: [], // Empty tasks
              ),
            ],
          );
          when(mockRepository.fetchLessons())
              .thenAnswer((_) async => responseWithIncompleteLesson);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          LessonsLoaded(responseWithIncompleteLesson),
        ],
      );
    });
  });
}