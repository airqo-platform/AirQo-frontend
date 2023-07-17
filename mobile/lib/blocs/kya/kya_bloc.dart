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
    List<KyaProgress> progressFromApi = await sendProgresstoApi(state.toSet());
    final apiKya = await AirqoApiClient().fetchKyaLessons(progressFromApi);
    emit(apiKya);
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
    await sendProgresstoApi(kyaSet);
    emit(kyaSet.toList());
  }

  Future<void> _onCompleteKya(
    CompleteKya event,
    Emitter<List<Kya>> emit,
  ) async {
    Kya kya = event.kya.copyWith(progress: -1);
    Set<Kya> kyaSet = {kya};
    List<Kya> kyaList = kyaSet.toList();
    emit(kyaList);

    await hasNetworkConnection().then((hasConnection) async {
      if (hasConnection) {
        Future.wait([
          CloudAnalytics.logEvent(CloudAnalyticsEvent.completeOneKYA),
        ]);
        await sendProgresstoApi(kyaSet);
      }
    });
  }

  Future<void> _onUpdateKyaProgress(
    UpdateKyaProgress event,
    Emitter<List<Kya>> emit,
  ) async {
    Kya kya = event.kya;

    if (kya.isPendingCompletion() || kya.isComplete()) return;
    double progress = event.progress;

    if (progress < 0 || (progress > kya.lessons.length - 1)) progress = 0;

    Set<Kya> kyaSet = {
      kya.copyWith(progress: progress),
    };
    await sendProgresstoApi(kyaSet);
    emit(kyaSet.toList());
  }

  Future<List<KyaProgress>> sendProgresstoApi(Set<Kya> kyaSet) async {
    List<Kya> kyaList = kyaSet.toList();

    List<Map<String, dynamic>> kyaProgressList = [];
    for (Kya kya in kyaList) {
      Map<String, dynamic> kyaMap = KyaProgress.fromKya(kya).toJson();
      kyaProgressList.add(kyaMap);
    }

    List<KyaProgress> progressFromApi =
        await AirqoApiClient().syncKyaProgress(kyaProgressList);
    return progressFromApi;
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
