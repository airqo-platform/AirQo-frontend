part of 'search_bloc.dart';

enum SearchError {
  noInternetConnection(
    message: 'Check your internet connection',
    snackBarDuration: 5,
  ),
  searchFailed(
    message: 'Check your internet connection',
    snackBarDuration: 5,
  ),
  none(
    message: '',
    snackBarDuration: 0,
  );

  const SearchError({
    required this.message,
    required this.snackBarDuration,
  });

  final String message;
  final int snackBarDuration;

  @override
  String toString() => message;
}

enum SearchStatus {
  initial,
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
    this.blocStatus = SearchStatus.initial,
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
    this.blocStatus = SearchStatus.initial,
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
    SearchStatus? blocStatus,
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
      blocStatus: blocStatus ?? this.blocStatus,
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
  final SearchStatus blocStatus;
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
        blocStatus,
      ];
}
