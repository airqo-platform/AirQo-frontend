part of 'kya_bloc.dart';

abstract class KyaEvent extends Equatable {
  const KyaEvent();
}

class FetchKya extends KyaEvent {
  const FetchKya();

  @override
  List<Object> get props => [];
}

class ClearKya extends KyaEvent {
  const ClearKya();

  @override
  List<Object> get props => [];
}

class UpdateKyaProgress extends KyaEvent {
  const UpdateKyaProgress(this.kyaLesson, {this.updateRemote = false});

  final KyaLesson kyaLesson;
  final bool updateRemote;

  @override
  List<Object> get props => [kyaLesson];
}

class FetchQuizzes extends KyaEvent {
  const FetchQuizzes();

  @override
  List<Object> get props => [];
}

class ClearQuizzes extends KyaEvent {
  const ClearQuizzes();

  @override
  List<Object> get props => [];
}

class UpdateQuizProgress extends KyaEvent {
  const UpdateQuizProgress(this.quiz, {this.updateRemote = false});

  final Quiz quiz;
  final bool updateRemote;

  @override
  List<Object> get props => [quiz];
}
