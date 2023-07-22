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
