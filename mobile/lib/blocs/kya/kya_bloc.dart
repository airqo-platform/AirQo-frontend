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

class KyaBloc extends HydratedBloc<KyaEvent, List<KyaLesson>> {
  KyaBloc() : super([]) {
    on<UpdateKyaProgress>(_onUpdateKyaProgress);
    on<CompleteKya>(_onCompleteKya);
    on<PartiallyCompleteKya>(_onPartiallyCompleteKya);
    on<ClearKya>(_onClearKya);
    on<FetchKya>(_onFetchKya);
  }

  Future<void> _onFetchKya(
    FetchKya _,
    Emitter<List<KyaLesson>> emit,
  ) async {
    final apiKya = await AirqoApiClient().fetchKyaLessons();
    emit(apiKya);
  }

  void _onClearKya(ClearKya _, Emitter<List<KyaLesson>> emit) {
    emit(state.map((e) => e.copyWith(progress: 0)).toList());
  }

  Future<void> _onPartiallyCompleteKya(
    PartiallyCompleteKya event,
    Emitter<List<KyaLesson>> emit,
  ) async {
    KyaLesson kya = event.kya.copyWith(progress: 1);
    Set<KyaLesson> kyaSet = {kya};
    await sendProgresstoApi(kyaSet);
    emit(kyaSet.toList());
  }

  Future<void> _onCompleteKya(
    CompleteKya event,
    Emitter<List<KyaLesson>> emit,
  ) async {
    KyaLesson kya = event.kya.copyWith(progress: -1);
    Set<KyaLesson> kyaSet = {kya};
    List<KyaLesson> kyaList = kyaSet.toList();
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
    Emitter<List<KyaLesson>> emit,
  ) async {
    KyaLesson kya = event.kya;

    if (kya.isPendingCompletion() || kya.isComplete()) return;
    double progress = event.progress;


    Set<KyaLesson> kyaSet = {
      kya.copyWith(progress: progress),
    };
    await sendProgresstoApi(kyaSet);
    emit(kyaSet.toList());
  }

  Future<void> sendProgresstoApi(Set<KyaLesson> kyaSet) async {
    List<KyaLesson> kyaList = kyaSet.toList();

    List<Map<String, dynamic>> kyaProgressList = [];
    for (KyaLesson kya in kyaList) {
      Map<String, dynamic> kyaMap = KyaProgress.fromKya(kya).toJson();
      kyaProgressList.add(kyaMap);
    }
    await AirqoApiClient().syncKyaProgress(kyaProgressList);
    return;
  }

  @override
  List<KyaLesson>? fromJson(Map<String, dynamic> json) {
    return KyaList.fromJson(json).data;
  }

  @override
  Map<String, dynamic>? toJson(List<KyaLesson> state) {
    return KyaList(data: state).toJson();
  }
}
