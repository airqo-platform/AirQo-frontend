import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/map/repository/map_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';

part 'map_event.dart';
part 'map_state.dart';

class MapBloc extends Bloc<MapEvent, MapState> with UiLoggy {
  final MapRepository mapRepository;
  
  MapBloc(this.mapRepository) : super(MapInitial()) {
    on<LoadMap>(_onLoadMap);
    on<RefreshMap>(_onRefreshMap);
  }

  Future<void> _onLoadMap(LoadMap event, Emitter<MapState> emit) async {
    try {
      if (state is! MapLoading) {
        emit(MapLoading(previousState: state is MapLoaded ? state as MapLoaded : null));
      }

      AirQualityResponse response = await mapRepository.fetchAirQualityReadings(
        forceRefresh: event.forceRefresh
      );

      emit(MapLoaded(response));
    } catch (e) {
      loggy.error('Error loading map: $e');
      
      if (state is MapLoading && (state as MapLoading).previousState != null) {
        final previousState = (state as MapLoading).previousState!;
        emit(MapLoadedWithError(
          previousState.response,
          errorMessage: e.toString(),
        ));
      } else {
        try {
          final cachedResponse = await (mapRepository as MapImpl).getCachedMapData();
          if (cachedResponse != null) {
            emit(MapLoadedFromCache(cachedResponse));
          } else {
            emit(MapLoadingError(e.toString()));
          }
        } catch (cacheError) {
          loggy.error('Error getting cached map data: $cacheError');
          emit(MapLoadingError(e.toString()));
        }
      }
    }
  }

  Future<void> _onRefreshMap(RefreshMap event, Emitter<MapState> emit) async {
    if (state is! MapLoaded) {
      add(LoadMap(forceRefresh: true));
      return;
    }

    final currentState = state as MapLoaded;
    emit(MapRefreshing(currentState.response));

    try {
      final response = await mapRepository.fetchAirQualityReadings(forceRefresh: true);
      emit(MapLoaded(response));
    } catch (e) {
      loggy.error('Error refreshing map: $e');

      emit(MapLoadedWithError(
        currentState.response, 
        errorMessage: e.toString(),
      ));
    }
  }
}