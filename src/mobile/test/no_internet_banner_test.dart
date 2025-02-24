import 'package:app/screens/offline_banner.dart'; // Import your cubit file.
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('InternetConnectionBannerCubit', () {
    late InternetConnectionBannerCubit cubit;

    // Setting up the cubit
    setUp(() {
      cubit = InternetConnectionBannerCubit();
    });

    // Closing the cubit .
    tearDown(() {
      cubit.close();
    });

    //check the initial state 
    test('initial state is true', () {
      expect(cubit.state, true);
    });

    // Test to check if the hideBanner method emits false.
    blocTest<InternetConnectionBannerCubit, bool>(
      'emits [false] when hideBanner is called',
      build: () => cubit,
      act: (cubit) => cubit.hideBanner(),
      expect: () => [false],
    );

    // Test to check if the showBanner method emits true.
    blocTest<InternetConnectionBannerCubit, bool>(
      'emits [true] when showBanner is called',
      build: () => cubit,
      act: (cubit) => cubit.showBanner(),
      expect: () => [true],
    );

    // Test to check if the resetBanner method emits true.
    blocTest<InternetConnectionBannerCubit, bool>(
      'emits [true] when resetBanner is called',
      build: () => cubit,
      act: (cubit) => cubit.resetBanner(),
      expect: () => [true],
    );
  });
}
