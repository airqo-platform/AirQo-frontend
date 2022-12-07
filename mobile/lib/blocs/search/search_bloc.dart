import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:app_repository/app_repository.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

part 'search_event.dart';
part 'search_state.dart';

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc() : super(const SearchState.initial()) {
    on<InitializeSearchPage>(_onInitializeSearchPage);
    on<FilterByAirQuality>(_onFilterByAirQuality);
    on<SearchTermChanged>(
      _onSearchTermChanged,
      transformer: debounce(const Duration(milliseconds: 300)),
    );
    searchRepository = SearchRepository(searchApiKey: Config.searchApiKey);
  }

  late final SearchRepository searchRepository;

  void _onInitializeSearchPage(
    InitializeSearchPage _,
    Emitter<SearchState> emit,
  ) {
    List<AirQualityReading> africanCities = [];
    final nearestAirQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
            .values
            .toList();

    final airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();
    airQualityReadings.shuffle();

    final List<String> countries =
        airQualityReadings.map((e) => e.country).toSet().toList();
    for (String country in countries) {
      List<AirQualityReading> readings = airQualityReadings
          .where((element) => element.country.equalsIgnoreCase(country))
          .take(2)
          .toList();
      africanCities.addAll(readings);
    }

    africanCities.shuffle();

    return emit(const SearchState.initial().copyWith(
      nearbyAirQualityLocations: nearestAirQualityReadings.sortByAirQuality(),
      recentSearches: nearestAirQualityReadings.sortByAirQuality(),
      africanCities: africanCities,
    ));
  }

  void _onFilterByAirQuality(
    FilterByAirQuality event,
    Emitter<SearchState> emit,
  ) {
    final List<AirQualityReading> airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();

    final List<AirQualityReading> nearbyAirQualityLocations = state
        .nearbyAirQualityLocations
        .where((element) =>
            Pollutant.pm2_5.airQuality(element.pm2_5) == event.airQuality)
        .toList();

    final List<AirQualityReading> otherAirQualityLocations = airQualityReadings
        .where((element) =>
            Pollutant.pm2_5.airQuality(element.pm2_5) == event.airQuality)
        .toList();

    return emit(state.copyWith(
      nearbyAirQualityLocations: nearbyAirQualityLocations.sortByAirQuality(),
      otherAirQualityLocations: otherAirQualityLocations.sortByAirQuality(),
      featuredAirQuality: event.airQuality,
    ));
  }

  void _onSearchTermChanged(
    SearchTermChanged event,
    Emitter<SearchState> emit,
  ) async {
    final searchTerm = event.text;
    emit(state.copyWith(searchTerm: searchTerm));

    if (searchTerm.isEmpty) {
      return;
    }

    emit(state.copyWith(blocStatus: SearchStatus.searching));

    try {
      final airQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
              .values
              .toList();
      final List<String> countries =
          airQualityReadings.map((e) => e.country).toSet().toList();

      final results = await searchRepository.search(
        searchTerm,
        countries: countries,
      );

      return emit(state.copyWith(
        searchResults: results.items,
        blocStatus: SearchStatus.searchSuccess,
      ));
    } catch (error) {
      return emit(state.copyWith(
        searchError: SearchError.searchFailed,
        blocStatus: SearchStatus.error,
      ));
    }
  }
}
