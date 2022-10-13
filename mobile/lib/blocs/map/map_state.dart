part of 'map_bloc.dart';

abstract class MapState extends Equatable {
  const MapState();
}

class AllSitesState extends MapState {
  const AllSitesState({required this.airQualityReadings});

  final List<AirQualityReading> airQualityReadings;
  @override
  List<Object?> get props => [];
}

class MapLoadingState extends MapState {
  @override
  List<Object?> get props => [];
}

class MapSearchCompleteState extends MapState {
  const MapSearchCompleteState({
    required this.searchResults,
  });

  final List<SearchResultItem> searchResults;

  @override
  List<Object?> get props => [];
}

class RegionSitesState extends MapState {
  const RegionSitesState({
    required this.airQualityReadings,
    required this.region,
  });

  final List<AirQualityReading> airQualityReadings;
  final String region;

  @override
  List<Object?> get props => [];
}

class SingleSiteState extends MapState {
  const SingleSiteState({required this.airQualityReading});

  final AirQualityReading airQualityReading;
  @override
  List<Object?> get props => [];
}

class SearchSitesState extends MapState {
  const SearchSitesState({required this.airQualityReadings});

  final List<AirQualityReading> airQualityReadings;
  @override
  List<Object?> get props => [];
}

class NoAirQualityState extends MapState {
  const NoAirQualityState({required this.message});

  final String message;
  @override
  List<Object?> get props => [];
}
