import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:json_annotation/json_annotation.dart';

part 'kya_bloc.g.dart';
part 'kya_event.dart';
part 'kya_state.dart';

class KyaBloc extends HydratedBloc<KyaEvent, KyaState> {
  KyaBloc() : super(const KyaState(lessons: [], quizzes: [])) {
    on<UpdateKyaProgress>(_onUpdateKyaProgress);
    on<ClearKya>(_onClearKya);
    on<FetchKya>(_onFetchKya);
  }

  Future<void> _onFetchKya(
    FetchKya _,
    Emitter<KyaState> emit,
  ) async {
    final userId = CustomAuth.getUserId();
    List<KyaLesson> lessons = await AirqoApiClient().fetchKyaLessons(userId);
    emit(state.copyWith(lessons: lessons));
  }

  Future<void> _onClearKya(ClearKya _, Emitter<KyaState> emit) async {
    final userId = CustomAuth.getUserId();
    List<KyaLesson> kyaLessons = await AirqoApiClient().fetchKyaLessons(userId);
    if (kyaLessons.isEmpty) {
      kyaLessons = state.lessons
          .map((e) => e.copyWith(
                status: KyaLessonStatus.todo,
                activeTask: 1,
              ))
          .toList();
    }

    emit(KyaState(lessons: kyaLessons, quizzes: []));
  }

  Future<void> _onUpdateKyaProgress(
    UpdateKyaProgress event,
    Emitter<KyaState> emit,
  ) async {
    KyaLesson kyaLesson = event.kyaLesson;
    Set<KyaLesson> kyaLessons = state.lessons.toSet();
    kyaLessons.remove(kyaLesson);
    kyaLessons.add(kyaLesson);
    emit(state.copyWith(lessons: kyaLessons.toList()));
    if (event.updateRemote) {
      final userId = CustomAuth.getUserId();
      if ((userId.isNotEmpty)) {
        await AirqoApiClient().syncKyaProgress(kyaLessons.toList(), userId);
      }
    }
  }

  @override
  KyaState? fromJson(Map<String, dynamic> json) {
    return KyaState.fromJson(json);
  }

  @override
  Map<String, dynamic>? toJson(KyaState state) {
    return state.toJson();
  }
}
