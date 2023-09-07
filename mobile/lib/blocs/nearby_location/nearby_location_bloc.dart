import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/extensions.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';

part 'nearby_location_event.dart';
part 'nearby_location_state.dart';

class NearbyLocationBloc
    extends Bloc<NearbyLocationEvent, NearbyLocationState> {
  NearbyLocationBloc() : super(const NearbyLocationState()) {
    on<SearchLocationAirQuality>(_onSearchLocationAirQuality);
    on<DismissErrorMessage>(_onDismissErrorMessage);
  }

  void _onDismissErrorMessage(
    DismissErrorMessage _,
    Emitter<NearbyLocationState> emit,
  ) {
    return emit(state.copyWith(
      state.locationAirQuality,
      showErrorMessage: false,
    ));
  }

  Future<bool> _isLocationEnabled(Emitter<NearbyLocationState> emit) async {
    final locationGranted = await LocationService.locationGranted();
    if (!locationGranted) {
      emit(state.copyWith(
        null,
        blocStatus: NearbyLocationStatus.locationDisabled,
        showErrorMessage: true,
      ));

      return false;
    }

    final bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      emit(state.copyWith(
        null,
        blocStatus: NearbyLocationStatus.locationDisabled,
        showErrorMessage: true,
      ));

      return false;
    }

    return true;
  }

  Future<void> _onSearchLocationAirQuality(
    SearchLocationAirQuality event,
    Emitter<NearbyLocationState> emit,
  ) async {
    AirQualityReading? previousLocationAirQuality = state.locationAirQuality;

    emit(state.copyWith(previousLocationAirQuality,
        blocStatus: NearbyLocationStatus.searching));

    final bool isLocationEnabled = await _isLocationEnabled(emit);
    if (!isLocationEnabled) {
      await HiveService().updateNearbyAirQualityReadings([]);

      return;
    }

    AirQualityReading? currentLocationAirQuality =
        await LocationService.getLocationAirQuality();

    if (currentLocationAirQuality == null) {
      emit(state.copyWith(
        previousLocationAirQuality,
        blocStatus: NearbyLocationStatus.searchComplete,
        showErrorMessage: true,
      ));
      return;
    }

    if (previousLocationAirQuality != null &&
        currentLocationAirQuality.isNear(previousLocationAirQuality)) {
      emit(state.copyWith(
        previousLocationAirQuality,
        blocStatus: NearbyLocationStatus.searchComplete,
      ));
      return;
    }

    List<AirQualityReading> surroundingSites =
        LocationService.getSurroundingSites(
      currentLocationAirQuality.point,
      radius: Config.searchRadius * 5,
    ).toSet().toList();

    surroundingSites.removeWhere((element) =>
        element.name.equalsIgnoreCase(currentLocationAirQuality.name));
    surroundingSites = surroundingSites.take(10).toList();

    emit(state.copyWith(
      currentLocationAirQuality,
      blocStatus: NearbyLocationStatus.searchComplete,
      surroundingSites: surroundingSites,
    ));

    await HiveService().updateNearbyAirQualityReadings(surroundingSites);
  }
}
