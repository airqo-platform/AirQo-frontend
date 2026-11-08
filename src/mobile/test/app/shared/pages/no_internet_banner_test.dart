import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/bloc/connectivity_bloc.dart';
import 'package:airqo/src/app/shared/pages/no_internet_banner.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

/// Real bloc behaviour without the platform connectivity plugin.
class _FakeConnectivityBloc extends Bloc<ConnectivityEvent, ConnectivityState>
    implements ConnectivityBloc {
  _FakeConnectivityBloc(super.initialState) {
    on<ConnectivityChanged>((event, emit) => emit(
        event.isConnected ? ConnectivityOnline() : const ConnectivityOffline()));
    on<ConnectivityBannerDismissed>((event, emit) {
      dismissCount++;
      if (state is ConnectivityOffline) emit(const ConnectivityOffline(true));
    });
  }

  int dismissCount = 0;
}

void main() {
  late _FakeConnectivityBloc bloc;

  tearDown(() => bloc.close());

  Future<void> pumpBanner(
    WidgetTester tester,
    ConnectivityState initial, {
    VoidCallback? onClose,
  }) async {
    bloc = _FakeConnectivityBloc(initial);
    await tester.pumpWidget(MaterialApp(
      home: BlocProvider<LanguageBloc>(
        create: (_) => LanguageBloc(),
        child: Scaffold(
          body: BlocProvider<ConnectivityBloc>.value(
            value: bloc,
            child: NoInternetBanner(
              onClose: onClose,
              backOnlineDuration: const Duration(seconds: 2),
            ),
          ),
        ),
      ),
    ));
    await tester.pump();
  }

  Future<void> setConnected(WidgetTester tester, bool connected) async {
    bloc.add(ConnectivityChanged(connected));
    // Let the bloc emit, then let the switch animation finish. The pending
    // "Back online" timer isn't a frame, so this doesn't wait for it.
    await tester.pump();
    await tester.pumpAndSettle();
  }

  testWidgets('offline shows a calm card inside Material, with no old copy',
      (tester) async {
    await pumpBanner(tester, const ConnectivityOffline());

    expect(find.text("You're offline"), findsOneWidget);
    expect(
      find.text(
          "Showing your saved air quality. We'll refresh when you're back online."),
      findsOneWidget,
    );
    expect(find.text('Internet Connection Lost'), findsNothing);
    // A Material ancestor is what prevents Flutter's debug text underline.
    expect(
      find.ancestor(
          of: find.text("You're offline"), matching: find.byType(Material)),
      findsWidgets,
    );
    expect(find.byIcon(Icons.cloud_off_rounded), findsOneWidget);
  });

  testWidgets('dismiss hides the card, notifies the bloc and calls onClose',
      (tester) async {
    var closed = false;
    await pumpBanner(tester, const ConnectivityOffline(),
        onClose: () => closed = true);

    await tester.tap(find.byTooltip('Dismiss'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(bloc.dismissCount, 1);
    expect(closed, isTrue);
    expect(find.text("You're offline"), findsNothing);
  });

  testWidgets('shows nothing when online from the start', (tester) async {
    await pumpBanner(tester, ConnectivityOnline());
    expect(find.text("You're offline"), findsNothing);
    expect(find.text('Back online'), findsNothing);
  });

  testWidgets('confirms "Back online" after reconnecting, then hides it',
      (tester) async {
    await pumpBanner(tester, const ConnectivityOffline());

    await setConnected(tester, true);
    expect(find.text('Back online'), findsOneWidget);
    expect(find.text("You're offline"), findsNothing);
    expect(find.byTooltip('Dismiss'), findsNothing);

    await tester.pump(const Duration(seconds: 2));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Back online'), findsNothing);
  });

  testWidgets('also confirms "Back online" after the offline card was dismissed',
      (tester) async {
    await pumpBanner(tester, const ConnectivityOffline(true));
    expect(find.text("You're offline"), findsNothing);

    await setConnected(tester, true);
    expect(find.text('Back online'), findsOneWidget);
    await tester.pump(const Duration(seconds: 3));
  });

  testWidgets('going offline again cancels the "Back online" confirmation',
      (tester) async {
    await pumpBanner(tester, const ConnectivityOffline());
    await setConnected(tester, true);
    await setConnected(tester, false);

    expect(find.text("You're offline"), findsOneWidget);
    expect(find.text('Back online'), findsNothing);

    await tester.pump(const Duration(seconds: 3));
    expect(find.text("You're offline"), findsOneWidget);
  });
}
