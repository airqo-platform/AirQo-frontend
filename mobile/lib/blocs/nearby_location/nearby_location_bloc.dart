import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
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
      showErrorMessage: false,
      currentLocation: state.currentLocation,
    ));
  }

  Future<bool> _isLocationEnabled(Emitter<NearbyLocationState> emit) async {
    final locationGranted = await LocationService.locationGranted();
    if (!locationGranted) {
      emit(state.copyWith(
        blocStatus: NearbyLocationStatus.locationDisabled,
      ));

      return false;
    }

    final bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      emit(state.copyWith(
        blocStatus: NearbyLocationStatus.locationDisabled,
      ));

      return false;
    }

    return true;
  }

  Future<void> _onSearchLocationAirQuality(
    SearchLocationAirQuality event,
    Emitter<NearbyLocationState> emit,
  ) async {
    CurrentLocation? currentLocation = state.currentLocation;

    emit(state.copyWith(
      blocStatus: NearbyLocationStatus.searching,
      showErrorMessage: true,
      currentLocation: currentLocation,
    ));

    final bool isLocationEnabled = await _isLocationEnabled(emit);
    if (!isLocationEnabled) {
      await HiveService().updateNearbyAirQualityReadings([]);

      return;
    }

    CurrentLocation? newLocation =
        event.newLocation ?? await LocationService.getCurrentLocation();

    if (newLocation == null ||
        (currentLocation != null &&
            !currentLocation.hasChangedCurrentLocation(newLocation))) {
      return;
    }

    List<AirQualityReading> airQualityReadings =
        await LocationService.getNearestSites(
            latitude: newLocation.latitude, longitude: newLocation.longitude,);
    if (airQualityReadings.isNotEmpty) {
      newLocation = newLocation.copyWith(
          referenceSite: airQualityReadings.first.referenceSite,);
    }

    emit(state.copyWith(
      currentLocation: newLocation,
      blocStatus: NearbyLocationStatus.searchComplete,
    ));

    await HiveService().updateNearbyAirQualityReadings(airQualityReadings);
  }
}
