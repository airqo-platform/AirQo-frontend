import 'package:airqo/src/app/dashboard/utils/nearby_coverage_state.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('nearbyCoverageState', () {
    test('shows the loader while the lookup is running', () {
      expect(
        nearbyCoverageState(
            isChecking: true, activeSitesNearby: null, lookupFailed: false),
        NearbyCoverageState.checking,
      );
    });

    test('readings are on their way when active sites exist nearby', () {
      expect(
        nearbyCoverageState(
            isChecking: false, activeSitesNearby: 3, lookupFailed: false),
        NearbyCoverageState.readingsOnTheWay,
      );
    });

    test('stays neutral when the lookup failed', () {
      expect(
        nearbyCoverageState(
            isChecking: false, activeSitesNearby: null, lookupFailed: true),
        NearbyCoverageState.unknown,
      );
    });

    test('says there is no coverage only when the registry confirmed it', () {
      expect(
        nearbyCoverageState(
            isChecking: false, activeSitesNearby: 0, lookupFailed: false),
        NearbyCoverageState.noCoverage,
      );
    });

    test('falls back to no coverage when no lookup has run', () {
      // e.g. no position yet: keeps the pre-existing behaviour.
      expect(
        nearbyCoverageState(
            isChecking: false, activeSitesNearby: null, lookupFailed: false),
        NearbyCoverageState.noCoverage,
      );
    });
  });
}
