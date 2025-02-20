import 'package:app/models/models.dart';
import 'package:app/screens/insights/insights_widgets.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_svg/svg.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late Insight insight;
  late String name;
  late HealthTip healthTip;

  setUpAll(() async {
    healthTip = HealthTip(
      title: "For Babies",
      description: "Don't go out",
      image:
          "https://firebasestorage.googleapis.com/v0/b/airqo-250220.appspot.com/o/health-tip-images%2Ffamily.png?alt=media&token=8cdc93c0-9f3f-42db-b9a1-7dbdf73c5519",
    );

    insight = Insight(
      dateTime: DateTime.now(),
      currentPm2_5: 5,
      healthTips: List.generate(
        5,
        (index) => healthTip,
      ),
      currentAirQuality: Pollutant.pm2_5.airQuality(5),
      forecastPm2_5: 25,
      forecastAirQuality: Pollutant.pm2_5.airQuality(25),
    );
    name = "Makerere";
  });

  group('Insight AirQuality Widget tests', () {
    testWidgets('Tests none empty insight', (tester) async {
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
          home: InsightAirQualityWidget(insight, name: name, key: key),
        ),
      );

      final nameFinder = find.text(name);
      final airQualityTextFinder =
          find.text('${insight.currentAirQuality?.title}');
      final airQualityValueFinder =
          find.text("${insight.currentPm2_5?.toInt()}");

      expect(nameFinder, findsOneWidget);
      expect(airQualityTextFinder, findsOneWidget);
      expect(airQualityValueFinder, findsOneWidget);

      // testing emoji
      expect(
        find.byWidgetPredicate((widget) =>
            widget is SvgPicture && widget.width == 80 && widget.height == 50),
        findsOneWidget,
      );

      // testing units
      expect(
        find.byWidgetPredicate(
          (widget) =>
              widget is SvgPicture &&
              widget.width == 32.45 &&
              widget.height == 15.14 &&
              widget.colorFilter ==
                  ColorFilter.mode(
                    Pollutant.pm2_5.textColor(
                      value: insight.currentPm2_5,
                    ),
                    BlendMode.srcIn,
                  ),
        ),
        findsOneWidget,
      );
    });
    testWidgets('Tests empty insight', (tester) async {
      final key = GlobalKey();
      Insight emptyInsight = Insight(
        forecastPm2_5: null,
        forecastAirQuality: null,
        dateTime: DateTime.now(),
        currentPm2_5: null,
        healthTips: List.generate(
          5,
          (index) => healthTip,
        ),
        currentAirQuality: null,
      );

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
          home: InsightAirQualityWidget(emptyInsight, name: name, key: key),
        ),
      );

      final nameFinder = find.text(name);
      final airQualityTextFinder = find.text(
          AppLocalizations.of(key.currentContext!)!.noAirQualityDataAvailable);
      final airQualityValueFinder = find.text("--");

      expect(nameFinder, findsOneWidget);
      expect(airQualityTextFinder, findsOneWidget);
      expect(airQualityValueFinder, findsOneWidget);
      expect(find.byType(SvgPicture), findsOneWidget);
    });
  });

  testWidgets('Health tip widget', (tester) async {
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
        theme: customTheme(),
        home: HealthTipContainer(healthTip, key: key),
      ),
    );

    final titleFinder = find.text(healthTip.title);
    final descriptionFinder = find.text(healthTip.description);
    expect(titleFinder, findsOneWidget);
    expect(descriptionFinder, findsOneWidget);
    // TODO test for image
  });

  testWidgets('Forecast widget', (tester) async {
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
        home: Scaffold(
          body: ForecastContainer(
            insight,
            key: key,
          ),
        ),
      ),
    );

    final forecastFinder =
        find.text(AppLocalizations.of(key.currentContext!)!.forecast);
    expect(forecastFinder, findsOneWidget);
  });

  group('Insight AirQuality Widget tests', () {
    testWidgets('Test active insight', (tester) async {
      final key = GlobalKey();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InsightsDayReading(
              key: key,
              insight,
              isActive: true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      final weekDayText = insight.dateTime
          .getWeekday(key.currentContext!)
          .characters
          .first
          .toUpperCase();

      final weekDayFinder = find.text(weekDayText);
      expect(weekDayFinder, findsOneWidget);
      expect(
        find.byWidgetPredicate((widget) =>
            widget is SvgPicture && widget.width == 30 && widget.height == 18),
        findsOneWidget,
      );

      expect(tester.widget<InkWell>(find.byType(InkWell)).onTap, isNotNull);
      expect(
        tester.widget<Container>(find.byType(Container)).decoration,
        BoxDecoration(
          color: CustomColors.appColorBlue,
          borderRadius: const BorderRadius.all(
            Radius.circular(25.0),
          ),
        ),
      );
    });
    testWidgets('Test inactive insight', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InsightsDayReading(
              insight,
              isActive: false,
            ),
          ),
        ),
      );

      expect(
        tester.widget<Container>(find.byType(Container)).decoration,
        const BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.all(
            Radius.circular(25.0),
          ),
        ),
      );
    });
  });
}
