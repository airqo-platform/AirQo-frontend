import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';

part 'search_event.dart';
part 'search_state.dart';

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc() : super(const SearchState()) {
    on<InitializeSearchView>(_onInitializeSearchView);
    on<NoSearchInternetConnection>(_onNoSearchInternetConnection);
    on<GetSearchRecommendations>(_onGetSearchRecommendations);
    on<SearchTermChanged>(
      _onSearchTermChanged,
      transformer: debounce(const Duration(milliseconds: 300)),
    );
  }

  void _onLoadCountries(Emitter<SearchState> emit) {
    final List<AirQualityReading> airQualityReadings =
        HiveService().getAirQualityReadings();
    final List<String> countries =
        airQualityReadings.map((e) => e.country).toSet().toList();

    return emit(state.copyWith(countries: countries));
  }

  Future<void> _onInitializeSearchView(
    InitializeSearchView _,
    Emitter<SearchState> emit,
  ) async {
    List<AirQualityReading> airQualityReadings =
        HiveService().getNearbyAirQualityReadings();

    if (airQualityReadings.isEmpty) {
      List<AirQualityReading> readings = HiveService().getAirQualityReadings();

      final List<String> countries =
          readings.map((e) => e.country).toSet().toList();

      for (final country in countries) {
        List<AirQualityReading> countryReadings = readings
            .where((element) => element.country.equalsIgnoreCase(country))
            .toList();
        countryReadings
          ..shuffle()
          ..take(2).toList();
        countryReadings.sortByAirQuality();

        airQualityReadings.addAll(countryReadings);
      }

      airQualityReadings.shuffle();
      readings.removeWhere((e) => airQualityReadings
          .map((e) => e.placeId)
          .toList()
          .contains(e.placeId));
      airQualityReadings.addAll(readings);
    }

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
        HiveService().getAirQualityReadings();

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

  Future<void> _onReloadSearchFilter(
    ReloadSearchFilter _,
    Emitter<SearchFilterState> emit,
  ) async {
    emit(state.copyWith(status: SearchFilterStatus.loading));

    bool success = await AppService().refreshAirQualityReadings();
    if (success) {
      final airQualityReadings = HiveService().getAirQualityReadings();
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

    nearbyAirQualityLocations = HiveService()
        .getNearbyAirQualityReadings()
        .where((element) =>
            Pollutant.pm2_5.airQuality(element.pm2_5) == event.airQuality)
        .toList();

    final List<AirQualityReading> airQualityReadings =
        HiveService().getAirQualityReadings();

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
    nearbyAirQualityLocations.sortByAirQuality();
    otherAirQualityLocations.sortByAirQuality();

    return emit(state.copyWith(
      nearbyLocations: nearbyAirQualityLocations,
      otherLocations: otherAirQualityLocations,
      status: status,
      filteredAirQuality: event.airQuality,
    ));
  }

  Future<void> _initialize(Emitter<SearchFilterState> emit) async {
    List<AirQualityReading> africanCities = [];

    final airQualityReadings = HiveService().getAirQualityReadings();
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
  }
}

class SearchPageCubit extends Cubit<SearchPageState> {
  SearchPageCubit() : super(SearchPageState.filtering);

  void showFiltering() => emit(SearchPageState.filtering);
  void showSearching() => emit(SearchPageState.searching);
}
