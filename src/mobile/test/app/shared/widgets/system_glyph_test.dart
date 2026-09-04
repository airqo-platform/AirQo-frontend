import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('error uses the Aero alert-circle glyph', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(body: SystemGlyph.error(context)),
        ),
      ),
    );

    expect(find.byType(AqAlertCircle), findsOneWidget);
  });

  testWidgets('offline uses the Aero wifi-off glyph', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(body: SystemGlyph.offline(context)),
        ),
      ),
    );

    expect(find.byType(AqWifiOff), findsOneWidget);
  });
}
