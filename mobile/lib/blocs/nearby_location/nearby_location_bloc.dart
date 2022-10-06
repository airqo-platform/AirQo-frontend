import 'package:app/models/models.dart';
import 'package:bloc/bloc.dart';
import 'package:permission_handler/permission_handler.dart';

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
  }

  Future<void> _onSearch(
    SearchNearbyLocations event,
    Emitter<NearbyLocationState> emit,
  ) async {
    try {
      emit(SearchingNearbyLocationsState());

      final profile = await Profile.getProfile();
      if (!profile.preferences.location) {
        return emit(
          const NearbyLocationStateError(
            error: NearbyAirQualityError.locationNotAllowed,
          ),
        );
      }

      final locationEnabled =
          await PermissionService.checkPermission(AppPermission.location);

      if (!locationEnabled) {
        return emit(
          const NearbyLocationStateError(
            error: NearbyAirQualityError.locationDenied,
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
}
