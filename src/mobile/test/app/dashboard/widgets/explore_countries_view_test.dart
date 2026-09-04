import 'package:airqo/src/app/dashboard/widgets/explore_countries_view.dart';
import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/widgets/empty_state_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows empty state when there are no measurements',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider(
          create: (_) => LanguageBloc(),
          child: const Scaffold(
            body: ExploreCountriesView(measurements: []),
          ),
        ),
      ),
    );

    expect(find.byType(EmptyStateView), findsOneWidget);
    expect(find.text('No air quality stations available'), findsOneWidget);
  });
}
