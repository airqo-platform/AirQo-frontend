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
    on<LoadKya>(_onLoadKya);
  }

  Future<void> _onLoadKya(
    LoadKya _,
    Emitter<KyaState> emit,
  ) async {
    List<Kya> kya = Hive.box<Kya>(HiveBox.kya).values.toList();
    _updateState(emit, kya);

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection && state.kya.isEmpty) {
      return emit(state.copyWith(
        status: KyaStatus.error,
        error: KyaError.noInternetConnection,
      ));
    }

    final cloudKya = await CloudStore.getKya();
    kya.addAll(cloudKya);
    await _updateState(emit, kya);
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
    kya.progress = kya.isPartiallyComplete()
        ? -1
        : kya.getProgress(event.visibleCardIndex);
    List<Kya> stateKya = state.kya;
    stateKya.add(kya);
    await _updateState(emit, stateKya);

    if (kya.isComplete()) {
      final hasConnection = await hasNetworkConnection();
      if (hasConnection) {
        await Future.wait([
          CloudAnalytics.logEvent(AnalyticsEvent.completeOneKYA),
          CloudStore.updateKya(kya),
        ]);
      }
    }
  }
}
