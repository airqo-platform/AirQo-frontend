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

    if (newLocation == null) {
      return;
    }

    if (currentLocation != null &&
        !currentLocation.hasChangedCurrentLocation(newLocation)) {
      return;
    }

    AirQualityReading? nearestSite =
        LocationService.getSurroundingSites(newLocation.point).firstOrNull;

    if (nearestSite == null) {
      newLocation = newLocation.copyWith(referenceSite: "");
    } else {
      newLocation = newLocation.copyWith(
        referenceSite: nearestSite.referenceSite,
      );

      Address? address = await SearchApiClient().getAddress(
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      );
      newLocation = address == null
          ? newLocation.copyWith(
              name: nearestSite.name,
              location: nearestSite.location,
            )
          : newLocation.copyWith(
              name: address.name,
              location: address.location,
            );
    }

    List<AirQualityReading> surroundingSites = [];
    int surroundingSitesRadius = Config.searchRadius;

    while (surroundingSites.length < 5 &&
        surroundingSitesRadius <
            Config.surroundingsSitesMaxRadiusInKilometres) {
      surroundingSites = LocationService.getSurroundingSites(newLocation.point);
      surroundingSitesRadius = surroundingSitesRadius * 2;
    }

    surroundingSites = surroundingSites.take(10).toList();

    emit(state.copyWith(
      currentLocation: newLocation,
      blocStatus: NearbyLocationStatus.searchComplete,
      surroundingSites: surroundingSites,
    ));

    await HiveService().updateNearbyAirQualityReadings(surroundingSites);
  }
}
