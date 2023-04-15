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
    on<UpdateLocationAirQuality>(_onUpdateLocationAirQuality);
    on<DismissErrorMessage>(_onDismissErrorMessage);
  }

  void _onDismissErrorMessage(
    DismissErrorMessage _,
    Emitter<NearbyLocationState> emit,
  ) {
    return emit(state.copyWith(
      showErrorMessage: false,
      locationAirQuality: state.locationAirQuality,
    ));
  }

  Future<bool> _isLocationEnabled(Emitter<NearbyLocationState> emit) async {
    final locationGranted = await LocationService.locationGranted();
    if (!locationGranted) {
      emit(state.copyWith(
        blocStatus: NearbyLocationStatus.locationDenied,
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

  Future<void> _onUpdateLocationAirQuality(
    UpdateLocationAirQuality _,
    Emitter<NearbyLocationState> emit,
  ) async {
    List<AirQualityReading> nearByAirQualityReadings =
        HiveService.getNearbyAirQualityReadings();
    List<AirQualityReading> airQualityReadings =
        HiveService.getAirQualityReadings();

    nearByAirQualityReadings = nearByAirQualityReadings
        .map((element) {
          AirQualityReading referenceReading = airQualityReadings.firstWhere(
            (reading) => reading.referenceSite == element.referenceSite,
            orElse: () => element,
          );

          return element.copyWith(
            pm10: referenceReading.pm10,
            pm2_5: referenceReading.pm2_5,
            dateTime: referenceReading.dateTime,
          );
        })
        .toList()
        .sortByDistanceToReferenceSite();

    final bool isLocationEnabled = await _isLocationEnabled(emit);

    if (isLocationEnabled) {
      emit(state.copyWith(
        locationAirQuality: nearByAirQualityReadings.isEmpty
            ? null
            : nearByAirQualityReadings.first,
      ));
    }

    await HiveService.updateNearbyAirQualityReadings(nearByAirQualityReadings);
  }

  Future<void> _onSearchLocationAirQuality(
    SearchLocationAirQuality event,
    Emitter<NearbyLocationState> emit,
  ) async {
    emit(state.copyWith(
      locationAirQuality: state.locationAirQuality,
      blocStatus: NearbyLocationStatus.searching,
      showErrorMessage: true,
    ));

    final bool isLocationEnabled = await _isLocationEnabled(emit);
    if (!isLocationEnabled) {
      await HiveService.updateNearbyAirQualityReadings([]);

      return;
    }

    List<AirQualityReading> airQualityReadings =
        await LocationService.getNearbyAirQualityReadings(
      position: event.position,
    );

    airQualityReadings = airQualityReadings.sortByDistanceToReferenceSite();

    emit(state.copyWith(
      blocStatus: NearbyLocationStatus.searchComplete,
      locationAirQuality:
          airQualityReadings.isEmpty ? null : airQualityReadings.first,
    ));

    await HiveService.updateNearbyAirQualityReadings(airQualityReadings);
  }
}
