import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

part 'search_event.dart';
part 'search_state.dart';

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc() : super(const SearchState()) {
    on<InitializeSearchView>(_onInitializeSearchView);
    on<SearchTermChanged>(
      _onSearchTermChanged,
      transformer: debounce(const Duration(milliseconds: 300)),
    );
    on<GetSearchRecommendations>(_onGetSearchRecommendations);
  }

  void _onLoadCountries(
    Emitter<SearchState> emit,
  ) {
    final airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();
    final List<String> countries =
        airQualityReadings.map((e) => e.country).toSet().toList();

    return emit(state.copyWith(countries: countries));
  }

  Future<void> _onInitializeSearchView(
    InitializeSearchView _,
    Emitter<SearchState> emit,
  ) async {
    List<SearchHistory> searchHistory =
        Hive.box<SearchHistory>(HiveBox.searchHistory).values.toList();
    searchHistory = searchHistory.sortByDateTime().take(3).toList();
    List<AirQualityReading> searchHistoryAirQuality =
        await searchHistory.attachedAirQualityReadings();

    emit(const SearchState().copyWith(
      searchHistory: searchHistoryAirQuality,
    ));

    _onLoadCountries(emit);
    return;
  }

  void _onSearchTermChanged(
    SearchTermChanged event,
    Emitter<SearchState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        status: SearchStatus.noInternetConnection,
      ));
    }

    final searchTerm = event.text;
    emit(state.copyWith(searchTerm: searchTerm));

    if (searchTerm.isEmpty) {
      return emit(state.copyWith(status: SearchStatus.initial));
    }

    emit(state.copyWith(status: SearchStatus.autoCompleting));

    if (state.countries.isEmpty) {
      _onLoadCountries(emit);
    }

    try {
      List<SearchResult> results = await SearchApiClient().search(searchTerm);

      results = results.where((element) {
        return state.countries.any((country) =>
            element.location.toLowerCase().contains(country.toLowerCase()));
      }).toList();

      return emit(state.copyWith(
        searchResults: results.toSet().toList(),
        status: SearchStatus.autoCompleteFinished,
      ));
    } catch (error) {
      return emit(state.copyWith(
        status: SearchStatus.noAirQualityData,
      ));
    }
  }

  Future<void> _onGetSearchRecommendations(
    GetSearchRecommendations _,
    Emitter<SearchState> emit,
  ) async {
    List<AirQualityReading> airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
            .values
            .toList();

    if (airQualityReadings.isEmpty) {
      airQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
              .values
              .toList();
    }

    return emit(const SearchState().copyWith(
      recommendations: airQualityReadings,
    ));
  }
}

class SearchFilterBloc extends Bloc<SearchEvent, SearchFilterState> {
  SearchFilterBloc() : super(const SearchFilterState()) {
    on<InitializeSearchFilter>(_onInitializeSearchFilter);
    on<ReloadSearchFilter>(_onReloadSearchFilter);
    on<FilterByAirQuality>(_onFilterByAirQuality);
  }

  Future<void> _onInitializeSearchFilter(
    InitializeSearchFilter _,
    Emitter<SearchFilterState> emit,
  ) async {
    await _initialize(emit);
  }

  Future<void> _loadSearchHistory(Emitter<SearchFilterState> emit) async {
    List<SearchHistory> searchHistory =
        Hive.box<SearchHistory>(HiveBox.searchHistory).values.toList();
    searchHistory = searchHistory.sortByDateTime().take(3).toList();
    List<AirQualityReading> recentSearches =
        await searchHistory.attachedAirQualityReadings();

    return emit(state.copyWith(recentSearches: recentSearches));
  }

  Future<void> _onReloadSearchFilter(
    ReloadSearchFilter _,
    Emitter<SearchFilterState> emit,
  ) async {
    emit(state.copyWith(status: SearchFilterStatus.loading));

    bool success = await AppService().refreshAirQualityReadings();
    if (success) {
      final airQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
              .values
              .toList();
      if (airQualityReadings.isNotEmpty) {
        await _initialize(emit);

        return;
      }
    }

    return emit(const SearchFilterState().copyWith(
      status: SearchFilterStatus.noAirQualityData,
    ));
  }

  void _onFilterByAirQuality(
    FilterByAirQuality event,
    Emitter<SearchFilterState> emit,
  ) {
    List<AirQualityReading> nearbyAirQualityLocations = <AirQualityReading>[];
    List<AirQualityReading> otherAirQualityLocations = <AirQualityReading>[];

    nearbyAirQualityLocations =
        Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
            .values
            .where((element) =>
                Pollutant.pm2_5.airQuality(element.pm2_5) == event.airQuality)
            .toList();

    final List<AirQualityReading> airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();

    otherAirQualityLocations = airQualityReadings
        .where((element) =>
            Pollutant.pm2_5.airQuality(element.pm2_5) == event.airQuality)
        .toList();

    otherAirQualityLocations.removeWhere((element) => nearbyAirQualityLocations
        .map((e) => e.placeId)
        .toList()
        .contains(element.placeId));

    return emit(state.copyWith(
      nearbyLocations: nearbyAirQualityLocations.sortByAirQuality(),
      otherLocations: otherAirQualityLocations.sortByAirQuality(),
      status: SearchFilterStatus.initial,
      filteredAirQuality: event.airQuality,
    ));
  }

  Future<void> _initialize(Emitter<SearchFilterState> emit) async {
    List<AirQualityReading> africanCities = [];

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

    if (africanCities.isEmpty) {
      return emit(const SearchFilterState()
          .copyWith(status: SearchFilterStatus.noAirQualityData));
    }

    emit(const SearchFilterState().copyWith(
      africanCities: africanCities,
      status: SearchFilterStatus.initial,
    ));

    await _loadSearchHistory(emit);

    return;
  }
}
