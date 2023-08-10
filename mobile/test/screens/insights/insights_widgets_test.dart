import 'package:app/models/models.dart';
import 'package:app/screens/insights/insights_widgets.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
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
      pm2_5: 5,
      healthTips: List.generate(
        5,
        (index) => healthTip,
      ),
      airQuality: Pollutant.pm2_5.airQuality(5),
      forecastPm2_5: null,
      forecastAirQuality: null,
    );
    name = "Makerere";
  });

  group('Insight AirQuality Widget tests', () {
    testWidgets('Tests none empty insight', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: InsightAirQualityWidget(insight, name: name),
        ),
      );

      final nameFinder = find.text(name);
      final airQualityTextFinder = find.text('${insight.airQuality?.title}');
      final airQualityValueFinder = find.text("${insight.pm2_5?.toInt()}");

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
                      value: insight.pm2_5,
                    ),
                    BlendMode.srcIn,
                  ),
        ),
        findsOneWidget,
      );
    });
    testWidgets('Tests empty insight', (tester) async {
      Insight emptyInsight = Insight(
        forecastPm2_5: null,
        forecastAirQuality: null,
        dateTime: DateTime.now(),
        pm2_5: null,
        healthTips: List.generate(
          5,
          (index) => healthTip,
        ),
        airQuality: null,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: InsightAirQualityWidget(emptyInsight, name: name),
        ),
      );

      final nameFinder = find.text(name);
      final airQualityTextFinder = find.text('No air quality data available');
      final airQualityValueFinder = find.text("--");

      expect(nameFinder, findsOneWidget);
      expect(airQualityTextFinder, findsOneWidget);
      expect(airQualityValueFinder, findsOneWidget);
      expect(find.byType(SvgPicture), findsOneWidget);
    });
  });

  testWidgets('Health tip widget', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en'),
          Locale('fr'),
        ],
        theme: customTheme(),
        home: HealthTipContainer(healthTip),
      ),
    );

    final titleFinder = find.text(healthTip.title);
    final descriptionFinder = find.text(healthTip.description);
    expect(titleFinder, findsOneWidget);
    expect(descriptionFinder, findsOneWidget);
    // TODO test for image
  });

  testWidgets('Forecast widget', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ForecastContainer(insight, "Makerere"),
        ),
      ),
    );

    final titleFinder = find.text('Forecast');
    expect(titleFinder, findsOneWidget);
  });

  group('Insight AirQuality Widget tests', () {
    testWidgets('Test active insight', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InsightsDayReading(
              insight,
              isActive: true,
            ),
          ),
        ),
      );

      final weekDayFinder = find
          .text(insight.dateTime.getWeekday().characters.first.toUpperCase());
      final weekDateFinder = find.text('${insight.dateTime.day}');

      expect(weekDayFinder, findsOneWidget);
      expect(weekDateFinder, findsOneWidget);
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
          ));
    });
    testWidgets('Test inactive insight', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
            home: Scaffold(
          body: InsightsDayReading(
            insight,
            isActive: false,
          ),
        )),
      );

      expect(
          tester.widget<Container>(find.byType(Container)).decoration,
          const BoxDecoration(
            color: Colors.transparent,
            borderRadius: BorderRadius.all(
              Radius.circular(25.0),
            ),
          ));
    });
  });
}
