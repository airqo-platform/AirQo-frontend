part of 'map_bloc.dart';

sealed class MapState extends Equatable {
  const MapState();

  @override
  List<Object> get props => [];
}

final class MapInitial extends MapState {}

class MapLoading extends MapState {}

class MapLoaded extends MapState {
  final AirQualityResponse response;

  const MapLoaded(this.response);
}

class MapLoadingError extends MapState {
  final String message;

  const MapLoadingError(this.message);
}
