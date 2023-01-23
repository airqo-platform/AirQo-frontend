import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

part 'search_event.dart';
part 'search_state.dart';

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc() : super(const SearchState.initial()) {
    on<InitializeSearchPage>(_onInitializeSearchPage);
    on<ReloadSearchPage>(_onReloadSearchPage);
    on<FilterByAirQuality>(_onFilterByAirQuality);
    on<SearchAirQuality>(_onSearchAirQuality);
    on<ClearSearchResult>(_onClearSearchResult);
    on<SearchTermChanged>(
      _onSearchTermChanged,
      transformer: debounce(const Duration(milliseconds: 300)),
    );
  }

  Future<void> _loadSearchHistory(Emitter<SearchState> emit) async {
    List<SearchHistory> searchHistory =
        Hive.box<SearchHistory>(HiveBox.searchHistory).values.toList();
    searchHistory = searchHistory.sortByDateTime().take(3).toList();
    List<AirQualityReading> recentSearches =
        await searchHistory.attachedAirQualityReadings();

    return emit(state.copyWith(recentSearches: recentSearches));
  }

  Future<void> _initialize(Emitter<SearchState> emit) async {
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
      return emit(const SearchState.initial().copyWith(
        searchStatus: SearchStatus.error,
        searchError: SearchError.noAirQualityData,
      ));
    }

    emit(const SearchState.initial().copyWith(
      africanCities: africanCities,
      searchStatus: SearchStatus.initial,
      searchError: SearchError.none,
    ));

    await _loadSearchHistory(emit);

    return;
  }

  Future<void> _onInitializeSearchPage(
    InitializeSearchPage _,
    Emitter<SearchState> emit,
  ) async {
    await _initialize(emit);
  }

  Future<void> _onReloadSearchPage(
    ReloadSearchPage _,
    Emitter<SearchState> emit,
  ) async {
    emit(state.copyWith(
      searchStatus: SearchStatus.loading,
      searchError: SearchError.none,
    ));

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

    return emit(const SearchState.initial().copyWith(
      searchStatus: SearchStatus.error,
      searchError: SearchError.noAirQualityData,
    ));
  }

  void _onFilterByAirQuality(
    FilterByAirQuality event,
    Emitter<SearchState> emit,
  ) {
    List<AirQualityReading> nearbyAirQualityLocations = <AirQualityReading>[];
    List<AirQualityReading> otherAirQualityLocations = <AirQualityReading>[];

    if (event.airQuality != null) {
      nearbyAirQualityLocations =
          Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
              .values
              .where((element) =>
                  Pollutant.pm2_5.airQuality(element.pm2_5) == event.airQuality)
              .toList();

      final List<AirQualityReading> airQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
              .values
              .toList();

      otherAirQualityLocations = airQualityReadings
          .where((element) =>
              Pollutant.pm2_5.airQuality(element.pm2_5) == event.airQuality)
          .toList();

      otherAirQualityLocations.removeWhere((element) =>
          nearbyAirQualityLocations
              .map((e) => e.placeId)
              .toList()
              .contains(element.placeId));
    }

    return emit(state.copyWith(
      nearbyAirQualityLocations: nearbyAirQualityLocations.sortByAirQuality(),
      otherAirQualityLocations: otherAirQualityLocations.sortByAirQuality(),
      searchError: SearchError.none,
      searchStatus: SearchStatus.initial,
      featuredAirQuality: event.airQuality,
      nullFeaturedAirQuality: event.airQuality == null ? true : false,
    ));
  }

  Future<void> _onSearchAirQuality(
    SearchAirQuality event,
    Emitter<SearchState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        searchStatus: SearchStatus.error,
        searchError: SearchError.noInternetConnection,
      ));
    }

    emit(state.copyWith(searchStatus: SearchStatus.searchingAirQuality));

    final SearchResult? searchResult =
        await SearchApiClient().getPlaceDetails(event.searchResult);

    if (searchResult == null) {
      return emit(state.copyWith(
        searchStatus: SearchStatus.airQualitySearchFailed,
        nullSearchAirQuality: true,
      ));
    }

    final nearestSite = await LocationService.getNearestSite(
      searchResult.latitude,
      searchResult.longitude,
    );

    if (nearestSite == null) {
      return emit(state.copyWith(
        searchStatus: SearchStatus.airQualitySearchFailed,
        nullSearchAirQuality: true,
      ));
    }

    AirQualityReading airQualityReading = nearestSite.copyWith(
      name: event.searchResult.name,
      location: event.searchResult.location,
      placeId: event.searchResult.id,
      latitude: searchResult.latitude,
      longitude: searchResult.longitude,
    );

    List<AirQualityReading> recentSearches = List.of(state.recentSearches);
    if (!recentSearches
        .map((e) => e.placeId)
        .toList()
        .contains(airQualityReading.placeId)) {
      recentSearches.insert(0, airQualityReading);
    }

    emit(state.copyWith(
      searchStatus: SearchStatus.autoCompleteSearchSuccess,
      searchAirQuality: airQualityReading,
      recentSearches: recentSearches,
    ));

    await HiveService.updateSearchHistory(airQualityReading);
  }

  void _onClearSearchResult(ClearSearchResult _, Emitter<SearchState> emit) {
    return emit(state.copyWith(
      searchAirQuality: null,
    ));
  }

  void _onSearchTermChanged(
    SearchTermChanged event,
    Emitter<SearchState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        searchStatus: SearchStatus.error,
        searchError: SearchError.noInternetConnection,
      ));
    }

    final searchTerm = event.text;
    emit(state.copyWith(searchTerm: searchTerm));

    if (searchTerm.isEmpty) {
      return emit(state.copyWith(searchStatus: SearchStatus.initial));
    }

    emit(state.copyWith(searchStatus: SearchStatus.autoCompleteSearching));

    try {
      final airQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
              .values
              .toList();
      final List<String> countries =
          airQualityReadings.map((e) => e.country).toSet().toList();

      List<SearchResult> results = await SearchApiClient().search(searchTerm);

      results = results.where((element) {
        return countries.any((country) =>
            element.location.toLowerCase().contains(country.toLowerCase()));
      }).toList();

      return emit(state.copyWith(
        searchResults: results.toSet().toList(),
        searchStatus: SearchStatus.autoCompleteSearchSuccess,
        searchError: SearchError.none,
      ));
    } catch (error) {
      return emit(state.copyWith(
        searchError: SearchError.noAirQualityData,
        searchStatus: SearchStatus.error,
      ));
    }
  }
}
