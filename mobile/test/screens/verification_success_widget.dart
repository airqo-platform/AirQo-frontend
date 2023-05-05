import 'package:app/models/enum_constants.dart';
import 'package:app/screens/auth/auth_verification_success.dart';
import 'package:app/themes/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Verification Success Widget', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: AuthVerificationSuccessWidget(authProcedure: AuthProcedure.login, authMethod: AuthMethod.email, code: '123456',),
    ),);


    final titleFinder = find.text('Your email has been verified');
    final subTitleFinder = find.text('Pheww, almost done, hold in there.');

    // Title tests
    expect(titleFinder, findsOneWidget);
    expect(subTitleFinder, findsOneWidget);

    // Icon tests
    expect(tester.widget<Icon>(find.byType(Icon)).icon, Icons.check_circle_rounded);
    expect(tester.widget<Icon>(find.byType(Icon)).size, 100);
    expect(tester.widget<Icon>(find.byType(Icon)).color, CustomColors.appColorValid);

    // Opt filed tests
    final optFieldFinder = find.byType(TextFormField);
    expect(optFieldFinder, findsOneWidget);
    expect(tester.widget<TextFormField>(optFieldFinder).initialValue, '123456');
    expect(tester.widget<TextFormField>(optFieldFinder).enabled, false);

    // Button tests
    final nextButtonFinder = find.byType(OutlinedButton);
    final nextTextFinder = find.text('Next');

    expect(nextButtonFinder, findsOneWidget);
    expect(nextTextFinder, findsOneWidget);
    expect(tester.widget<OutlinedButton>(nextButtonFinder).enabled, true);
  });
}