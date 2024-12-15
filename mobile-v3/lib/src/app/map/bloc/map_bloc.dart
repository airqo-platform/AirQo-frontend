import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/map/repository/map_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'map_event.dart';
part 'map_state.dart';

class MapBloc extends Bloc<MapEvent, MapState> {
  final MapRepository mapRepository;
  MapBloc(this.mapRepository) : super(MapInitial()) {
    on<MapEvent>((event, emit) async {
      if (event is LoadMap) {
        try {
          AirQualityResponse response =
              await mapRepository.fetchAirQualityReadings();

          emit(MapLoaded(response));
        } catch (e) {
          emit(MapLoadingError(e.toString()));
        }
      }
    });
  }
}
