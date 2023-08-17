import 'package:app/models/quiz.dart';
import 'package:equatable/equatable.dart';


abstract class QuizState extends Equatable {
  const QuizState();

  @override
  List<Object> get props => [];
}

class QuizInitialState extends QuizState {}

class QuizLoadingState extends QuizState {}

class QuizLoadedState extends QuizState {
  final Quiz quiz;

  const QuizLoadedState({required this.quiz});

  @override
  List<Object> get props => [quiz];
}

class QuestionDisplayedState extends QuizState {
  final int questionIndex;
  final QuizQuestion question;

  const QuestionDisplayedState({
    required this.questionIndex,
    required this.question,
  });

  @override
  List<Object> get props => [questionIndex, question];
}

class AnswerDisplayedState extends QuizState {
  final int questionIndex;
  final QuizQuestion question;
  final QuizQuestionOption selectedOption;

  const AnswerDisplayedState({
    required this.questionIndex,
    required this.question,
    required this.selectedOption,
  });

  @override 
  List<Object> get props => [questionIndex, question, selectedOption];
}

class QuizCompletedState extends QuizState {}