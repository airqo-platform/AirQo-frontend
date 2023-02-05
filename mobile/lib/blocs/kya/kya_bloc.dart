import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

part 'kya_event.dart';
part 'kya_state.dart';

class KyaBloc extends Bloc<KyaEvent, KyaState> {
  KyaBloc() : super(const KyaState.initial()) {
    on<UpdateKyaProgress>(_onUpdateKyaProgress);
    on<ClearKya>(_onClearKya);
    on<FetchKya>(_onFetchKya);
    on<RefreshKya>(_onRefreshKya);
  }

  Future<void> _onRefreshKya(
    RefreshKya _,
    Emitter<KyaState> emit,
  ) async {
    List<Kya> kya = Hive.box<Kya>(HiveBox.kya).values.toList();
    if (kya.isEmpty) {
      final cloudKya = await CloudStore.getKya();
      kya.addAll(cloudKya);
    }
    kya = kya.map((e) => e.copyWith(progress: 0)).toList();
    emit(const KyaState.initial().copyWith(kya: kya));
    await HiveService.loadKya(kya);
  }

  Future<void> _onFetchKya(
    FetchKya _,
    Emitter<KyaState> emit,
  ) async {
    final kya = await CloudStore.getKya();

    return emit(const KyaState.initial().copyWith(kya: kya));
  }

  Future<void> _onClearKya(
    ClearKya _,
    Emitter<KyaState> emit,
  ) async {
    List<Kya> kya = Hive.box<Kya>(HiveBox.kya).values.toList();
    kya = kya.map((e) => e.copyWith(progress: 0)).toList();
    emit(const KyaState.initial().copyWith(kya: kya));
    await HiveService.loadKya(kya);
  }

  Future<void> _updateState(Emitter<KyaState> emit, List<Kya> kya) async {
    kya = kya.removeDuplicates();
    emit(state.copyWith(kya: kya));
    await HiveService.loadKya(kya);
  }

  Future<void> _onUpdateKyaProgress(
    UpdateKyaProgress event,
    Emitter<KyaState> emit,
  ) async {
    Kya kya = event.kya;
    if (kya.isComplete()) {
      return;
    }
    double progress = kya.isPartiallyComplete()
        ? -1
        : kya.getProgress(event.visibleCardIndex);
    kya = kya.copyWith(progress: progress);

    List<Kya> stateKya = state.kya;
    stateKya.add(kya);
    await _updateState(emit, stateKya);

    if (kya.isComplete()) {
      final hasConnection = await hasNetworkConnection();
      if (hasConnection) {
        await Future.wait([
          CloudAnalytics.logEvent(Event.completeOneKYA),
          CloudStore.updateKyaProgress(kya),
        ]);
      }
    }
  }
}
