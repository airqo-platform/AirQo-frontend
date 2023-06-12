import 'package:app/screens/profile/profile_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Test whether sign up button has text', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: SignUpButton(),
      ),
    );
    await tester.pumpAndSettle();
    final signUpFinder = find.widgetWithText(OutlinedButton, 'Sign Up');
    expect(signUpFinder, findsOneWidget);
  });

  testWidgets('Test whether log out button has text', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: SignOutButton(),
      ),
    );
    await tester.pumpAndSettle();
    final logOutFinder = find.widgetWithText(OutlinedButton, 'Log Out');
    expect(logOutFinder, findsOneWidget);
  });

  testWidgets('Test Sign Up Section', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: SignUpSection(),
      ),
    );

    await tester.pumpAndSettle();
    final personaliseFinder = find.text('Personalise your\nexperience');
    final createAccountTextFinder = find.text(
        'Create your account today and enjoy air quality updates and health tips.');

    expect(personaliseFinder, findsOneWidget);
    expect(createAccountTextFinder, findsOneWidget);
  });
}
