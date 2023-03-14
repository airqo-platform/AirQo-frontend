import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive_flutter/hive_flutter.dart';

part 'search_event.dart';
part 'search_state.dart';

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc() : super(const SearchState()) {
    on<InitializeSearchView>(_onInitializeSearchView);
    on<ClearSearchHistory>(_onClearSearchHistory);
    on<NoSearchInternetConnection>(_onNoSearchInternetConnection);
    on<GetSearchRecommendations>(_onGetSearchRecommendations);
    on<SearchTermChanged>(
      _onSearchTermChanged,
      transformer: debounce(const Duration(milliseconds: 300)),
    );
  }

  Future<void> _onClearSearchHistory(
      ClearSearchHistory _,
      Emitter<SearchState> emit,
      ) async {
    emit(const SearchState());
    await HiveService.deleteSearchHistory();
  }

  void _onLoadCountries(Emitter<SearchState> emit) {
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
    List<AirQualityReading> airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
            .values
            .toList();

    List<SearchHistory> searchHistory =
        Hive.box<SearchHistory>(HiveBox.searchHistory)
            .values
            .toList()
            .sortByDateTime()
            .toList();

    List<AirQualityReading> searchHistoryReadings =
        await searchHistory.attachedAirQualityReadings();

    airQualityReadings.addAll(searchHistoryReadings);

    if (airQualityReadings.isEmpty) {
      List<AirQualityReading> readings =
          Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
              .values
              .toList();

      final List<String> countries =
          readings.map((e) => e.country).toSet().toList();

      for (final country in countries) {
        List<AirQualityReading> countryReadings = readings
            .where((element) => element.country.equalsIgnoreCase(country))
            .toList();
        countryReadings.shuffle();
        airQualityReadings
            .addAll(countryReadings.take(2).toList().sortByAirQuality());
      }

      airQualityReadings.shuffle();
      readings.removeWhere((e) => airQualityReadings
          .map((e) => e.placeId)
          .toList()
          .contains(e.placeId));
      airQualityReadings.addAll(readings);
    }

    emit(const SearchState().copyWith(
      searchHistory: airQualityReadings,
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
    GetSearchRecommendations event,
    Emitter<SearchState> emit,
  ) async {
    List<AirQualityReading> airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();

    // Add sites within 4 kilometers
    List<AirQualityReading> recommendations = airQualityReadings
        .where(
          (e) =>
              metersToKmDouble(Geolocator.distanceBetween(
                e.latitude,
                e.longitude,
                event.searchResult.latitude,
                event.searchResult.longitude,
              )) <=
              Config.searchRadius * 2,
        )
        .toList();

    airQualityReadings =
        airQualityReadings.toSet().difference(recommendations.toSet()).toList();

    List<String> queryTerms = event.searchResult.getSearchTerms();

    for (String parameter in ['name', 'location', 'region', 'country']) {
      recommendations.addAll(airQualityReadings
          .where((reading) => queryTerms.any((queryTerm) =>
              reading.getSearchTerms(parameter).contains(queryTerm)))
          .toList());

      airQualityReadings = airQualityReadings
          .toSet()
          .difference(recommendations.toSet())
          .toList();
    }

    return emit(state.copyWith(
      recommendations: recommendations,
      status: SearchStatus.searchComplete,
      searchTerm: event.searchResult.name,
    ));
  }

  void _onNoSearchInternetConnection(
    NoSearchInternetConnection _,
    Emitter<SearchState> emit,
  ) {
    return emit(state.copyWith(status: SearchStatus.noInternetConnection));
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

    SearchFilterStatus status =
        nearbyAirQualityLocations.isEmpty && otherAirQualityLocations.isEmpty
            ? SearchFilterStatus.filterFailed
            : SearchFilterStatus.filterSuccessful;

    return emit(state.copyWith(
      nearbyLocations: nearbyAirQualityLocations.sortByAirQuality(),
      otherLocations: otherAirQualityLocations.sortByAirQuality(),
      status: status,
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
      return emit(const SearchFilterState().copyWith(
        status: SearchFilterStatus.noAirQualityData,
      ));
    }

    emit(const SearchFilterState().copyWith(
      africanCities: africanCities,
      status: SearchFilterStatus.initial,
    ));

    await _loadSearchHistory(emit);

    return;
  }
}

class SearchPageCubit extends Cubit<SearchPageState> {
  SearchPageCubit() : super(SearchPageState.filtering);

  void showFiltering() => emit(SearchPageState.filtering);
  void showSearching() => emit(SearchPageState.searching);
}
