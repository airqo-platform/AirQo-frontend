part of 'search_bloc.dart';

enum SearchStatus {
  initial,
  noAirQualityData,
  noInternetConnection,
  autoCompleting,
  autoCompleteFinished,
  searchComplete,
}

class SearchState extends Equatable {
  const SearchState({
    this.searchAirQuality,
    this.searchResults = const [],
    this.searchTerm = '',
    this.status = SearchStatus.initial,
    this.recommendations = const [],
    this.countries = const [],
    this.searchHistory = const [],
  });

  SearchState copyWith({
    String? searchTerm,
    List<SearchResult>? searchResults,
    AirQuality? featuredAirQuality,
    AirQualityReading? searchAirQuality,
    SearchStatus? status,
    List<AirQualityReading>? recommendations,
    List<AirQualityReading>? searchHistory,
    List<String>? countries,
  }) {
    return SearchState(
      searchTerm: searchTerm ?? this.searchTerm,
      searchResults: searchResults ?? this.searchResults,
      searchAirQuality: searchAirQuality ?? this.searchAirQuality,
      status: status ?? this.status,
      recommendations: recommendations ?? this.recommendations,
      countries: countries ?? this.countries,
      searchHistory: searchHistory ?? this.searchHistory,
    );
  }

  final String searchTerm;
  final List<SearchResult> searchResults;
  final List<AirQualityReading> searchHistory;
  final List<AirQualityReading> recommendations;
  final List<String> countries;
  final AirQualityReading? searchAirQuality;
  final SearchStatus status;

  @override
  List<Object?> get props => [
        searchTerm,
        searchResults,
        searchHistory,
        recommendations,
        countries,
        status,
        searchAirQuality,
      ];
}

enum SearchFilterStatus {
  initial,
  loading,
  noInternetConnection,
  noAirQualityData,
  filterSuccessful,
  filterFailed,
}

class SearchFilterState extends Equatable {
  const SearchFilterState({
    this.recentSearches = const [],
    this.nearbyLocations = const [],
    this.otherLocations = const [],
    this.africanCities = const [],
    this.filteredAirQuality,
    this.status = SearchFilterStatus.initial,
  });

  SearchFilterState copyWith({
    List<AirQualityReading>? recentSearches,
    List<AirQualityReading>? nearbyLocations,
    List<AirQualityReading>? otherLocations,
    List<AirQualityReading>? africanCities,
    AirQuality? filteredAirQuality,
    SearchFilterStatus? status,
  }) {
    return SearchFilterState(
      recentSearches: recentSearches ?? this.recentSearches,
      nearbyLocations: nearbyLocations ?? this.nearbyLocations,
      otherLocations: otherLocations ?? this.otherLocations,
      africanCities: africanCities ?? this.africanCities,
      filteredAirQuality: filteredAirQuality ?? this.filteredAirQuality,
      status: status ?? this.status,
    );
  }

  final List<AirQualityReading> recentSearches;
  final List<AirQualityReading> nearbyLocations;
  final List<AirQualityReading> otherLocations;
  final List<AirQualityReading> africanCities;
  final SearchFilterStatus status;
  final AirQuality? filteredAirQuality;

  @override
  List<Object?> get props => [
        recentSearches,
        nearbyLocations,
        otherLocations,
        africanCities,
        status,
        filteredAirQuality,
      ];
}

enum SearchPageState {
  searching,
  filtering;
}
