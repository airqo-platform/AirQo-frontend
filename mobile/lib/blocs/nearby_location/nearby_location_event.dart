part of 'nearby_location_bloc.dart';

abstract class NearbyLocationEvent extends Equatable {
  const NearbyLocationEvent();
}

class SearchNearbyLocations extends NearbyLocationEvent {
  const SearchNearbyLocations();

  @override
  List<Object> get props => ['reset'];

  @override
  String toString() => 'Search nearby locations';
}

class CheckNearbyLocations extends NearbyLocationEvent {
  const CheckNearbyLocations();

  @override
  List<Object> get props => ['reset'];

  @override
  String toString() => 'Check nearby locations';
}
