import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:app_repository/app_repository.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

part 'map_event.dart';
part 'map_state.dart';

class MapBloc extends Bloc<MapEvent, MapState> {
  MapBloc() : super(const MapState.initial()) {
    on<InitializeMapState>(_onInitializeMapState);
    on<ShowCountryRegions>(_onShowCountryRegions);
    on<ShowRegionSites>(_onShowRegionSites);
    on<ShowSiteReading>(_onShowSiteReading);
    on<InitializeSearch>(_onInitializeSearch);
    on<MapSearchTermChanged>(_onMapSearchTermChanged);
    searchRepository = SearchRepository(searchApiKey: Config.searchApiKey);
  }

  late final SearchRepository searchRepository;

  void _onInitializeMapState(
    InitializeMapState _,
    Emitter<MapState> emit,
  ) {
    final airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();
    final List<String> countries =
        airQualityReadings.map((e) => e.country.toTitleCase()).toSet().toList();

    countries.removeWhere((element) => element.isEmpty);
    airQualityReadings.sortByAirQuality();

    return emit(const MapState.initial().copyWith(
      airQualityReadings: airQualityReadings,
      countries: countries,
      mapStatus: MapStatus.showingCountries,
      featuredAirQualityReadings: airQualityReadings,
    ));
  }

  void _onShowCountryRegions(
    ShowCountryRegions event,
    Emitter<MapState> emit,
  ) {
    final List<String> regions = state.airQualityReadings
        .where((e) => e.country.equalsIgnoreCase(event.country))
        .toList()
        .map((e) => e.region.toTitleCase())
        .toSet()
        .toList();

    regions.removeWhere((element) => element.isEmpty);

    final airQualityReadings = state.airQualityReadings
        .where((e) => e.country.equalsIgnoreCase(event.country))
        .toList();
    airQualityReadings.sortByAirQuality();

    return emit(state.copyWith(
      regions: regions,
      featuredCountry: event.country.toTitleCase(),
      mapStatus: MapStatus.showingRegions,
      featuredAirQualityReadings: airQualityReadings,
    ));
  }

  void _onShowRegionSites(
    ShowRegionSites event,
    Emitter<MapState> emit,
  ) {
    final List<AirQualityReading> airQualityReadings = state.airQualityReadings
        .where((e) =>
            e.country.equalsIgnoreCase(state.featuredCountry) &&
            e.region.equalsIgnoreCase(event.region))
        .toList();
    airQualityReadings.sortByAirQuality();

    return emit(state.copyWith(
      featuredAirQualityReadings: airQualityReadings,
      featuredRegion: event.region.toTitleCase(),
      mapStatus: MapStatus.showingRegionSites,
    ));
  }

  void _onShowSiteReading(
    ShowSiteReading event,
    Emitter<MapState> emit,
  ) {
    final AirQualityReading site = state.airQualityReadings.firstWhere(
        (e) => e.placeId.equalsIgnoreCase(event.airQualityReading.placeId));

    return emit(state.copyWith(
      featuredSiteReading: site,
      mapStatus: MapStatus.showingFeaturedSite,
    ));
  }

  void _onInitializeSearch(
    InitializeSearch _,
    Emitter<MapState> emit,
  ) {
    var airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
            .values
            .toList();

    airQualityReadings = airQualityReadings.isEmpty
        ? state.airQualityReadings
        : airQualityReadings;
    airQualityReadings.sortByAirQuality();

    return emit(state.copyWith(
      featuredAirQualityReadings: airQualityReadings,
      mapStatus: MapStatus.searching,
    ));
  }

  void _onMapSearchTermChanged(
    MapSearchTermChanged event,
    Emitter<MapState> emit,
  ) async {
    final searchTerm = event.searchTerm;

    if (searchTerm.isEmpty) {
      var nearestAirQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
              .values
              .toList();

      if (nearestAirQualityReadings.isEmpty) {
        nearestAirQualityReadings =
            Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
                .values
                .toList();
      }

      return emit(
        SearchSitesState(airQualityReadings: nearestAirQualityReadings),
      );
    }

    emit(MapLoadingState());

    try {
      final results = await searchRepository.search(searchTerm);

      return emit(MapSearchCompleteState(searchResults: results.items));
    } catch (error) {
      final airQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
              .values
              .toList();

      final airQualitySearch = airQualityReadings.where((airQualityReading) {
        return airQualityReading.name.contains(searchTerm) ||
            airQualityReading.location.contains(searchTerm);
      }).toList();

      return emit(
        SearchSitesState(airQualityReadings: airQualitySearch),
      );
    }
  }
}
