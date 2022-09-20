import 'package:equatable/equatable.dart';

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
