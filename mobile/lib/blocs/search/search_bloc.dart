import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:app_repository/app_repository.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:stream_transform/stream_transform.dart';

part 'search_event.dart';
part 'search_state.dart';

EventTransformer<Event> debounce<Event>(Duration duration) {
  return (events, mapper) => events.debounce(duration).switchMap(mapper);
}

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc() : super(const SearchState.initial()) {
    on<InitializeSearchPage>(_onInitializeSearchPage);
    on<FilterSearchAirQuality>(_onFilterSearchAirQuality);

    // on<SearchTermChanged>(
    //   _onSearchTermChanged,
    //   transformer: debounce(const Duration(milliseconds: 300)),
    // );
    // on<ResetSearch>(_onResetSearch);

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
    countries.shuffle();
    for (String country in countries) {
      AirQualityReading airQualityReading = airQualityReadings
          .firstWhere((element) => element.country.equalsIgnoreCase(country));
      africanCities.add(airQualityReading);
    }

    return emit(const SearchState.initial().copyWith(
      nearbyAirQualityLocations: nearestAirQualityReadings,
      recentSearches: nearestAirQualityReadings,
      africanCities: africanCities,
    ));
  }

  void _onFilterSearchAirQuality(
    FilterSearchAirQuality event,
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
      nearbyAirQualityLocations: nearbyAirQualityLocations,
      otherAirQualityLocations: otherAirQualityLocations,
      featuredAirQuality: event.airQuality,
    ));
  }

  // void _onResetSearch(
  //   ResetSearch _,
  //   Emitter<SearchState> emit,
  // ) {
  //   final nearestAirQualityReadings =
  //       Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
  //           .values
  //           .toList();
  //
  //   return emit(
  //     SearchStateNearestLocations(
  //       airQualityReadings: nearestAirQualityReadings,
  //       nearbyAirQualityLocations: true,
  //     ),
  //   );
  // }
  //
  // void _onSearchTermChanged(
  //   SearchTermChanged event,
  //   Emitter<SearchState> emit,
  // ) async {
  //   final searchTerm = event.text;
  //
  //   if (searchTerm.isEmpty) {
  //     final nearestAirQualityReadings =
  //         Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
  //             .values
  //             .toList();
  //
  //     return emit(
  //       SearchStateNearestLocations(
  //         airQualityReadings: nearestAirQualityReadings,
  //         nearbyAirQualityLocations: true,
  //       ),
  //     );
  //   }
  //
  //   emit(SearchStateLoading());
  //
  //   try {
  //     final results = await searchRepository.search(searchTerm);
  //
  //     return emit(SearchStateSuccess(results.items));
  //   } catch (error) {
  //     return emit(error is SearchResultError
  //         ? SearchStateError(error.message)
  //         : const SearchStateError('something went wrong'));
  //   }
  // }
}
