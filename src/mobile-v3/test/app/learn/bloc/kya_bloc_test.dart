import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mockito/mockito.dart';

import 'package:mobile_v3/app/learn/bloc/kya_bloc.dart';
import 'package:mobile_v3/app/learn/data/kya_repository.dart';
import 'package:mobile_v3/app/learn/data/kya_model.dart';

class MockKyaRepository extends Mock implements KyaRepository {}

void main() {
  late MockKyaRepository mockRepo;
  late KyaBloc subject;

  setUp(() {
    mockRepo = MockKyaRepository();
    subject = KyaBloc(repository: mockRepo);
  });

  tearDown(() {
    subject.close();
  });

  test('initial state is KyaInitial', () {
    expect(subject.state, equals(KyaInitial()));
  });

  blocTest<KyaBloc, KyaState>(
    'emits [KyaLoading, KyaLoaded] when LoadKyaEvent succeeds',
    build: () {
      when(mockRepo.fetchKyaItems())
          .thenAnswer((_) async => [KyaModel(id: 1, title: 'Item A')]);
      return subject;
    },
    act: (bloc) => bloc.add(LoadKyaEvent()),
    expect: () => <KyaState>[
      KyaLoading(),
      KyaLoaded(items: [KyaModel(id: 1, title: 'Item A')]),
    ],
  );

  blocTest<KyaBloc, KyaState>(
    'emits [KyaLoading, KyaError] when LoadKyaEvent fails',
    build: () {
      when(mockRepo.fetchKyaItems())
          .thenThrow(Exception('fetch failed'));
      return subject;
    },
    act: (bloc) => bloc.add(LoadKyaEvent()),
    expect: () => <KyaState>[
      KyaLoading(),
      isA<KyaError>().having((e) => e.message, 'message', contains('fetch failed')),
    ],
  );

  blocTest<KyaBloc, KyaState>(
    'emits [KyaLoading, KyaLoaded] with empty list when repository returns no items',
    build: () {
      when(mockRepo.fetchKyaItems())
          .thenAnswer((_) async => <KyaModel>[]);
      return subject;
    },
    act: (bloc) => bloc.add(LoadKyaEvent()),
    expect: () => <KyaState>[
      KyaLoading(),
      KyaLoaded(items: []),
    ],
  );
}