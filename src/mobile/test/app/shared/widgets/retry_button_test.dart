import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/widgets/retry_button.dart';
import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('renders refresh glyph and label', (tester) async {
    var tapped = false;
    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider(
          create: (_) => LanguageBloc(),
          child: Scaffold(
            body: RetryButton(onPressed: () => tapped = true),
          ),
        ),
      ),
    );

    expect(find.text('Try Again'), findsOneWidget);
    expect(find.byType(AqRefreshCw01), findsOneWidget);

    await tester.tap(find.text('Try Again'));
    expect(tapped, isTrue);
  });
}
