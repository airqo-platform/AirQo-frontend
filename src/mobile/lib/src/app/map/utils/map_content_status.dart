enum MapContentStatus { loading, error, empty, ready }

/// Distinguishes in-flight fetch, fetch failure, empty success, and data.
MapContentStatus resolveMapContent({
  required bool isInitializing,
  required bool hasLoadError,
  required bool hasMeasurements,
}) {
  if (hasLoadError) {
    return MapContentStatus.error;
  }
  if (isInitializing && !hasMeasurements) {
    return MapContentStatus.loading;
  }
  if (!hasMeasurements) {
    return MapContentStatus.empty;
  }
  return MapContentStatus.ready;
}
