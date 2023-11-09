import 'package:app/blocs/blocs.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SearchPageCubit', () {
    late SearchPageCubit searchPageCubit;

    setUp(() => searchPageCubit = SearchPageCubit());

    test('initial state is filtering', () {
      expect(searchPageCubit.state, SearchPageState.filtering);
    });

    blocTest<SearchPageCubit, SearchPageState>(
      'emits filtering when showFiltering() is called',
      build: () => searchPageCubit,
      act: (cubit) => cubit.showFiltering(),
      expect: () => [SearchPageState.filtering],
    );

    blocTest<SearchPageCubit, SearchPageState>(
      'emits searching when showSearching() is called',
      build: () => searchPageCubit,
      act: (cubit) => cubit.showSearching(),
      expect: () => [SearchPageState.searching],
    );
  });
}
