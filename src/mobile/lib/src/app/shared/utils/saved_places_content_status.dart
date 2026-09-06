enum SavedPlacesContentStatus { loading, error, empty, ready }

/// Favorites and Exposure My Places: failed fetch is not "add a place".
SavedPlacesContentStatus resolveSavedPlacesContent({
  required bool isLoading,
  required bool loadFailed,
  required bool hasPlaces,
}) {
  if (loadFailed) return SavedPlacesContentStatus.error;
  if (isLoading) return SavedPlacesContentStatus.loading;
  if (!hasPlaces) return SavedPlacesContentStatus.empty;
  return SavedPlacesContentStatus.ready;
}
