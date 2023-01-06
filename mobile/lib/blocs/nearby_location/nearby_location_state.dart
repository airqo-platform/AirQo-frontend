part of 'nearby_location_bloc.dart';

enum NearbyLocationStatus {
  initial,
  loaded,
  searching,
  error,
}

class NearbyLocationState extends Equatable {
  const NearbyLocationState._({
    this.locationAirQuality,
    this.blocStatus = NearbyLocationStatus.initial,
    this.error = NearbyAirQualityError.none,
  });

  const NearbyLocationState({
    this.locationAirQuality,
    this.blocStatus = NearbyLocationStatus.initial,
    this.error = NearbyAirQualityError.none,
  });

  NearbyLocationState copyWith({
    AirQualityReading? locationAirQuality,
    NearbyLocationStatus? blocStatus,
    NearbyAirQualityError? error,
  }) {
    return NearbyLocationState(
      locationAirQuality: locationAirQuality ?? this.locationAirQuality,
      blocStatus: blocStatus ?? this.blocStatus,
      error: error ?? this.error,
    );
  }

  const NearbyLocationState.initial() : this._();

  final AirQualityReading? locationAirQuality;
  final NearbyLocationStatus blocStatus;
  final NearbyAirQualityError error;

  @override
  List<Object?> get props => [
        error,
        locationAirQuality,
        blocStatus,
      ];
}
