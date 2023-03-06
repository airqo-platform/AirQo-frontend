import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive_flutter/hive_flutter.dart';

part 'nearby_location_event.dart';
part 'nearby_location_state.dart';

class NearbyLocationBloc
    extends Bloc<NearbyLocationEvent, NearbyLocationState> {
  NearbyLocationBloc() : super(const NearbyLocationState.initial()) {
    on<SearchLocationAirQuality>(_onSearchLocationAirQuality);
    on<UpdateLocationAirQuality>(_onUpdateLocationAirQuality);
  }

  Future<bool> _isLocationEnabled(Emitter<NearbyLocationState> emit) async {
    final locationGranted = await LocationService.locationGranted();
    if (!locationGranted) {
      emit(state.copyWith(
        blocStatus: NearbyLocationStatus.error,
        error: NearbyAirQualityError.locationDenied,
      ));

      return false;
    }

    final bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      emit(state.copyWith(
        blocStatus: NearbyLocationStatus.error,
        error: NearbyAirQualityError.locationDisabled,
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
        Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
            .values
            .toList();

    List<AirQualityReading> airQualityReadings = Hive.box<AirQualityReading>(
      HiveBox.airQualityReadings,
    ).values.toList();

    nearByAirQualityReadings = nearByAirQualityReadings
        .map((element) {
          List<AirQualityReading> referenceReadings = airQualityReadings
              .where(
                (reading) => reading.referenceSite == element.referenceSite,
              )
              .toList();
          if (referenceReadings.isNotEmpty) {
            return element.copyWith(
              pm10: referenceReadings.first.pm10,
              pm2_5: referenceReadings.first.pm2_5,
              dateTime: referenceReadings.first.dateTime,
            );
          }

          return element;
        })
        .toList()
        .sortByDistanceToReferenceSite();

    final bool isLocationEnabled = await _isLocationEnabled(emit);

    if (isLocationEnabled) {
      emit(state.copyWith(
        blocStatus: nearByAirQualityReadings.isEmpty
            ? NearbyLocationStatus.error
            : NearbyLocationStatus.loaded,
        error: nearByAirQualityReadings.isEmpty
            ? NearbyAirQualityError.noNearbyAirQualityReadings
            : NearbyAirQualityError.none,
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
      blocStatus: NearbyLocationStatus.searching,
      error: NearbyAirQualityError.none,
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
      blocStatus: airQualityReadings.isEmpty
          ? NearbyLocationStatus.error
          : NearbyLocationStatus.loaded,
      error: airQualityReadings.isEmpty
          ? NearbyAirQualityError.noNearbyAirQualityReadings
          : NearbyAirQualityError.none,
      locationAirQuality:
          airQualityReadings.isEmpty ? null : airQualityReadings.first,
    ));

    await HiveService.updateNearbyAirQualityReadings(airQualityReadings);
  }
}
