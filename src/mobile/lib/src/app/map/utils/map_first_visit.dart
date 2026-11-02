/// When the map tab may move the camera or start the controls tour.
///
/// The map stays alive in an [IndexedStack]. A camera update issued while the
/// tab is offstage is ignored, and a pending "See on map" focus has to win
/// over the default snap-to-user or fit-all-markers move.
class MapFirstVisit {
  const MapFirstVisit._();

  /// The default camera (snap to the user, or fit every monitor) may run.
  static bool shouldUseDefaultCamera({
    required bool hasPendingMonitor,
    required bool tabVisible,
  }) {
    return !hasPendingMonitor && tabVisible;
  }

  /// A queued "See on map" zoom may be applied on the next frame.
  static bool shouldMoveToPendingMonitor({
    required bool hasPendingMonitor,
    required bool tabVisible,
    required bool cameraReady,
    required bool focusAlreadyQueued,
  }) {
    return hasPendingMonitor &&
        tabVisible &&
        cameraReady &&
        !focusAlreadyQueued;
  }

  /// The controls tour waits until the tab is on screen and any monitor zoom
  /// has finished. Opening the map with no monitor still shows it once.
  static bool shouldShowControlsTour({
    required bool tourAlreadyShowing,
    required bool locationResolved,
    required bool tabVisible,
    required bool hasPendingMonitor,
  }) {
    return !tourAlreadyShowing &&
        locationResolved &&
        tabVisible &&
        !hasPendingMonitor;
  }
}
