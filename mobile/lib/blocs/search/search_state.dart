part of 'search_bloc.dart';

abstract class SearchState extends Equatable {
  const SearchState();

  @override
  List<Object> get props => [];
}

class SearchStateNearestLocations extends SearchState {
  const SearchStateNearestLocations({
    required this.airQualityReadings,
    required this.nearbyLocations,
  });

  final List<AirQualityReading> airQualityReadings;
  final bool nearbyLocations;

  @override
  List<Object> get props => [airQualityReadings];

  @override
  String toString() =>
      'Search page nearest locations: ${airQualityReadings.length}';
}

class SearchStateLocationNotSupported extends SearchState {}

class SearchStateLoading extends SearchState {}

class SearchStateSuccess extends SearchState {
  const SearchStateSuccess(this.items);

  final List<SearchResultItem> items;

  @override
  List<Object> get props => [items];

  @override
  String toString() => 'SearchStateSuccess { items: ${items.length} }';
}

class SearchStateError extends SearchState {
  const SearchStateError(this.error);

  final String error;

  @override
  List<Object> get props => [error];
}
