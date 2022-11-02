import 'package:app/models/models.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../services/hive_service.dart';
import '../../services/location_service.dart';
import '../../services/native_api.dart';
import '../../utils/exception.dart';
import 'nearby_location_event.dart';
import 'nearby_location_state.dart';

class NearbyLocationBloc
    extends Bloc<NearbyLocationEvent, NearbyLocationState> {
  NearbyLocationBloc()
      : super(const NearbyLocationStateSuccess(airQualityReadings: [])) {
    on<SearchNearbyLocations>(_onSearch);
    on<CheckNearbyLocations>(_onCheckNearbyLocations);
  }

  Future<void> _onSearch(
    SearchNearbyLocations _,
    Emitter<NearbyLocationState> emit,
  ) async {
    try {
      emit(SearchingNearbyLocationsState());

      final locationEnabled =
          await PermissionService.checkPermission(AppPermission.location);

      if (!locationEnabled) {
        return emit(
          const NearbyLocationStateError(
            error: NearbyAirQualityError.locationDenied,
          ),
        );
      }

      final profile = await Profile.getProfile();
      if (!profile.preferences.location) {
        return emit(
          const NearbyLocationStateError(
            error: NearbyAirQualityError.locationNotAllowed,
          ),
        );
      }

      final nearbyAirQualityReadings =
          await LocationService.getNearbyAirQualityReadings(top: 8);

      await HiveService.updateNearbyAirQualityReadings(
        nearbyAirQualityReadings,
      );

      if (nearbyAirQualityReadings.isEmpty) {
        return emit(
          const NearbyLocationStateError(
            error: NearbyAirQualityError.noNearbyAirQualityReadings,
          ),
        );
      }

      return emit(
        NearbyLocationStateSuccess(
          airQualityReadings: nearbyAirQualityReadings,
        ),
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );

      return emit(
        const NearbyLocationStateError(
          error: NearbyAirQualityError.locationDenied,
        ),
      );
    }
  }

  Future<void> _onCheckNearbyLocations(
    CheckNearbyLocations _,
    Emitter<NearbyLocationState> emit,
  ) async {
    try {
      final locationEnabled =
          await PermissionService.checkPermission(AppPermission.location);
      final profile = await Profile.getProfile();

      if (!locationEnabled || !profile.preferences.location) {
        return;
      }

      final nearbyAirQualityReadings =
          await LocationService.getNearbyAirQualityReadings(top: 8);

      if (nearbyAirQualityReadings.isNotEmpty) {
        await HiveService.updateNearbyAirQualityReadings(
          nearbyAirQualityReadings,
        );
        emit(SearchingNearbyLocationsState());

        return emit(
          NearbyLocationStateSuccess(
            airQualityReadings: nearbyAirQualityReadings,
          ),
        );
      }

      return;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }
}
