import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

part 'kya_event.dart';

class KyaProgressCubit extends Cubit<int> {
  KyaProgressCubit() : super(0);

  void updateProgress(int value) => emit(value);
}

class KyaBloc extends HydratedBloc<KyaEvent, List<KyaLesson>> {
  KyaBloc() : super([]) {
    on<UpdateKyaProgress>(_onUpdateKyaProgress);
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

  Future<void> _onClearKya(ClearKya _, Emitter<List<KyaLesson>> emit) async {
    final apiKya = await AirqoApiClient().fetchKyaLessons();
    if (apiKya.isEmpty) {
      emit(state.map((e) => e.copyWith(status: KyaLessonStatus.todo)).toList());
    } else {
      emit(apiKya);
    }
  }

  Future<void> _onUpdateKyaProgress(
    UpdateKyaProgress event,
    Emitter<List<KyaLesson>> emit,
  ) async {
    KyaLesson kya = event.kyaLesson;
    Set<KyaLesson> kyaLessons = state.toSet();
    kyaLessons.remove(kya);
    kyaLessons.add(kya);
    await AirqoApiClient().syncKyaProgress(kyaLessons.toList());
    emit(kyaLessons.toList());
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
