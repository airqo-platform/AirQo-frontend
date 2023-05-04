import 'package:app/blocs/blocs.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('KyaProgressCubit', () {
    late KyaProgressCubit kyaProgressCubit;

    setUp(() => kyaProgressCubit = KyaProgressCubit());

    test('initial state is 0', () {
      expect(kyaProgressCubit.state, 0.0);
    });

    blocTest<KyaProgressCubit, double>(
      'emits value when updateProgress called',
      build: () => kyaProgressCubit,
      act: (cubit) => cubit.updateProgress(300),
      expect: () => [300.0],
    );

    blocTest<KyaProgressCubit, double>(
      'emits value when updateProgress called',
      build: () => kyaProgressCubit,
      act: (cubit) => cubit.updateProgress(1),
      expect: () => [1.0],
    );
  });
}
