class SearchPlace {
  SearchPlace({
    required this.id,
    required this.name,
    required this.location,
    required this.latitude,
    required this.longitude,
  });

  factory SearchPlace.fromAutoCompleteAPI(Map<String, dynamic> json) {
    return SearchPlace(
      id: json["place_id"] as String,
      name: json["structured_formatting"]["main_text"] as String,
      location: json["structured_formatting"]["secondary_text"] as String,
      latitude: 0,
      longitude: 0,
    );
  }

  factory SearchPlace.fromPlacesAPI(
    Map<String, dynamic> json,
    SearchPlace searchPlace,
  ) {
    return searchPlace.copyWith(
      latitude: json["geometry"]["location"]["lat"] as double,
      longitude: json["geometry"]["location"]["lng"] as double,
    );
  }

  SearchPlace copyWith({
    double? latitude,
    double? longitude,
  }) {
    return SearchPlace(
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
  final _searchPlacesCache = <String, List<SearchPlace>>{};
  final _searchPlaceCache = <String, SearchPlace>{};

  List<SearchPlace>? getSearchPlaces(String term) => _searchPlacesCache[term];

  void setSearchPlaces(String term, List<SearchPlace> result) =>
      _searchPlacesCache[term] = result;

  SearchPlace? getSearchPlace(String placeId) => _searchPlaceCache[placeId];

  void setSearchPlace(String placeId, SearchPlace result) =>
      _searchPlaceCache[placeId] = result;
}
