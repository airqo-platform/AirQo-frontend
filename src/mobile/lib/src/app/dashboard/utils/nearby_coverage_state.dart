/// What Near You should show when no recent readings fall within its radius.
enum NearbyCoverageState {
  /// The site registry lookup is still running.
  checking,

  /// Active sites exist nearby; their fresh readings are on their way.
  readingsOnTheWay,

  /// The lookup failed, so whether sites exist nearby is unknown. Show a
  /// neutral message rather than claiming there are no stations.
  unknown,

  /// The registry confirmed there are no active sites nearby.
  noCoverage,
}

/// Picks the Near You empty state from the coverage lookup.
///
/// [activeSitesNearby] is the registry count of recently active sites, or
/// `null` when it hasn't been fetched. [lookupFailed] is true when the lookup
/// ran but couldn't answer (network error, timeout, missing token).
NearbyCoverageState nearbyCoverageState({
  required bool isChecking,
  required int? activeSitesNearby,
  required bool lookupFailed,
}) {
  if (isChecking) return NearbyCoverageState.checking;
  if ((activeSitesNearby ?? 0) > 0) return NearbyCoverageState.readingsOnTheWay;
  if (lookupFailed) return NearbyCoverageState.unknown;
  return NearbyCoverageState.noCoverage;
}
