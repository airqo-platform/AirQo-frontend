import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

part 'location_history_event.dart';

class LocationHistoryBloc
    extends HydratedBloc<LocationHistoryEvent, List<LocationHistory>> {
  LocationHistoryBloc() : super([]) {
    on<SyncLocationHistory>(_onSyncLocationHistory);
    on<DeleteLocationHistory>(_onDeleteLocationHistory);
  }

  void _onDeleteLocationHistory(
      DeleteLocationHistory _, Emitter<List<LocationHistory>> emit) {
    emit([]);
  }

  Future<void> _onSyncLocationHistory(
    SyncLocationHistory _,
    Emitter<List<LocationHistory>> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return;
    }
    List<LocationHistory> analytics = await CloudStore.getCloudAnalytics();

    Set<LocationHistory> analyticsSet = state.toSet();
    analyticsSet.addAll(analytics.toSet());

    return emit(analyticsSet.toList());
  }

  @override
  List<LocationHistory>? fromJson(Map<String, dynamic> json) {
    return LocationHistoryList.fromJson(json).data;
  }

  @override
  Map<String, dynamic>? toJson(List<LocationHistory> state) {
    return LocationHistoryList(data: state).toJson();
  }
}
