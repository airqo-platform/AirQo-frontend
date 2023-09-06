import 'dart:async';
import 'dart:ffi';

import 'package:app/screens/home_page.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class MockConnectivity extends Mock implements Connectivity {}

void main() {
  group('OfflineBanner', () {
    late MockConnectivity connectivity;
    late InternetConnectionBannerCubit cubit;

    setUp(() {
      connectivity = MockConnectivity();
      cubit = InternetConnectionBannerCubit();
    });

    testWidgets('shows banner when offline', (tester) async {
      final key = GlobalKey();

      await tester.runAsync(() async {
        dynamic connectivityResult = true;
        connectivityResult = connectivity.checkConnectivity();
        // Set up the mock to return ConnectivityResult.none;
        when(connectivityResult as FutureOr<ConnectivityResult>)
            .thenAnswer((_) async => ConnectivityResult.none);

        await tester.pumpWidget(const MaterialApp(
          home: HomePage(),
        ));
        await tester.pumpAndSettle(const Duration(seconds: 2));

        expect(find.byType(Container), findsOneWidget);
        expect(find.byType(Positioned), findsOneWidget);
        expect(
          find.text(
            AppLocalizations.of(key.currentContext!)!.internetConnectionLost,
          ),
          findsOneWidget,
        );
      });
    });

    testWidgets('hides banner when back online', (tester) async {
      await tester.runAsync(() async {
        // Set up the mock to return ConnectivityResult.none initially
        when(connectivity.checkConnectivity())
            .thenAnswer((_) async => ConnectivityResult.none);

        await tester.pumpWidget(MaterialApp(
          home: OfflineBanner(
            child: Container(),
          ),
        ));

        // Verify that the banner is initially displayed
        expect(find.byType(Positioned), findsOneWidget);

        // Change the mock to return ConnectivityResult.wifi
        when(connectivity.checkConnectivity())
            .thenAnswer((_) async => ConnectivityResult.wifi);

        // Rebuild the widget
        await tester.pump();

        // Verify that the banner is hidden when back online
        expect(find.byType(Positioned), findsNothing);
      });
    });

    testWidgets('resets banner on connectivity change', (tester) async {
      await tester.runAsync(() async {
        // Set up the mock to return ConnectivityResult.none initially
        when(connectivity.checkConnectivity())
            .thenAnswer((_) async => ConnectivityResult.none);

        // Set up the mock stream for connectivity changes
        final connectivityStreamController =
            StreamController<ConnectivityResult>();
        when(connectivity.onConnectivityChanged)
            .thenAnswer((_) => connectivityStreamController.stream);

        await tester.pumpWidget(MaterialApp(
          home: BlocProvider.value(
            value: cubit,
            child: OfflineBanner(
              child: Container(),
            ),
          ),
        ));

        // Verify that the banner is initially displayed
        expect(find.byType(Positioned), findsOneWidget);

        // Change the mock stream to emit ConnectivityResult.wifi
        connectivityStreamController.add(ConnectivityResult.wifi);

        // Wait for the widget to rebuild
        await tester.pump();

        // Verify that the banner is reset on connectivity change
        verify(cubit.resetBanner()).called(1);

        // Close the stream controller
        connectivityStreamController.close();
      });
    });
  });
}
