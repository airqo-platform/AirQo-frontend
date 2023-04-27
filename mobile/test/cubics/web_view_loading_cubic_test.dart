import 'package:app/screens/web_view_page.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('WebViewLoadingCubit', () {
    late WebViewLoadingCubit webViewLoadingCubit;

    setUp(() => webViewLoadingCubit = WebViewLoadingCubit());

    test('initial state is 0', () {
      expect(webViewLoadingCubit.state, 0.0);
    });

    blocTest<WebViewLoadingCubit, int>(
      'emits value when setProgress called',
      build: () => webViewLoadingCubit,
      act: (cubit) => cubit.setProgress(300),
      expect: () => [300],
    );

    blocTest<WebViewLoadingCubit, int>(
      'emits value when setProgress called',
      build: () => webViewLoadingCubit,
      act: (cubit) => cubit.setProgress(1),
      expect: () => [1.0],
    );
  });
}
