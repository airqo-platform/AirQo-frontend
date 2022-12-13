part of 'map_bloc.dart';

abstract class MapEvent extends Equatable {
  const MapEvent();
}

class InitializeMapState extends MapEvent {
  const InitializeMapState();

  @override
  List<Object?> get props => [];
}

class ShowCountryRegions extends MapEvent {
  const ShowCountryRegions(this.country);
  final String country;

  @override
  List<Object?> get props => [country];
}

class ShowRegionSites extends MapEvent {
  const ShowRegionSites(this.region);

  final String region;

  @override
  List<Object?> get props => [region];
}

class ShowSiteReading extends MapEvent {
  const ShowSiteReading(this.airQualityReading);

  final AirQualityReading airQualityReading;

  @override
  List<Object?> get props => [airQualityReading];
}

class InitializeSearch extends MapEvent {
  const InitializeSearch();

  @override
  List<Object?> get props => [];
}

class MapSearchTermChanged extends MapEvent {
  const MapSearchTermChanged({required this.searchTerm});

  final String searchTerm;

  @override
  List<Object?> get props => [searchTerm];
}
