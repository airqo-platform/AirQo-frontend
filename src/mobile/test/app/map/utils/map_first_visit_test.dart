import 'package:airqo/src/app/map/utils/map_first_visit.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('a pending monitor keeps the default camera from moving first', () {
    expect(
      MapFirstVisit.shouldUseDefaultCamera(
        hasPendingMonitor: true,
        tabVisible: true,
      ),
      isFalse,
    );
    expect(
      MapFirstVisit.shouldUseDefaultCamera(
        hasPendingMonitor: false,
        tabVisible: false,
      ),
      isFalse,
    );
    expect(
      MapFirstVisit.shouldUseDefaultCamera(
        hasPendingMonitor: false,
        tabVisible: true,
      ),
      isTrue,
    );
  });

  test('the first See on map zoom waits until the map tab is showing', () {
    expect(
      MapFirstVisit.shouldMoveToPendingMonitor(
        hasPendingMonitor: true,
        tabVisible: false,
        cameraReady: true,
        focusAlreadyQueued: false,
      ),
      isFalse,
    );
    expect(
      MapFirstVisit.shouldMoveToPendingMonitor(
        hasPendingMonitor: true,
        tabVisible: true,
        cameraReady: false,
        focusAlreadyQueued: false,
      ),
      isFalse,
    );
    expect(
      MapFirstVisit.shouldMoveToPendingMonitor(
        hasPendingMonitor: true,
        tabVisible: true,
        cameraReady: true,
        focusAlreadyQueued: true,
      ),
      isFalse,
    );
    expect(
      MapFirstVisit.shouldMoveToPendingMonitor(
        hasPendingMonitor: true,
        tabVisible: true,
        cameraReady: true,
        focusAlreadyQueued: false,
      ),
      isTrue,
    );
  });

  test('the controls tour waits until the monitor zoom has finished', () {
    expect(
      MapFirstVisit.shouldShowControlsTour(
        tourAlreadyShowing: false,
        locationResolved: true,
        tabVisible: true,
        hasPendingMonitor: true,
      ),
      isFalse,
    );
    expect(
      MapFirstVisit.shouldShowControlsTour(
        tourAlreadyShowing: false,
        locationResolved: true,
        tabVisible: false,
        hasPendingMonitor: false,
      ),
      isFalse,
    );
    expect(
      MapFirstVisit.shouldShowControlsTour(
        tourAlreadyShowing: false,
        locationResolved: false,
        tabVisible: true,
        hasPendingMonitor: false,
      ),
      isFalse,
    );
    expect(
      MapFirstVisit.shouldShowControlsTour(
        tourAlreadyShowing: false,
        locationResolved: true,
        tabVisible: true,
        hasPendingMonitor: false,
      ),
      isTrue,
    );
  });
}
