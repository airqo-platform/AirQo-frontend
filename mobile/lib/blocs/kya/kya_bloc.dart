import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
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
    on<SyncKyaLessons>(_onSyncKyaLessons);
    on<ClearKyaLessons>(_onClearKyaLessons);
  }

  void _onUpdateKyaTaskStatus(
    UpdateKyaTaskStatus event,
    Emitter<List<KyaLesson>> emit,
  ) {
    List<KyaLesson> kyaLessons = List.of(state);
    KyaLesson kyaLesson =
        kyaLessons.firstWhere((lesson) => lesson.id == event.kyaLesson.id);
    KyaTask kyaTask =
        kyaLesson.tasks.firstWhere((task) => task.id == event.kyaTask.id);
    kyaTask = kyaTask.copyWith(status: event.status);

    kyaLesson.tasks.remove(kyaTask);
    kyaLesson.tasks.add(kyaTask);

    kyaLessons.remove(kyaLesson);
    kyaLessons.add(kyaLesson);

    emit(kyaLessons);
  }

  Future<void> _onUpdateKyaLessonStatus(
    UpdateKyaLessonStatus event,
    Emitter<List<KyaLesson>> emit,
  ) async {
    List<KyaLesson> kyaLessons = List.of(state);
    KyaLesson kyaLesson =
        kyaLessons.firstWhere((lesson) => lesson.id == event.kyaLesson.id);
    kyaLesson = kyaLesson.copyWith(status: event.status);
    kyaLessons.remove(kyaLesson);
    kyaLessons.add(kyaLesson);

    emit(kyaLessons);
    await CloudStore.updateKyaLessons(state);
  }

  Future<void> _onSyncKyaLessons(
    SyncKyaLessons _,
    Emitter<List<KyaLesson>> emit,
  ) async {
    final cloudKya = await CloudStore.getKyaLessons();
    List<KyaLesson> kyaLessons = List.of(state);
    kyaLessons.addAll(cloudKya);
    kyaLessons = kyaLessons.toSet().toList();
    emit(kyaLessons);
    await CloudStore.updateKyaLessons(kyaLessons);
  }

  void _onClearKyaLessons(ClearKyaLessons _, Emitter<List<KyaLesson>> emit) {
    List<KyaLesson> kyaLessons = List.of(state)
        .map((lesson) => lesson
          ..copyWith(status: KyaLessonStatus.todo)
          ..tasks
              .map((task) => task.copyWith(status: KyaTaskStatus.todo))
              .toList())
        .toSet()
        .toList();
    emit(kyaLessons);
  }

  @override
  List<KyaLesson>? fromJson(Map<String, dynamic> json) {
    return KyaLessonsList.fromJson(json).lessons;
  }

  @override
  Map<String, dynamic>? toJson(List<KyaLesson> state) {
    return KyaLessonsList(lessons: state).toJson();
  }
}
