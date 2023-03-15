import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

part 'location_history_event.dart';

class LocationHistoryBloc
    extends HydratedBloc<LocationHistoryEvent, List<LocationHistory>> {
  LocationHistoryBloc() : super([]) {
    on<SyncLocationHistory>(_onSyncLocationHistory);
    on<AddLocationHistory>(_onAddLocationHistory);
    on<DeleteLocationHistory>(_onDeleteLocationHistory);
  }

  void _onDeleteLocationHistory(
    DeleteLocationHistory _,
    Emitter<List<LocationHistory>> emit,
  ) {
    emit([]);
  }

  Future<void> _onAddLocationHistory(
    AddLocationHistory event,
    Emitter<List<LocationHistory>> emit,
  ) async {
    List<LocationHistory> locationHistory = [
      LocationHistory.fromAirQualityReading(event.airQualityReading),
    ];

    Set<LocationHistory> locationHistorySet = state.toSet();
    locationHistorySet.addAll(locationHistory.toSet());

    emit(locationHistorySet.toList());

    await CloudStore.updateLocationHistory(state);
  }

  Future<void> _onSyncLocationHistory(
    SyncLocationHistory _,
    Emitter<List<LocationHistory>> emit,
  ) async {
    List<LocationHistory> locationHistory =
        await CloudStore.getLocationHistory();

    Set<LocationHistory> locationHistorySet = state.toSet();
    locationHistorySet.addAll(locationHistory.toSet());

    emit(locationHistorySet.toList());

    await CloudStore.updateLocationHistory(state);
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
