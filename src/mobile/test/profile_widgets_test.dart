import 'package:app/screens/profile/profile_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Test whether sign up button has text', (tester) async {
    final key = GlobalKey();
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en'), // English
          Locale('fr'), // French
        ],
        home: SignUpButton(key: key),
      ),
    );
    await tester.pumpAndSettle();
    final signUpFinder = find.widgetWithText(
        OutlinedButton, AppLocalizations.of(key.currentContext!)!.signUp);
    expect(signUpFinder, findsOneWidget);
  });

  testWidgets('Test whether log out button has text', (tester) async {
    final key = GlobalKey();
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en'), // English
          Locale('fr'), // French
        ],
        home: SignOutButton(key: key),
      ),
    );
    await tester.pumpAndSettle();
    final logOutFinder = find.widgetWithText(
        OutlinedButton, AppLocalizations.of(key.currentContext!)!.logout);
    expect(logOutFinder, findsOneWidget);
  });

  testWidgets('Test Sign Up Section', (tester) async {
    final key = GlobalKey();

    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en'), // English
          Locale('fr'), // French
        ],
        home: SignUpSection(key: key),
      ),
    );

    await tester.pumpAndSettle();
    final personaliseFinder = find.text(
        AppLocalizations.of(key.currentContext!)!.personaliseYourExperience);
    final createAccountTextFinder = find.text(
        AppLocalizations.of(key.currentContext!)!
            .createYourAccountTodayAndEnjoyAirQualityUpdatesAndHealthTips);

    expect(personaliseFinder, findsOneWidget);
    expect(createAccountTextFinder, findsOneWidget);
  });
}
