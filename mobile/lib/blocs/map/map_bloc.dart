import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'map_event.dart';
part 'map_state.dart';

class MapBloc extends Bloc<MapEvent, MapState> {
  MapBloc() : super(const MapState.initial()) {
    on<InitializeMapState>(_onInitializeMapState);
    on<ShowCountryRegions>(_onShowCountryRegions);
    on<ShowRegionSites>(_onShowRegionSites);
    on<ShowSiteReading>(_onShowSiteReading);
    on<InitializeSearch>(_onInitializeSearch);
  }

  Future<void> _onInitializeMapState(
    InitializeMapState _,
    Emitter<MapState> emit,
  ) async {
    List<AirQualityReading> airQualityReadings =
        HiveService().getAirQualityReadings();

    if (airQualityReadings.isEmpty) {
      final hasConnection = await hasNetworkConnection();
      if (!hasConnection) {
        return emit(state.copyWith(
          mapStatus: MapStatus.error,
          blocError: FirebaseAuthError.noInternetConnection,
        ));
      }

      emit(state.copyWith(mapStatus: MapStatus.loading));

      await AppService().refreshAirQualityReadings().then((value) {
        airQualityReadings = HiveService().getAirQualityReadings();
        if (airQualityReadings.isEmpty) {
          emit(state.copyWith(mapStatus: MapStatus.noAirQuality));
        }
      });
    }

    final List<String> countries =
        airQualityReadings.map((e) => e.country.toTitleCase()).toSet().toList();

    countries.removeWhere((element) => element.isEmpty);
    countries.sort();
    airQualityReadings = airQualityReadings
      ..sortByAirQuality(sortCountries: true);

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

    regions.sort();

    return emit(state.copyWith(
      regions: regions,
      featuredCountry: event.country.toTitleCase(),
      mapStatus: MapStatus.showingRegions,
      featuredAirQualityReadings: airQualityReadings
        ..sortByAirQuality(sortCountries: true),
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

    return emit(state.copyWith(
      featuredAirQualityReadings: airQualityReadings
        ..sortByAirQuality(sortCountries: true),
      featuredRegion: event.region.toTitleCase(),
      mapStatus: MapStatus.showingRegionSites,
    ));
  }

  void _onShowSiteReading(
    ShowSiteReading event,
    Emitter<MapState> emit,
  ) {
    final AirQualityReading site =
        state.airQualityReadings.firstWhere((e) => e.placeId.equalsIgnoreCase(
              event.airQualityReading.placeId,
            ));

    return emit(state.copyWith(
      featuredSiteReading: site,
      mapStatus: MapStatus.showingFeaturedSite,
    ));
  }

  void _onInitializeSearch(
    InitializeSearch _,
    Emitter<MapState> emit,
  ) {
    return emit(state.copyWith(mapStatus: MapStatus.searching));
  }
}

class MapSearchBloc extends Bloc<MapEvent, MapSearchState> {
  MapSearchBloc() : super(const MapSearchState.initial()) {
    on<InitializeSearch>(_onInitializeSearch);
    on<MapSearchTermChanged>(
      _onMapSearchTermChanged,
      transformer: debounce(const Duration(milliseconds: 300)),
    );
  }

  void _onLoadDefaults(
    Emitter<MapSearchState> emit,
  ) {
    List<AirQualityReading> nearbyAirQualityReadings =
        HiveService().getNearbyAirQualityReadings();

    List<AirQualityReading> airQualityReadings =
        HiveService().getAirQualityReadings();

    airQualityReadings = nearbyAirQualityReadings.isEmpty
        ? airQualityReadings
        : nearbyAirQualityReadings;

    return emit(state.copyWith(
      airQualityReadings: airQualityReadings
        ..sortByAirQuality(sortCountries: true),
    ));
  }

  void _onInitializeSearch(
    InitializeSearch _,
    Emitter<MapSearchState> emit,
  ) {
    return _onLoadDefaults(emit);
  }

  void _onMapSearchTermChanged(
    MapSearchTermChanged event,
    Emitter<MapSearchState> emit,
  ) async {
    final searchTerm = event.searchTerm;
    emit(state.copyWith(searchTerm: searchTerm));

    if (searchTerm.isEmpty) {
      return _onLoadDefaults(emit);
    }

    try {
      final List<String> countries =
          state.airQualityReadings.map((e) => e.country).toSet().toList();

      List<SearchResult> results = await SearchApiClient().search(searchTerm);

      results = results.where((element) {
        return countries.any((country) =>
            element.location.toLowerCase().contains(country.toLowerCase()));
      }).toList();

      return emit(state.copyWith(searchResults: results));
    } catch (error) {
      return;
    }
  }
}
