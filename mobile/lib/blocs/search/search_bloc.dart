import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app_repository/app_repository.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:stream_transform/stream_transform.dart';

import '../../constants/config.dart';

part 'search_event.dart';
part 'search_state.dart';

EventTransformer<Event> debounce<Event>(Duration duration) {
  return (events, mapper) => events.debounce(duration).switchMap(mapper);
}

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc()
      : super(const SearchStateNearestLocations(
          airQualityReadings: [],
          nearbyLocations: false,
        )) {
    on<SearchTermChanged>(
      _onSearchTermChanged,
      transformer: debounce(const Duration(milliseconds: 300)),
    );
    on<ResetSearch>(_onResetSearch);
    searchRepository = SearchRepository(searchApiKey: Config.searchApiKey);
  }

  late final SearchRepository searchRepository;

  void _onResetSearch(
    ResetSearch event,
    Emitter<SearchState> emit,
  ) {
    final nearestAirQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
            .values
            .toList();

    return emit(
      SearchStateNearestLocations(
        airQualityReadings: nearestAirQualityReadings,
        nearbyLocations: true,
      ),
    );
  }

  void _onSearchTermChanged(
    SearchTermChanged event,
    Emitter<SearchState> emit,
  ) async {
    final searchTerm = event.text;

    if (searchTerm.isEmpty) {
      final nearestAirQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
              .values
              .toList();

      return emit(
        SearchStateNearestLocations(
          airQualityReadings: nearestAirQualityReadings,
          nearbyLocations: true,
        ),
      );
    }

    emit(SearchStateLoading());

    try {
      final results = await searchRepository.search(searchTerm);

      return emit(SearchStateSuccess(results.items));
    } catch (error) {
      return emit(error is SearchResultError
          ? SearchStateError(error.message)
          : const SearchStateError('something went wrong'));
    }
  }
}
