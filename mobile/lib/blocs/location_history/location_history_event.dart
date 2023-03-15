part of 'location_history_bloc.dart';

abstract class LocationHistoryEvent extends Equatable {
  const LocationHistoryEvent();
}

class SyncLocationHistory extends LocationHistoryEvent {
  const SyncLocationHistory();
  @override
  List<Object?> get props => [];
}

class DeleteLocationHistory extends LocationHistoryEvent {
  const DeleteLocationHistory();
  @override
  List<Object?> get props => [];
}
