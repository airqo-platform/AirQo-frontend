part of 'search_bloc.dart';

enum SearchError {
  noInternetConnection,
  noAirQualityData,
  none;
}

enum SearchStatus {
  initial,
  loading,
  searchingAirQuality,
  airQualitySearchFailed,
  autoCompleteSearching,
  error,
  autoCompleteSearchSuccess;
}

class SearchState extends Equatable {
  const SearchState._({
    this.featuredAirQuality,
    this.searchAirQuality,
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
    this.searchAirQuality,
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
    List<SearchPlace>? searchResults,
    AirQuality? featuredAirQuality,
    AirQualityReading? searchAirQuality,
    SearchStatus? searchStatus,
    SearchError? searchError,
    bool nullFeaturedAirQuality = false,
    bool nullSearchAirQuality = false,
  }) {
    featuredAirQuality = nullFeaturedAirQuality
        ? null
        : featuredAirQuality ?? this.featuredAirQuality;
    searchAirQuality =
        nullSearchAirQuality ? null : searchAirQuality ?? this.searchAirQuality;

    return SearchState(
      recentSearches: recentSearches ?? this.recentSearches,
      nearbyAirQualityLocations:
          nearbyAirQualityLocations ?? this.nearbyAirQualityLocations,
      otherAirQualityLocations:
          otherAirQualityLocations ?? this.otherAirQualityLocations,
      africanCities: africanCities ?? this.africanCities,
      searchTerm: searchTerm ?? this.searchTerm,
      searchResults: searchResults ?? this.searchResults,
      featuredAirQuality: featuredAirQuality,
      searchAirQuality: searchAirQuality,
      searchStatus: searchStatus ?? this.searchStatus,
      searchError: searchError ?? this.searchError,
    );
  }

  final List<AirQualityReading> recentSearches;
  final List<AirQualityReading> nearbyAirQualityLocations;
  final List<AirQualityReading> otherAirQualityLocations;
  final List<AirQualityReading> africanCities;
  final String searchTerm;
  final List<SearchPlace> searchResults;
  final AirQuality? featuredAirQuality;
  final AirQualityReading? searchAirQuality;
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
        searchAirQuality,
      ];
}
