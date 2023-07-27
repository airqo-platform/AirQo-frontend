import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

part 'search_history_event.dart';
part 'search_history_state.dart';

class SearchHistoryBloc
    extends HydratedBloc<SearchHistoryEvent, SearchHistoryState> {
  SearchHistoryBloc() : super(const SearchHistoryState()) {
    on<SyncSearchHistory>(_onSyncSearchHistory);
    on<AddSearchHistory>(_onAddSearchHistory);
    on<ClearSearchHistory>(_onClearSearchHistory);
  }

  void _onClearSearchHistory(
    ClearSearchHistory _,
    Emitter<SearchHistoryState> emit,
  ) {
    emit(const SearchHistoryState());
  }

  Future<void> _onAddSearchHistory(
    AddSearchHistory event,
    Emitter<SearchHistoryState> emit,
  ) async {
    List<SearchHistory> history = List.of(state.history);
    history.add(SearchHistory.fromAirQualityReading(event.airQualityReading));
    history = history.toSet().toList();
    history = await history.attachedAirQualityReadings();
    emit(state.copyWith(history: history));
    String userId = CustomAuth.getUserId();
    if (userId.isNotEmpty) {
      await AirqoApiClient().syncSearchHistory(
        history,
        userId,
      );
    }
  }

  Future<void> _onSyncSearchHistory(
    SyncSearchHistory _,
    Emitter<SearchHistoryState> emit,
  ) async {
    String userId = CustomAuth.getUserId();
    AirqoApiClient apiClient = AirqoApiClient();
    List<SearchHistory> apiSearchHistory = [];
    if (userId.isNotEmpty) {
      apiSearchHistory = await apiClient.fetchSearchHistory(userId);
    }
    List<SearchHistory> history = List.of(state.history);
    history.addAll(apiSearchHistory);
    history = history.toSet().toList();
    history = await history.attachedAirQualityReadings();
    emit(state.copyWith(history: history));
    if (userId.isNotEmpty) {
      await apiClient.syncSearchHistory(
        history,
        userId,
      );
    }
  }

  @override
  SearchHistoryState? fromJson(Map<String, dynamic> json) {
    List<dynamic> history = json["history"] as List<dynamic>;
    List<SearchHistory> searchHistory = [];
    for (dynamic value in history) {
      try {
        searchHistory.add(SearchHistory.fromJson(
          value as Map<String, dynamic>,
        ));
      } catch (exception, stackTrace) {
        logException(
          exception,
          stackTrace,
        );
      }
    }

    return SearchHistoryState(history: searchHistory);
  }

  @override
  Map<String, dynamic>? toJson(SearchHistoryState state) {
    return {"history": state.history.map((e) => e.toJson())};
  }
}
