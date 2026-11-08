/// What Near You should show when no recent readings fall within its radius.
enum NearbyCoverageState {
  /// The site registry lookup is still running.
  checking,

  /// Active sites exist nearby; their fresh readings are on their way.
  readingsOnTheWay,

  /// The lookup failed or hasn't run, so whether sites exist nearby is
  /// unknown. Show a neutral message rather than claiming there are no
  /// stations.
  unknown,

  /// The registry confirmed there are no active sites nearby.
  noCoverage,
}

/// Picks the Near You empty state from the coverage lookup.
///
/// [activeSitesNearby] is the registry count of recently active sites, or
/// `null` when it hasn't been fetched. [lookupFailed] is true when the lookup
/// ran but couldn't answer (network error, timeout, missing token).
///
/// "No stations nearby" is only shown when the registry confirmed a count of
/// zero; a missing count is never treated as no coverage.
NearbyCoverageState nearbyCoverageState({
  required bool isChecking,
  required int? activeSitesNearby,
  required bool lookupFailed,
}) {
  if (isChecking) return NearbyCoverageState.checking;
  if (lookupFailed || activeSitesNearby == null) {
    return NearbyCoverageState.unknown;
  }
  if (activeSitesNearby > 0) return NearbyCoverageState.readingsOnTheWay;
  return NearbyCoverageState.noCoverage;
}
