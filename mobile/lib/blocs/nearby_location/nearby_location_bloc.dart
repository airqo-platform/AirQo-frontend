import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'nearby_location_event.dart';
part 'nearby_location_state.dart';

class NearbyLocationBloc
    extends Bloc<NearbyLocationEvent, NearbyLocationState> {
  NearbyLocationBloc() : super(const NearbyLocationState.initial()) {
    on<SearchLocationAirQuality>(_onSearchLocationAirQuality);
  }

  Future<void> _onSearchLocationAirQuality(
    SearchLocationAirQuality _,
    Emitter<NearbyLocationState> emit,
  ) async {
    try {
      emit(state.copyWith(blocStatus: NearbyLocationStatus.searching));

      final locationEnabled =
          await PermissionService.checkPermission(AppPermission.location);

      if (!locationEnabled) {
        return emit(state.copyWith(
          blocStatus: NearbyLocationStatus.error,
          error: NearbyAirQualityError.locationDenied,
        ));
      }

      final airQualityReadings =
          await LocationService.getNearbyAirQualityReadings(top: 8);

      await HiveService.updateNearbyAirQualityReadings(airQualityReadings);

      if (airQualityReadings.isEmpty) {
        return emit(state.copyWith(
          blocStatus: NearbyLocationStatus.error,
          error: NearbyAirQualityError.noNearbyAirQualityReadings,
        ));
      }

      return emit(state.copyWith(
        blocStatus: NearbyLocationStatus.loaded,
        error: NearbyAirQualityError.none,
        airQualityReadings: airQualityReadings,
      ));
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }
}
