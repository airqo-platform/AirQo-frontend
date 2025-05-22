part of 'map_bloc.dart';

abstract class MapState extends Equatable {
  const MapState();

  @override
  List<Object?> get props => [];
}

class MapInitial extends MapState {}

class MapLoading extends MapState {
  final MapLoaded? previousState;
  
  const MapLoading({this.previousState});
  
  @override
  List<Object?> get props => [previousState];
}

class MapRefreshing extends MapLoaded {
  const MapRefreshing(super.response);
}

class MapLoaded extends MapState {
  final AirQualityResponse response;

  const MapLoaded(this.response);
  
  @override
  List<Object> get props => [response];
}

class MapLoadedFromCache extends MapLoaded {
  final DateTime cacheTimestamp;
  
  MapLoadedFromCache(super.response)
      : cacheTimestamp = DateTime.now();
  
  @override
  List<Object> get props => [response, cacheTimestamp];
}

class MapLoadedWithError extends MapLoaded {
  final String errorMessage;
  
  const MapLoadedWithError(
    super.response, {
    required this.errorMessage,
  });
  
  @override
  List<Object> get props => [response, errorMessage];
}

class MapLoadingError extends MapState {
  final String message;

  const MapLoadingError(this.message);
  
  @override
  List<Object> get props => [message];
}