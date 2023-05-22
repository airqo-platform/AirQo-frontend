part of 'nearby_location_bloc.dart';

abstract class NearbyLocationEvent extends Equatable {
  const NearbyLocationEvent();
}

class SearchLocationAirQuality extends NearbyLocationEvent {
  const SearchLocationAirQuality({this.position});
  final Position? position;

  @override
  List<Object?> get props => [position];
}

class UpdateLocationAirQuality extends NearbyLocationEvent {
  const UpdateLocationAirQuality();

  @override
  List<Object> get props => [];
}

class DismissErrorMessage extends NearbyLocationEvent {
  const DismissErrorMessage();

  @override
  List<Object> get props => [];
}
