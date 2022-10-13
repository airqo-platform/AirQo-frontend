part of 'map_bloc.dart';

abstract class MapEvent extends Equatable {
  const MapEvent();
}

class ShowRegionSites extends MapEvent {
  const ShowRegionSites({required this.region});

  final String region;

  @override
  List<Object?> get props => ['show region sites'];

  @override
  String toString() => 'show region sites';
}

class ShowCountrySites extends MapEvent {
  const ShowCountrySites({required this.country});

  final String country;

  @override
  List<Object?> get props => ['show country sites'];

  @override
  String toString() => 'show region sites';
}

class ShowAllSites extends MapEvent {
  const ShowAllSites();

  @override
  List<Object?> get props => ['show all sites'];
}

class ShowSite extends MapEvent {
  const ShowSite({required this.airQualityReading});

  final AirQualityReading airQualityReading;

  @override
  List<Object?> get props => ['show site'];
}

class SearchSite extends MapEvent {
  const SearchSite();

  @override
  List<Object?> get props => ['search site'];
}

class MapSearchReset extends MapEvent {
  const MapSearchReset();

  @override
  List<Object?> get props => ['search site'];
}

class MapSearchTermChanged extends MapEvent {
  const MapSearchTermChanged({required this.searchTerm});

  final String searchTerm;

  @override
  List<Object?> get props => ['search site'];
}
