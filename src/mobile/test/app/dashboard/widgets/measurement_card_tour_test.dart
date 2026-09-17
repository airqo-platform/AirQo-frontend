import 'package:airqo/src/app/dashboard/widgets/measurement_card_tour.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Near You tour explains and targets the forecast chevron', () {
    final steps = buildMeasurementCardGesturesTourSteps(
      view: MeasurementCardTourView.nearYou,
    );

    expect(steps, hasLength(1));
    expect(
      steps.single.targetKind,
      MeasurementCardTourTargetKind.forecastIcon,
    );
    expect(steps.single.title, 'See the forecast');
    expect(steps.single.subtitle, contains('hourly and daily forecast'));
  });
}
