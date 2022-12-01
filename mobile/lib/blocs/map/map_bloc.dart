import 'dart:async';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app_repository/app_repository.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

part 'map_event.dart';
part 'map_state.dart';

class MapBloc extends Bloc<MapEvent, MapState> {
  MapBloc() : super(const AllSitesState(airQualityReadings: [])) {
    on<ShowRegionSites>(_onShowRegionSites);
    on<ShowAllSites>(_onShowAllSites);
    on<ShowSite>(_showSite);
    on<SearchSite>(_searchSite);
    on<MapSearchReset>(_onMapSearchReset);
    on<MapSearchTermChanged>(_onMapSearchTermChanged);
    searchRepository = SearchRepository(searchApiKey: Config.searchApiKey);
  }

  late final SearchRepository searchRepository;

  Future<void> _onShowAllSites(
    ShowAllSites _,
    Emitter<MapState> emit,
  ) async {
    final airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();

    return emit(AllSitesState(airQualityReadings: airQualityReadings));
  }

  Future<void> _onShowRegionSites(
    ShowRegionSites event,
    Emitter<MapState> emit,
  ) async {
    final airQualityReadings = Hive.box<AirQualityReading>(
      HiveBox.airQualityReadings,
    )
        .values
        .where((airQualityReading) => airQualityReading.region == event.region)
        .toList();

    return emit(RegionSitesState(
      airQualityReadings: airQualityReadings,
      region: event.region,
    ));
  }

  Future<void> _showSite(
    ShowSite event,
    Emitter<MapState> emit,
  ) async {
    return emit(SingleSiteState(airQualityReading: event.airQualityReading));
  }

  Future<void> _searchSite(
    SearchSite _,
    Emitter<MapState> emit,
  ) async {
    final airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();

    return emit(SearchSitesState(airQualityReadings: airQualityReadings));
  }

  void _onMapSearchReset(
    MapSearchReset _,
    Emitter<MapState> emit,
  ) {
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
