part of 'kya_bloc.dart';

sealed class KyaEvent extends Equatable {
  const KyaEvent();

  @override
  List<Object> get props => [];
}

class LoadLessons extends KyaEvent{}