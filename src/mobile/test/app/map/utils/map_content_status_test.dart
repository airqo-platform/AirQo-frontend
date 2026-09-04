import 'package:airqo/src/app/map/utils/map_content_status.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('resolveMapContent', () {
    test('stays loading while initializing with no measurements', () {
      expect(
        resolveMapContent(
          isInitializing: true,
          hasLoadError: false,
          hasMeasurements: false,
        ),
        MapContentStatus.loading,
      );
    });

    test('treats empty success as empty, not loading or error', () {
      expect(
        resolveMapContent(
          isInitializing: false,
          hasLoadError: false,
          hasMeasurements: false,
        ),
        MapContentStatus.empty,
      );
    });

    test('shows error only when the fetch failed', () {
      expect(
        resolveMapContent(
          isInitializing: false,
          hasLoadError: true,
          hasMeasurements: false,
        ),
        MapContentStatus.error,
      );
    });

    test('failed fetch is an error even if previous measurements exist', () {
      expect(
        resolveMapContent(
          isInitializing: false,
          hasLoadError: true,
          hasMeasurements: true,
        ),
        MapContentStatus.error,
      );
    });

    test('shows ready when measurements exist', () {
      expect(
        resolveMapContent(
          isInitializing: false,
          hasLoadError: false,
          hasMeasurements: true,
        ),
        MapContentStatus.ready,
      );
    });
  });
}
