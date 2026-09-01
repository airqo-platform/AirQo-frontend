import 'package:airqo/src/app/exposure/utils/exposure_load_status.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('shouldShowExposurePlacesLoader', () {
    test('shows loader while declared places have not loaded', () {
      expect(
        shouldShowExposurePlacesLoader(
          isPlacesInitial: true,
          isDashboardFirstLoad: false,
          hasDeclaredPlaces: false,
        ),
        isTrue,
      );
    });

    test('shows loader while dashboard first-load is in flight and places are empty',
        () {
      expect(
        shouldShowExposurePlacesLoader(
          isPlacesInitial: false,
          isDashboardFirstLoad: true,
          hasDeclaredPlaces: false,
        ),
        isTrue,
      );
    });

    test('hides loader when places exist', () {
      expect(
        shouldShowExposurePlacesLoader(
          isPlacesInitial: true,
          isDashboardFirstLoad: true,
          hasDeclaredPlaces: true,
        ),
        isFalse,
      );
    });

    test('hides loader after places and dashboard have resolved empty', () {
      expect(
        shouldShowExposurePlacesLoader(
          isPlacesInitial: false,
          isDashboardFirstLoad: false,
          hasDeclaredPlaces: false,
        ),
        isFalse,
      );
    });

    test('hides loader when places failed to load', () {
      expect(
        shouldShowExposurePlacesLoader(
          isPlacesInitial: true,
          isDashboardFirstLoad: true,
          hasDeclaredPlaces: false,
          placesLoadFailed: true,
        ),
        isFalse,
      );
    });
  });

  group('resolveExposureTripsContent', () {
    test('shows loader while dashboard first-load is in flight', () {
      expect(
        resolveExposureTripsContent(
          isDashboardFirstLoad: true,
          dashboardLoadFailed: false,
          eligibleSiteCount: 0,
        ),
        ExposureTripsContentStatus.loading,
      );
    });

    test('shows error when dashboard failed', () {
      expect(
        resolveExposureTripsContent(
          isDashboardFirstLoad: false,
          dashboardLoadFailed: true,
          eligibleSiteCount: 0,
        ),
        ExposureTripsContentStatus.error,
      );
    });

    test('shows empty when fewer than two eligible sites', () {
      expect(
        resolveExposureTripsContent(
          isDashboardFirstLoad: false,
          dashboardLoadFailed: false,
          eligibleSiteCount: 1,
        ),
        ExposureTripsContentStatus.empty,
      );
    });

    test('is ready when at least two eligible sites exist', () {
      expect(
        resolveExposureTripsContent(
          isDashboardFirstLoad: false,
          dashboardLoadFailed: false,
          eligibleSiteCount: 2,
        ),
        ExposureTripsContentStatus.ready,
      );
    });
  });
}
