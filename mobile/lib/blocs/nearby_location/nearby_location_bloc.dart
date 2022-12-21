import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';

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
    emit(state.copyWith(
      blocStatus: NearbyLocationStatus.searching,
      error: NearbyAirQualityError.none,
    ));

    final bool permissionGranted =
        await PermissionService.checkPermission(AppPermission.location);

    if (!permissionGranted) {
      return emit(state.copyWith(
        blocStatus: NearbyLocationStatus.error,
        error: NearbyAirQualityError.locationDenied,
      ));
    }

    final bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return emit(state.copyWith(
        blocStatus: NearbyLocationStatus.error,
        error: NearbyAirQualityError.locationDisabled,
      ));
    }

    final airQualityReadings =
        await LocationService.getNearbyAirQualityReadings();

    emit(state.copyWith(
      blocStatus: airQualityReadings.isEmpty
          ? NearbyLocationStatus.error
          : NearbyLocationStatus.loaded,
      error: airQualityReadings.isEmpty
          ? NearbyAirQualityError.noNearbyAirQualityReadings
          : NearbyAirQualityError.none,
      airQualityReadings: airQualityReadings,
    ));

    await HiveService.updateNearbyAirQualityReadings(airQualityReadings);
  }
}
