part of 'map_bloc.dart';

enum MapStatus {
  initial,
  error,
  noAirQuality,
  showingCountries,
  showingRegions,
  showingFeaturedSite,
  showingRegionSites,
  searching,
}

enum MapSearchStatus {
  initial,
  error,
}

class MapState extends Equatable {
  const MapState._({
    this.countries = const [],
    this.regions = const [],
    this.featuredAirQualityReadings = const [],
    this.airQualityReadings = const [],
    this.featuredSiteReading,
    this.mapStatus = MapStatus.initial,
    this.featuredRegion = '',
    this.featuredCountry = '',
    this.searchResults = const [],
  });

  const MapState({
    this.countries = const [],
    this.regions = const [],
    this.featuredAirQualityReadings = const [],
    this.airQualityReadings = const [],
    this.featuredSiteReading,
    this.mapStatus = MapStatus.initial,
    this.featuredRegion = '',
    this.featuredCountry = '',
    this.searchResults = const [],
  });

  const MapState.initial() : this._();

  MapState copyWith({
    MapStatus? mapStatus,
    List<String>? countries,
    List<String>? regions,
    List<AirQualityReading>? featuredAirQualityReadings,
    AirQualityReading? featuredSiteReading,
    String? featuredRegion,
    String? featuredCountry,
    List<AirQualityReading>? airQualityReadings,
    List<SearchResultItem>? searchResults,
  }) {
    return MapState(
      featuredSiteReading: featuredSiteReading ?? this.featuredSiteReading,
      featuredAirQualityReadings:
          featuredAirQualityReadings ?? this.featuredAirQualityReadings,
      mapStatus: mapStatus ?? this.mapStatus,
      featuredRegion: featuredRegion ?? this.featuredRegion,
      regions: regions ?? this.regions,
      featuredCountry: featuredCountry ?? this.featuredCountry,
      countries: countries ?? this.countries,
      airQualityReadings: airQualityReadings ?? this.airQualityReadings,
      searchResults: searchResults ?? this.searchResults,
    );
  }

  final MapStatus mapStatus;
  final List<String> countries;
  final List<String> regions;
  final List<AirQualityReading> featuredAirQualityReadings;
  final String featuredCountry;
  final String featuredRegion;
  final AirQualityReading? featuredSiteReading;
  final List<AirQualityReading> airQualityReadings;
  final List<SearchResultItem> searchResults;

  @override
  List<Object?> get props => [
        featuredSiteReading,
        featuredAirQualityReadings,
        regions,
        countries,
        mapStatus,
        airQualityReadings,
        searchResults,
      ];
}

class MapSearchState extends Equatable {
  const MapSearchState._({
    this.airQualityReadings = const [],
    this.mapStatus = MapSearchStatus.initial,
    this.searchResults = const [],
    this.searchTerm = '',
  });

  const MapSearchState({
    this.airQualityReadings = const [],
    this.mapStatus = MapSearchStatus.initial,
    this.searchResults = const [],
    this.searchTerm = '',
  });

  const MapSearchState.initial() : this._();

  MapSearchState copyWith({
    MapSearchStatus? mapStatus,
    List<AirQualityReading>? airQualityReadings,
    List<SearchResultItem>? searchResults,
    String? searchTerm,
  }) {
    return MapSearchState(
      mapStatus: mapStatus ?? this.mapStatus,
      airQualityReadings: airQualityReadings ?? this.airQualityReadings,
      searchResults: searchResults ?? this.searchResults,
      searchTerm: searchTerm ?? this.searchTerm,
    );
  }

  final MapSearchStatus mapStatus;
  final List<AirQualityReading> airQualityReadings;
  final List<SearchResultItem> searchResults;
  final String searchTerm;

  @override
  List<Object?> get props => [
        mapStatus,
        airQualityReadings,
        searchResults,
        searchTerm,
      ];
}
