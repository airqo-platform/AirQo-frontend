import 'package:equatable/equatable.dart';

abstract class QuizEvent extends Equatable {
  const QuizEvent();

  @override
  List<Object> get props => []; 
}

class StartQuizEvent extends QuizEvent {}

class LoadQuizEvent extends QuizEvent {}

class SelectAnswerEvent extends QuizEvent {
  final int questionIndex;
  final int optionIndex;

  const SelectAnswerEvent(this.questionIndex, this.optionIndex);

  @override
  List<Object> get props => [questionIndex, optionIndex];
}

class GoToNextQuestionEvent extends QuizEvent {}

class CompleteQuizEvent extends QuizEvent {}