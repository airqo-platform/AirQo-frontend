/// True while declared places (or the favorites used to decide empty) are
/// still resolving, so My Places does not flash a blank list.
bool shouldShowExposurePlacesLoader({
  required bool isPlacesInitial,
  required bool isDashboardFirstLoad,
  required bool hasDeclaredPlaces,
  bool placesLoadFailed = false,
}) {
  if (hasDeclaredPlaces || placesLoadFailed) return false;
  if (isPlacesInitial) return true;
  return isDashboardFirstLoad;
}

enum ExposureTripsContentStatus { loading, error, empty, ready }

ExposureTripsContentStatus resolveExposureTripsContent({
  required bool isDashboardFirstLoad,
  required bool dashboardLoadFailed,
  required int eligibleSiteCount,
}) {
  if (isDashboardFirstLoad) return ExposureTripsContentStatus.loading;
  if (dashboardLoadFailed) return ExposureTripsContentStatus.error;
  if (eligibleSiteCount < 2) return ExposureTripsContentStatus.empty;
  return ExposureTripsContentStatus.ready;
}
