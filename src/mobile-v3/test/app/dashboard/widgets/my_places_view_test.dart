import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_v3/app/dashboard/widgets/my_places_view.dart';
import 'package:mobile_v3/app/models/place.dart';

// -----------------------------------------------------------------------------
// Additional tests for MyPlacesView widget.
// Testing framework: flutter_test
// -----------------------------------------------------------------------------
void main() {
  group('MyPlacesView Widget Tests', () {
    testWidgets('displays empty state when places list is empty', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: MyPlacesView(
            places: <Place>[],
            onAddPlace: () {},
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('No places found'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('renders a list of Place items when provided', (WidgetTester tester) async {
      final places = <Place>[
        Place(name: 'Park'),
        Place(name: 'Museum'),
      ];
      await tester.pumpWidget(
        MaterialApp(
          home: MyPlacesView(
            places: places,
            onAddPlace: () {},
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(ListTile), findsNWidgets(2));
      expect(find.text('Park'), findsOneWidget);
      expect(find.text('Museum'), findsOneWidget);
    });

    testWidgets('calls onAddPlace callback when add button is tapped', (WidgetTester tester) async {
      var wasCalled = false;
      await tester.pumpWidget(
        MaterialApp(
          home: MyPlacesView(
            places: <Place>[],
            onAddPlace: () {
              wasCalled = true;
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();
      expect(wasCalled, isTrue);
    });

    testWidgets('scrolls through the list of places', (WidgetTester tester) async {
      final places = List<Place>.generate(
        20,
        (i) => Place(name: 'Place ${i + 1}'),
      );
      await tester.pumpWidget(
        MaterialApp(
          home: SizedBox(
            height: 300,
            child: MyPlacesView(
              places: places,
              onAddPlace: () {},
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.fling(find.byType(ListView), const Offset(0, -500), 1000);
      await tester.pumpAndSettle();
      expect(find.text('Place 20'), findsOneWidget);
    });
  });
}