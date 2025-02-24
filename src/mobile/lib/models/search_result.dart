class SearchResult {
  SearchResult({
    required this.id,
    required this.name,
    required this.location,
    required this.latitude,
    required this.longitude,
  });

  factory SearchResult.fromAutoCompleteAPI(Map<String, dynamic> json) {
    return SearchResult(
      id: json["place_id"] as String,
      name: json["structured_formatting"]["main_text"] as String,
      location: json["structured_formatting"]["secondary_text"] as String,
      latitude: 0,
      longitude: 0,
    );
  }

  factory SearchResult.fromPlacesAPI(
    Map<String, dynamic> json,
    SearchResult searchResult,
  ) {
    return searchResult.copyWith(
      latitude: json["geometry"]["location"]["lat"] as double,
      longitude: json["geometry"]["location"]["lng"] as double,
    );
  }

  SearchResult copyWith({
    double? latitude,
    double? longitude,
  }) {
    return SearchResult(
      id: id,
      name: name,
      location: location,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
    );
  }

  final String id;
  final String name;
  final String location;
  final double latitude;
  final double longitude;
}

class SearchCache {
  final _searchResultsCache = <String, List<SearchResult>>{};
  final _searchResultCache = <String, SearchResult>{};

  List<SearchResult>? getSearchResults(String term) =>
      _searchResultsCache[term];

  void setSearchResults(String term, List<SearchResult> result) =>
      _searchResultsCache[term] = result;

  SearchResult? getSearchResult(String placeId) => _searchResultCache[placeId];

  void setSearchResult(String placeId, SearchResult result) =>
      _searchResultCache[placeId] = result;
}
