part of 'search_bloc.dart';

enum SearchError {
  noInternetConnection,
  noAirQualityData,
  none;
}

enum SearchStatus {
  initial,
  loading,
  searching,
  error,
  searchSuccess;
}

class SearchState extends Equatable {
  const SearchState._({
    this.featuredAirQuality,
    this.recentSearches = const [],
    this.nearbyAirQualityLocations = const [],
    this.otherAirQualityLocations = const [],
    this.africanCities = const [],
    this.searchResults = const [],
    this.searchTerm = '',
    this.searchStatus = SearchStatus.initial,
    this.searchError = SearchError.none,
  });

  const SearchState({
    this.featuredAirQuality,
    this.recentSearches = const [],
    this.nearbyAirQualityLocations = const [],
    this.otherAirQualityLocations = const [],
    this.africanCities = const [],
    this.searchResults = const [],
    this.searchTerm = '',
    this.searchStatus = SearchStatus.initial,
    this.searchError = SearchError.none,
  });

  const SearchState.initial() : this._();

  SearchState copyWith({
    List<AirQualityReading>? recentSearches,
    List<AirQualityReading>? nearbyAirQualityLocations,
    List<AirQualityReading>? otherAirQualityLocations,
    List<AirQualityReading>? africanCities,
    String? searchTerm,
    List<SearchResultItem>? searchResults,
    AirQuality? featuredAirQuality,
    SearchStatus? searchStatus,
    SearchError? searchError,
  }) {
    return SearchState(
      recentSearches: recentSearches ?? this.recentSearches,
      nearbyAirQualityLocations:
          nearbyAirQualityLocations ?? this.nearbyAirQualityLocations,
      otherAirQualityLocations:
          otherAirQualityLocations ?? this.otherAirQualityLocations,
      africanCities: africanCities ?? this.africanCities,
      searchTerm: searchTerm ?? this.searchTerm,
      searchResults: searchResults ?? this.searchResults,
      featuredAirQuality: featuredAirQuality ?? this.featuredAirQuality,
      searchStatus: searchStatus ?? this.searchStatus,
      searchError: searchError ?? this.searchError,
    );
  }

  final List<AirQualityReading> recentSearches;
  final List<AirQualityReading> nearbyAirQualityLocations;
  final List<AirQualityReading> otherAirQualityLocations;
  final List<AirQualityReading> africanCities;
  final String searchTerm;
  final List<SearchResultItem> searchResults;
  final AirQuality? featuredAirQuality;
  final SearchStatus searchStatus;
  final SearchError searchError;

  @override
  List<Object?> get props => [
        recentSearches,
        nearbyAirQualityLocations,
        otherAirQualityLocations,
        africanCities,
        searchTerm,
        searchResults,
        featuredAirQuality,
        searchError,
        searchStatus,
      ];
}
