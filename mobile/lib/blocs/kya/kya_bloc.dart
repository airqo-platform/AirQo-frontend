import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

part 'kya_event.dart';

class KyaProgressCubit extends Cubit<double> {
  KyaProgressCubit() : super(0);

  void updateProgress(double value) => emit(value);
}

class KyaBloc extends HydratedBloc<KyaEvent, List<Kya>> {
  KyaBloc() : super([]) {
    on<UpdateKyaProgress>(_onUpdateKyaProgress);
    on<CompleteKya>(_onCompleteKya);
    on<PartiallyCompleteKya>(_onPartiallyCompleteKya);
    on<ClearKya>(_onClearKya);
    on<SyncKya>(_onSyncKya);
  }

  Future<void> _onSyncKya(
    SyncKya _,
    Emitter<List<Kya>> emit,
  ) async {
    final cloudKya = await CloudStore.getKya();
    Set<Kya> kya = state.toSet();
    kya.addAll(cloudKya.toSet());

    emit(kya.toList());

    await CloudStore.updateKya(state);
  }

  void _onClearKya(ClearKya _, Emitter<List<Kya>> emit) {
    emit(state.map((e) => e.copyWith(progress: 0)).toList());
  }

  Future<void> _onPartiallyCompleteKya(
    PartiallyCompleteKya event,
    Emitter<List<Kya>> emit,
  ) async {
    Kya kya = event.kya.copyWith(progress: 1);
    Set<Kya> kyaSet = {kya};
    kyaSet.addAll(state);
    emit(kyaSet.toList());

    await CloudStore.updateKya([kya]);
  }

  Future<void> _onCompleteKya(
      CompleteKya event, Emitter<List<Kya>> emit) async {
    Kya kya = event.kya.copyWith(progress: -1);
    Set<Kya> kyaSet = {kya};
    kyaSet.addAll(state);
    emit(kyaSet.toList());

    await hasNetworkConnection().then((hasConnection) {
      if (hasConnection) {
        Future.wait([
          CloudAnalytics.logEvent(CloudAnalyticsEvent.completeOneKYA),
          CloudStore.updateKya([kya]),
        ]);
      }
    });
  }

  Future<void> _onUpdateKyaProgress(
    UpdateKyaProgress event,
    Emitter<List<Kya>> emit,
  ) async {
    Kya kya = event.kya.copyWith();

    if (kya.isPartiallyComplete() || kya.isComplete()) return;
    int index = event.visibleCardIndex;

    if (index < 0 || (index > kya.lessons.length - 1)) index = 0;

    Set<Kya> kyaSet = {
      kya.copyWith(progress: kya.getProgress(event.visibleCardIndex))
    };
    kyaSet.addAll(state);
    emit(kyaSet.toList());

    await CloudStore.updateKya([kya]);
  }

  @override
  List<Kya>? fromJson(Map<String, dynamic> json) {
    return KyaList.fromJson(json).data;
  }

  @override
  Map<String, dynamic>? toJson(List<Kya> state) {
    return KyaList(data: state).toJson();
  }
}
