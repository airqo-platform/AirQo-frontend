part of 'kya_bloc.dart';

sealed class KyaState extends Equatable {
  const KyaState();

  @override
  List<Object> get props => [];
}

final class KyaInitial extends KyaState {}

final class LessonsLoading extends KyaState {}

final class LessonsLoaded extends KyaState {
  final LessonResponseModel model;

  const LessonsLoaded(this.model);
}

final class LessonsLoadingError extends KyaState {
  final String message;

  const LessonsLoadingError(this.message);
}
