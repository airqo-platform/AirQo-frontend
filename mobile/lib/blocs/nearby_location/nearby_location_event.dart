part of 'nearby_location_bloc.dart';

abstract class NearbyLocationEvent extends Equatable {
  const NearbyLocationEvent();
}

class SearchLocationAirQuality extends NearbyLocationEvent {
  const SearchLocationAirQuality();

  @override
  List<Object> get props => [];
}

class DismissErrorMessage extends NearbyLocationEvent {
  const DismissErrorMessage();

  @override
  List<Object> get props => [];
}
