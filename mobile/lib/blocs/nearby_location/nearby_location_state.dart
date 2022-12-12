part of 'nearby_location_bloc.dart';

enum NearbyLocationStatus {
  initial,
  loaded,
  searching,
  error,
}

class NearbyLocationState extends Equatable {
  const NearbyLocationState._({
    this.airQualityReadings = const [],
    this.blocStatus = NearbyLocationStatus.initial,
    this.error = NearbyAirQualityError.none,
  });

  const NearbyLocationState({
    this.airQualityReadings = const [],
    this.blocStatus = NearbyLocationStatus.initial,
    this.error = NearbyAirQualityError.none,
  });

  NearbyLocationState copyWith({
    List<AirQualityReading>? airQualityReadings,
    NearbyLocationStatus? blocStatus,
    NearbyAirQualityError? error,
  }) {
    return NearbyLocationState(
      airQualityReadings: airQualityReadings ?? this.airQualityReadings,
      blocStatus: blocStatus ?? this.blocStatus,
      error: error ?? this.error,
    );
  }

  const NearbyLocationState.initial() : this._();

  final List<AirQualityReading> airQualityReadings;
  final NearbyLocationStatus blocStatus;
  final NearbyAirQualityError error;

  @override
  List<Object?> get props => [
        error,
        airQualityReadings,
        blocStatus,
      ];
}
