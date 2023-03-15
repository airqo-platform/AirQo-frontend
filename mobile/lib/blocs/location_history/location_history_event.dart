part of 'location_history_bloc.dart';

abstract class LocationHistoryEvent extends Equatable {
  const LocationHistoryEvent();
}

class AddLocationHistory extends LocationHistoryEvent {
  const AddLocationHistory(this.airQualityReading);
  final AirQualityReading airQualityReading;

  @override
  List<Object?> get props => [airQualityReading];
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
