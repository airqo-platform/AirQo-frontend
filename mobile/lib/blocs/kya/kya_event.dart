part of 'kya_bloc.dart';

abstract class KyaEvent extends Equatable {
  const KyaEvent();
}

class SyncKyaLessons extends KyaEvent {
  const SyncKyaLessons();
  @override
  List<Object?> get props => [];
}

class ClearKyaLessons extends KyaEvent {
  const ClearKyaLessons();
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
