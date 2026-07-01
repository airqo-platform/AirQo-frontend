import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'dart:async';
import 'package:airqo/src/app/learn/bloc/kya_bloc.dart';
import 'package:airqo/src/app/learn/repository/learn_repository.dart';
import 'package:airqo/src/app/learn/models/learn_v2_catalog.dart';

// Generate mocks
@GenerateMocks([LearnRepository])
import 'kya_bloc_test.mocks.dart';

void main() {
  group('KyaBloc', () {
    late MockLearnRepository mockRepository;
    late KyaBloc kyaBloc;

    setUp(() {
      mockRepository = MockLearnRepository();
      kyaBloc = KyaBloc(mockRepository);
    });

    tearDown(() {
      kyaBloc.close();
    });

    test('initial state is KyaInitial', () {
      expect(kyaBloc.state, equals(KyaInitial()));
    });

    group('LoadLessons', () {
      final mockCatalog = LearnV2CatalogResponse(
        success: true,
        catalogVersion: 'v1',
        courses: [
          LearnV2Course(
            id: 'course-1',
            courseNumber: 1,
            title: 'Know Your Air',
            plainTitleKey: 'Know Your Air',
            units: [],
          ),
          LearnV2Course(
            id: 'course-2',
            courseNumber: 2,
            title: 'Read the Air',
            plainTitleKey: 'Read the Air',
            units: [],
          ),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'emits [LessonsLoading, LessonsLoaded] when LoadLessons succeeds',
        build: () {
          when(mockRepository.fetchCatalog(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => mockCatalog);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          LessonsLoaded(mockCatalog),
        ],
        verify: (_) {
          verify(mockRepository.fetchCatalog(forceRefresh: false)).called(1);
        },
      );

      blocTest<KyaBloc, KyaState>(
        'emits [LessonsLoading, LessonsLoadingError] when LoadLessons fails',
        build: () {
          when(mockRepository.fetchCatalog(forceRefresh: anyNamed('forceRefresh')))
              .thenThrow(Exception('Network error'));
          when(mockRepository.getCachedCatalog()).thenAnswer((_) async => null);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoadingError>()
              .having((state) => state.message, 'message', contains('Network error')),
        ],
        verify: (_) {
          verify(mockRepository.fetchCatalog(forceRefresh: false)).called(1);
        },
      );

      blocTest<KyaBloc, KyaState>(
        'emits [LessonsLoading, LessonsLoaded] with empty courses when repository returns empty catalog',
        build: () {
          final emptyCatalog = LearnV2CatalogResponse(
            success: true,
            catalogVersion: 'v1',
            courses: [],
          );
          when(mockRepository.fetchCatalog(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => emptyCatalog);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoaded>()
              .having((state) => state.model.courses, 'courses', isEmpty),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'handles force refresh parameter correctly',
        build: () {
          when(mockRepository.fetchCatalog(forceRefresh: true))
              .thenAnswer((_) async => mockCatalog);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons(forceRefresh: true)),
        expect: () => [
          LessonsLoading(),
          LessonsLoaded(mockCatalog),
        ],
        verify: (_) {
          verify(mockRepository.fetchCatalog(forceRefresh: true)).called(1);
        },
      );

      blocTest<KyaBloc, KyaState>(
        'handles timeout exception',
        build: () {
          when(mockRepository.fetchCatalog(forceRefresh: anyNamed('forceRefresh')))
              .thenThrow(TimeoutException('Request timeout', Duration(seconds: 30)));
          when(mockRepository.getCachedCatalog()).thenAnswer((_) async => null);
          return kyaBloc;
        },
        act: (bloc) => bloc.add(LoadLessons()),
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoadingError>(),
        ],
      );
    });

    group('Multiple LoadLessons events', () {
      final mockCatalog = LearnV2CatalogResponse(
        success: true,
        catalogVersion: 'v1',
        courses: [],
      );

      blocTest<KyaBloc, KyaState>(
        'handles multiple rapid LoadLessons events correctly',
        build: () {
          when(mockRepository.fetchCatalog(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => mockCatalog);
          return kyaBloc;
        },
        act: (bloc) {
          bloc.add(LoadLessons());
          bloc.add(LoadLessons());
          bloc.add(LoadLessons());
        },
        expect: () => [
          LessonsLoading(),
          LessonsLoaded(mockCatalog),
          LessonsLoading(),
          LessonsLoaded(mockCatalog),
          LessonsLoading(),
          LessonsLoaded(mockCatalog),
        ],
        verify: (_) {
          verify(mockRepository.fetchCatalog(forceRefresh: false)).called(3);
        },
      );
    });

    group('State transitions', () {
      blocTest<KyaBloc, KyaState>(
        'maintains state consistency during error recovery',
        build: () {
          when(mockRepository.fetchCatalog(forceRefresh: anyNamed('forceRefresh')))
              .thenThrow(Exception('First call fails'));
          when(mockRepository.getCachedCatalog()).thenAnswer((_) async => null);
          return kyaBloc;
        },
        act: (bloc) {
          bloc.add(LoadLessons());
        },
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoadingError>(),
        ],
      );

      blocTest<KyaBloc, KyaState>(
        'recovers from error on subsequent call',
        build: () {
          when(mockRepository.fetchCatalog(forceRefresh: anyNamed('forceRefresh')))
              .thenAnswer((_) async => LearnV2CatalogResponse(
                    success: true,
                    catalogVersion: 'v1',
                    courses: [],
                  ));
          return kyaBloc;
        },
        act: (bloc) {
          bloc.add(LoadLessons());
        },
        expect: () => [
          LessonsLoading(),
          isA<LessonsLoaded>()
              .having((state) => state.model.success, 'success', true),
        ],
      );
    });

    group('Error handling with cached data', () {
      blocTest<KyaBloc, KyaState>(
        'emits LessonsLoadingError when fetch fails and no cache',
        build: () {
          when(mockRepository.fetchCatalog(forceRefresh: anyNamed('forceRefresh')))
              .thenThrow(Exception('Network failed'));
          when(mockRepository.getCachedCatalog()).thenAnswer((_) async => null);
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
  });
}
