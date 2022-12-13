part of 'nearby_location_bloc.dart';

abstract class NearbyLocationState extends Equatable {
  const NearbyLocationState();

  @override
  List<Object> get props => [];
}

class SearchingNearbyLocationsState extends NearbyLocationState {}

class NearbyLocationStateSuccess extends NearbyLocationState {
  const NearbyLocationStateSuccess({required this.airQualityReadings});

  final List<AirQualityReading> airQualityReadings;

  @override
  List<Object> get props => [airQualityReadings];

  @override
  String toString() => ' items: ${airQualityReadings.length}';
}

class NearbyLocationStateError extends NearbyLocationState {
  const NearbyLocationStateError({required this.error});

  final NearbyAirQualityError error;

  @override
  List<Object> get props => [error];
}
