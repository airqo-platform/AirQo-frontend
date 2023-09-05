import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

void main() {
  group('OfflineBanner Widget Tests', () {
    late InternetConnectionBannerCubit connectionBannerCubit;
    late Widget testWidget;

    setUp(() {
      connectionBannerCubit = InternetConnectionBannerCubit();
      testWidget = MaterialApp(
        home: BlocProvider<InternetConnectionBannerCubit>.value(
          value: connectionBannerCubit,
          child: const OfflineBanner(child: Placeholder()),
        ),
      );
    });

    testWidgets('Initial Banner Visibility', (tester) async {
      await tester.pumpWidget(testWidget);
      final initialVisibility = find.byType(Visibility);
      expect(initialVisibility, findsOneWidget);
    });

    testWidgets('Hiding and Showing the Banner', (tester) async {
      await tester.pumpWidget(testWidget);

      // Hide the banner
      connectionBannerCubit.hideBanner();
      await tester.pumpAndSettle();
      final hiddenBanner = find.byType(SizedBox);
      expect(hiddenBanner, findsNothing);

      // Show the banner
      connectionBannerCubit.showBanner();
      await tester.pumpAndSettle();
      final visibleBanner = find.byType(Visibility);
      expect(visibleBanner, findsOneWidget);
    });

    testWidgets('Resetting the Banner on Connectivity Change', (tester) async {
      await tester.pumpWidget(testWidget);

      // Hide the banner first
      connectionBannerCubit.hideBanner();
      await tester.pumpAndSettle();

      // Reset the banner due to connectivity change
      connectionBannerCubit.resetBanner();
      await tester.pumpAndSettle();
      final visibleBanner = find.byType(Visibility);
      expect(visibleBanner, findsOneWidget);
    });

    testWidgets('Banner Remains Hidden on Online Status', (tester) async {
      await tester.pumpWidget(testWidget);

      // Simulate a change in connectivity status to online
      connectionBannerCubit.resetBanner(); // Reset first
      await tester.pumpAndSettle();
      connectionBannerCubit.hideBanner(); // Hide the banner
      await tester.pumpAndSettle();

      // ConnectivityResult.mobile or ConnectivityResult.wifi
      connectionBannerCubit.resetBanner(); // Reset again to online
      await tester.pumpAndSettle();
      final hiddenBanner = find.byType(SizedBox);
      expect(hiddenBanner, findsNothing);
    });

    testWidgets('Banner Visibility After Multiple Resets', (tester) async {
      await tester.pumpWidget(testWidget);

      // Hide the banner first
      connectionBannerCubit.hideBanner();
      await tester.pumpAndSettle();

      // Reset the banner multiple times
      connectionBannerCubit.resetBanner();
      await tester.pumpAndSettle();
      connectionBannerCubit.resetBanner();
      await tester.pumpAndSettle();

      final visibleBanner = find.byType(Visibility);
      expect(visibleBanner, findsOneWidget);
    });
  });
}
