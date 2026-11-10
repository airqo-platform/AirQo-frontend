import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/map/widgets/map_air_quality_card.dart';
import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/widgets/stale_readings_banner.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

Measurement _measurementAt(DateTime time) => Measurement(
      id: 'm1',
      siteId: 'site-1',
      time: time.toUtc().toIso8601String(),
      siteDetails: SiteDetails(id: 'site-1', name: 'Lubowa', city: 'Kampala'),
    );

Widget _wrap(Widget child) => MaterialApp(
      home: BlocProvider<LanguageBloc>(
        create: (_) => LanguageBloc(),
        child: Scaffold(body: SingleChildScrollView(child: child)),
      ),
    );

void main() {
  group('MapAirQualityCard staleness', () {
    testWidgets('shows a positive note, never an age, when over 6 hours old',
        (tester) async {
      await tester.pumpWidget(_wrap(MapAirQualityCard(
        measurement: _measurementAt(
            DateTime.now().subtract(const Duration(hours: 7, minutes: 5))),
        onDismiss: () {},
        onViewForecast: () {},
      )));

      expect(find.text('Fresh update on its way'), findsOneWidget);
      expect(find.textContaining('hour'), findsNothing);
      expect(find.textContaining('ago'), findsNothing);
    });

    testWidgets('stays quiet for a reading under 6 hours old', (tester) async {
      await tester.pumpWidget(_wrap(MapAirQualityCard(
        measurement:
            _measurementAt(DateTime.now().subtract(const Duration(hours: 4))),
        onDismiss: () {},
        onViewForecast: () {},
      )));

      expect(find.text('Fresh update on its way'), findsNothing);
    });
  });

  group('StaleReadingsBanner', () {
    testWidgets('renders its message inline and elevated', (tester) async {
      await tester.pumpWidget(_wrap(const Column(children: [
        StaleReadingsBanner(message: 'Inline delay notice'),
        StaleReadingsBanner(message: 'Map delay notice', elevated: true),
      ])));
      await tester.pump();

      expect(find.text('Inline delay notice'), findsOneWidget);
      expect(find.text('Map delay notice'), findsOneWidget);
      expect(find.byIcon(Icons.autorenew), findsNWidgets(2));
    });
  });
}
