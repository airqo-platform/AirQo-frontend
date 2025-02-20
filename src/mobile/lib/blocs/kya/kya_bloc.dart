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
  KyaBloc()
      : super(const KyaState(lessons: [], quizzes: [], hasCompleted: {})) {
    on<UpdateKyaProgress>(_onUpdateKyaProgress);
    on<ClearKya>(_onClearKya);
    on<FetchKya>(_onFetchKya);
    on<FetchQuizzes>(_onFetchQuizzes);
    on<UpdateQuizProgress>(_onUpdateQuizProgress);
    on<ClearQuizzes>(_onClearQuizzes);
  }

  Future<void> _onFetchQuizzes(
    FetchQuizzes _,
    Emitter<KyaState> emit,
  ) async {
    final userId = CustomAuth.getUserId();
    List<Quiz> quizzes = await AirqoApiClient().fetchQuizzes(userId);
    emit(state.copyWith(quizzes: quizzes));
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

    emit(KyaState(lessons: kyaLessons, quizzes: const [], hasCompleted: const {}));
  }

  Future<void> _onUpdateKyaProgress(
    UpdateKyaProgress event,
    Emitter<KyaState> emit,
  ) async {
    KyaLesson kyaLesson = event.kyaLesson;
    Set<KyaLesson> kyaLessons = state.lessons.toSet();
    kyaLessons.remove(kyaLesson);
    kyaLessons.add(kyaLesson);

    final updatedHasCompleted = Map<String, bool>.from(state.hasCompleted);
    for (var lesson in kyaLessons) {
      updatedHasCompleted[lesson.id] =
          lesson.status == KyaLessonStatus.complete;
    }

    emit(state.copyWith(
      lessons: kyaLessons.toList(),
      hasCompleted: updatedHasCompleted,
    ));

    if (event.updateRemote) {
      final userId = CustomAuth.getUserId();
      if ((userId.isNotEmpty)) {
        await AirqoApiClient().syncKyaProgress(kyaLessons.toList(), userId);
      }
      if (kyaLesson.status == KyaLessonStatus.complete) {
        CloudAnalytics.logEvent(CloudAnalyticsEvent.completeKYA);
      }
    }
  }

  Future<void> _onClearQuizzes(ClearQuizzes _, Emitter<KyaState> emit) async {
    final userId = CustomAuth.getUserId();
    List<Quiz> quizzes = await AirqoApiClient().fetchQuizzes(userId);
    if (quizzes.isEmpty) {
      quizzes = state.quizzes
          .map((e) => e.copyWith(
                status: QuizStatus.todo,
                activeQuestion: 1,
                hasCompleted: false,
              ))
          .toList();
    }

    final updatedHasCompleted = Map<String, bool>.from(state.hasCompleted);
    for (var quiz in quizzes) {
      updatedHasCompleted[quiz.id] = quiz.hasCompleted;
    }

    emit(KyaState(
        quizzes: quizzes,
        lessons: const [],
        hasCompleted: updatedHasCompleted));
  }

  Future<void> _onUpdateQuizProgress(
    UpdateQuizProgress event,
    Emitter<KyaState> emit,
  ) async {
    Quiz quiz = event.quiz;
    Set<Quiz> quizzes = state.quizzes.toSet();
    quizzes.remove(quiz);
    quizzes.add(quiz);

    final updatedHasCompleted = Map<String, bool>.from(state.hasCompleted);
    updatedHasCompleted[quiz.id] = quiz.hasCompleted;

    emit(state.copyWith(
      quizzes: quizzes.toList(),
      hasCompleted: updatedHasCompleted,
    ));

    if (event.updateRemote) {
      final userId = CustomAuth.getUserId();
      if ((userId.isNotEmpty)) {
        await AirqoApiClient().syncQuizProgress(quizzes.toList(), userId);
      }
      if (quiz.status == QuizStatus.complete) {
        CloudAnalytics.logEvent(CloudAnalyticsEvent.completeQuiz);
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
