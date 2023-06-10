part of 'kya_bloc.dart';

abstract class KyaEvent extends Equatable {
  const KyaEvent();
}

class LoadKyaLessons extends KyaEvent {
  const LoadKyaLessons(this.userId);
  final String userId;

  @override
  List<Object> get props => [userId];
}

class ResetKyaLessons extends KyaEvent {
  const ResetKyaLessons();
  @override
  List<Object?> get props => [];
}

class UpdateKyaLessonStatus extends KyaEvent {
  const UpdateKyaLessonStatus(
    this.kyaLesson, {
    required this.status,
  });
  final KyaLessonStatus status;
  final KyaLesson kyaLesson;

  @override
  List<Object?> get props => [kyaLesson, status];
}

class UpdateKyaTaskStatus extends KyaEvent {
  const UpdateKyaTaskStatus(
    this.kyaTask, {
    required this.status,
    required this.kyaLesson,
  });

  final KyaTaskStatus status;
  final KyaLesson kyaLesson;
  final KyaTask kyaTask;

  @override
  List<Object?> get props => [kyaLesson, status, kyaTask];
}
