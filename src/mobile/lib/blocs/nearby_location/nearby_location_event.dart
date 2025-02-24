part of 'nearby_location_bloc.dart';

abstract class NearbyLocationEvent extends Equatable {
  const NearbyLocationEvent();
}

class SearchLocationAirQuality extends NearbyLocationEvent {
  const SearchLocationAirQuality({this.newLocation});
  final CurrentLocation? newLocation;

  @override
  List<Object?> get props => [newLocation];
}

class DismissErrorMessage extends NearbyLocationEvent {
  const DismissErrorMessage();

  @override
  List<Object> get props => [];
}
