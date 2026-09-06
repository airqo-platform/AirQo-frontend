import 'package:airqo/src/app/shared/utils/saved_places_content_status.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('resolveSavedPlacesContent', () {
    test('failed fetch is an error, not an empty onboarding state', () {
      expect(
        resolveSavedPlacesContent(
          isLoading: false,
          loadFailed: true,
          hasPlaces: false,
        ),
        SavedPlacesContentStatus.error,
      );
    });

    test('failed fetch is an error even if previous places exist', () {
      expect(
        resolveSavedPlacesContent(
          isLoading: false,
          loadFailed: true,
          hasPlaces: true,
        ),
        SavedPlacesContentStatus.error,
      );
    });

    test('no saved places after a successful load is empty', () {
      expect(
        resolveSavedPlacesContent(
          isLoading: false,
          loadFailed: false,
          hasPlaces: false,
        ),
        SavedPlacesContentStatus.empty,
      );
    });

    test('shows loader while fetching', () {
      expect(
        resolveSavedPlacesContent(
          isLoading: true,
          loadFailed: false,
          hasPlaces: false,
        ),
        SavedPlacesContentStatus.loading,
      );
    });

    test('shows places when load succeeded with data', () {
      expect(
        resolveSavedPlacesContent(
          isLoading: false,
          loadFailed: false,
          hasPlaces: true,
        ),
        SavedPlacesContentStatus.ready,
      );
    });
  });
}
