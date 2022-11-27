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
  });

  const MapState.initial() : this._();

  MapState copyWith(
      {MapStatus? mapStatus,
      List<String>? countries,
      List<String>? regions,
      List<AirQualityReading>? featuredAirQualityReadings,
      AirQualityReading? featuredSiteReading,
      String? featuredRegion,
      String? featuredCountry,
      List<AirQualityReading>? airQualityReadings}) {
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

  @override
  List<Object?> get props => [
        featuredSiteReading,
        featuredAirQualityReadings,
        regions,
        countries,
        mapStatus,
        airQualityReadings,
      ];
}
