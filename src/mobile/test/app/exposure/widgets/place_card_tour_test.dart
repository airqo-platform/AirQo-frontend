import 'package:airqo/src/app/exposure/widgets/place_card_tour.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('the spotlight follows the card after the reading loads',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(390, 844));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    final keys = PlaceCardTourKeys();
    var readingLoaded = false;

    Widget build() {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Stack(
          children: [
            Align(
              alignment: Alignment.topCenter,
              child: SizedBox(
                key: keys.cardKey,
                width: 360,
                height: readingLoaded ? 260 : 96,
                child: Align(
                  alignment: Alignment.bottomRight,
                  child: SizedBox(
                    key: keys.chevronKey,
                    width: 24,
                    height: 24,
                  ),
                ),
              ),
            ),
            PlaceCardTour(tourKeys: keys, onDismiss: () {}),
          ],
        ),
      );
    }

    await tester.pumpWidget(build());
    final before = await _bubbleTop(tester);

    readingLoaded = true;
    await tester.pumpWidget(build());
    final after = await _bubbleTop(tester);

    expect(after, greaterThan(before + 100));
  });
}

Future<double> _bubbleTop(WidgetTester tester) async {
  final bubble = find.text('Tap a card');
  for (var i = 0; i < 12; i++) {
    await tester.pump(const Duration(milliseconds: 50));
    if (bubble.evaluate().isNotEmpty) break;
  }
  expect(bubble, findsOneWidget);
  final positioned = tester.widget<Positioned>(
    find
        .ancestor(
          of: bubble,
          matching: find.byType(Positioned),
        )
        .first,
  );
  return positioned.top!;
}
