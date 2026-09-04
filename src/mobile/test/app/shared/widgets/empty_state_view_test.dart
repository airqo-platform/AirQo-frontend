import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/widgets/empty_state_view.dart';
import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('renders title, message, and action', (tester) async {
    var tapped = false;
    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider(
          create: (_) => LanguageBloc(),
          child: Builder(
            builder: (context) {
              return Scaffold(
                body: EmptyStateView(
                  icon: SystemGlyph.emptyPlace(context),
                  title: 'No air quality stations available',
                  message:
                      "We couldn't find any stations right now. Please try again.",
                  actionLabel: 'Try Again',
                  onAction: () => tapped = true,
                ),
              );
            },
          ),
        ),
      ),
    );

    expect(find.text('No air quality stations available'), findsOneWidget);
    expect(
      find.text("We couldn't find any stations right now. Please try again."),
      findsOneWidget,
    );
    await tester.tap(find.text('Try Again'));
    expect(tapped, isTrue);
  });
}
