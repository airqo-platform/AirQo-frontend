part of 'search_history_bloc.dart';

abstract class SearchHistoryEvent extends Equatable {
  const SearchHistoryEvent();
}

class AddSearchHistory extends SearchHistoryEvent {
  const AddSearchHistory(this.airQualityReading);
  final AirQualityReading airQualityReading;

  @override
  List<Object?> get props => [airQualityReading];
}

class SyncSearchHistory extends SearchHistoryEvent {
  const SyncSearchHistory();
  @override
  List<Object?> get props => [];
}

class ClearSearchHistory extends SearchHistoryEvent {
  const ClearSearchHistory();

  @override
  List<Object?> get props => [];
}
