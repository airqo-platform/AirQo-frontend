part of 'map_bloc.dart';

abstract class MapEvent extends Equatable {
  const MapEvent();

  @override
  List<Object> get props => [];
}

class LoadMap extends MapEvent {
  final bool forceRefresh;
  
  const LoadMap({this.forceRefresh = false});
  
  @override
  List<Object> get props => [forceRefresh];
}

class RefreshMap extends MapEvent {}