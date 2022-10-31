import 'dart:async';

import 'package:app_repository/app_repository.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../constants/config.dart';
import '../../models/air_quality_reading.dart';
import '../../models/enum_constants.dart';
import '../../services/hive_service.dart';

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
    ShowAllSites event,
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
    SearchSite event,
    Emitter<MapState> emit,
  ) async {
    final airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();

    return emit(SearchSitesState(airQualityReadings: airQualityReadings));
  }

  void _onMapSearchReset(
    MapSearchReset event,
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

      final airQualitySearch = <AirQualityReading>[];

      for (final airQualityReading in airQualityReadings) {
        if (airQualityReading.name.contains(searchTerm) ||
            airQualityReading.location.contains(searchTerm)) {
          airQualitySearch.add(airQualityReading);
        }
      }

      return emit(
        SearchSitesState(airQualityReadings: airQualitySearch),
      );
    }
  }
}
