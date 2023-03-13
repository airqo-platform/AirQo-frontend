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
  KyaBloc() : super(const KyaState()) {
    on<UpdateKyaProgress>(_onUpdateKyaProgress);
    on<CompleteKya>(_onCompleteKya);
    on<PartiallyCompleteKya>(_onPartiallyCompleteKya);
    on<ClearKya>(_onClearKya);
    on<RefreshKya>(_onRefreshKya);
  }

  Future<void> _onRefreshKya(
    RefreshKya _,
    Emitter<KyaState> emit,
  ) async {
    List<Kya> kya = HiveService.getKya();
    emit(const KyaState().copyWith(kya: kya));

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection && kya.isEmpty) {
      emit(state.copyWith(status: KyaStatus.noInternetConnection));

      return;
    }

    final cloudKya = await CloudStore.getKya();
    kya.addAll(cloudKya);
    _updateState(emit, kya);
  }

  Future<void> _onClearKya(
    ClearKya _,
    Emitter<KyaState> emit,
  ) async {
    List<Kya> kya = Hive.box<Kya>(HiveBox.kya).values.toList();
    kya = kya.map((e) => e.copyWith(progress: 0)).toList();
    emit(const KyaState().copyWith(kya: kya));
    await HiveService.loadKya(kya);
  }

  Future<void> _updateState(Emitter<KyaState> emit, List<Kya> kya) async {
    List<Kya> updatedKya = kya.removeDuplicates();
    emit(state.copyWith(kya: updatedKya));
    await HiveService.loadKya(updatedKya);
  }

  Future<void> _onPartiallyCompleteKya(
    PartiallyCompleteKya event,
    Emitter<KyaState> emit,
  ) async {
    Kya kya = event.kya.copyWith(progress: 1);
    List<Kya> stateKya = List.of(state.kya);
    stateKya.add(kya);

    await _updateState(emit, stateKya);
    await CloudStore.updateKyaProgress(kya);
  }

  Future<void> _onCompleteKya(CompleteKya event, Emitter<KyaState> emit) async {
    Kya kya = event.kya.copyWith(progress: -1);
    List<Kya> stateKya = List.of(state.kya);
    stateKya.add(kya);

    await _updateState(emit, stateKya);

    await hasNetworkConnection().then((hasConnection) {
      if (hasConnection) {
        Future.wait([
          CloudAnalytics.logEvent(CloudAnalyticsEvent.completeOneKYA),
          CloudStore.updateKyaProgress(kya),
        ]);
      }
    });
  }

  Future<void> _onUpdateKyaProgress(
    UpdateKyaProgress event,
    Emitter<KyaState> emit,
  ) async {
    Kya kya = event.kya.copyWith();

    if (kya.isPartiallyComplete() || kya.isComplete()) return;
    int index = event.visibleCardIndex;

    if (index < 0 || (index > kya.lessons.length - 1)) index = 0;

    List<Kya> stateKya = List.of(state.kya);
    stateKya
        .add(kya.copyWith(progress: kya.getProgress(event.visibleCardIndex)));

    await _updateState(emit, stateKya);
    await CloudStore.updateKyaProgress(kya);
  }
}
