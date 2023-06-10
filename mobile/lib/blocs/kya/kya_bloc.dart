import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

part 'kya_event.dart';

class KyaProgressCubit extends Cubit<double> {
  KyaProgressCubit() : super(0);

  void updateProgress(double value) => emit(value);
}

class KyaBloc extends HydratedBloc<KyaEvent, List<KyaLesson>> {
  KyaBloc() : super([]) {
    on<UpdateKyaLessonStatus>(_onUpdateKyaLessonStatus);
    on<UpdateKyaTaskStatus>(_onUpdateKyaTaskStatus);
    on<LoadKyaLessons>(_onLoadKyaLessons);
    on<ResetKyaLessons>(_onResetKyaLessons);
  }

  Future<void> _onLoadKyaLessons(
      LoadKyaLessons event,
      Emitter<List<KyaLesson>> emit,
      ) async {
    try {
      final lessons = await AirqoApiClient().getKyaLessons(event.userId);
      emit(lessons);
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  void _onResetKyaLessons(ResetKyaLessons _, Emitter<List<KyaLesson>> emit) {
    List<KyaLesson> lessons = List.of(state)
        .map((lesson) => lesson
      ..copyWith(status: KyaLessonStatus.todo)
      ..tasks
          .map((task) => task.copyWith(status: KyaTaskStatus.todo))
          .toList())
        .toSet()
        .toList();
    emit(lessons);
  }

  void _onUpdateKyaTaskStatus(
    UpdateKyaTaskStatus event,
    Emitter<List<KyaLesson>> emit,
  ) {
    List<KyaLesson> lessons = List.of(state);
    KyaLesson kyaLesson =
    lessons.firstWhere((lesson) => lesson.id == event.kyaLesson.id);
    KyaTask kyaTask =
        kyaLesson.tasks.firstWhere((task) => task.id == event.kyaTask.id);
    kyaTask = kyaTask.copyWith(status: event.status);

    kyaLesson.tasks.remove(kyaTask);
    kyaLesson.tasks.add(kyaTask);

    lessons.remove(kyaLesson);
    lessons.add(kyaLesson);

    emit(lessons);
  }

  Future<void> _onUpdateKyaLessonStatus(
    UpdateKyaLessonStatus event,
    Emitter<List<KyaLesson>> emit,
  ) async {
    List<KyaLesson> lessons = List.of(state);
    KyaLesson kyaLesson = lessons.firstWhere((lesson) => lesson.id == event.kyaLesson.id,);
    kyaLesson = kyaLesson.copyWith(status: event.status);
    lessons.remove(kyaLesson);
    lessons.add(kyaLesson);
    emit(lessons);
  }

  @override
  List<KyaLesson>? fromJson(Map<String, dynamic> json) {
    return KyaLessons.fromJson(json).lessons;
  }

  @override
  Map<String, dynamic>? toJson(List<KyaLesson> state) {
    return KyaLessons(lessons: state).toJson();
  }
}
