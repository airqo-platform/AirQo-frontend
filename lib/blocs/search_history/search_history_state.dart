part of 'search_history_bloc.dart';

class SearchHistoryState extends Equatable {
  const SearchHistoryState({
    this.history = const [],
  });

  final List<SearchHistory> history;

  SearchHistoryState copyWith({List<SearchHistory>? history}) {
    return SearchHistoryState(history: history ?? this.history);
  }

  @override
  List<Object> get props {
    List<String> ids = history.map((e) => e.placeId).toList();
    List<AirQualityReading> airQualityReadings = history
        .where((element) => element.airQualityReading != null)
        .map((e) => e.airQualityReading as AirQualityReading)
        .toList();
    ids.addAll(airQualityReadings.map((e) => e.placeId).toList());
    ids.addAll(airQualityReadings.map((e) => e.referenceSite).toList());
    return ids;
  }
}
