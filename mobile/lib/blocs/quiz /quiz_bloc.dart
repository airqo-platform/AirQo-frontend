import 'package:app/models/quiz.dart';
import 'quiz_event.dart';
import 'quiz_state.dart';
import 'package:app/models/models.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

class QuizBloc extends Bloc<QuizEvent, QuizState> {
  QuizBloc() : super(QuizInitialState()) {
    on<StartQuizEvent>(_startQuiz);

    on<LoadQuizEvent>(_loadQuiz);

    on<SelectAnswerEvent>(_selectAnswer);

    on<GoToNextQuestionEvent>(_nextQuestion);

    on<CompleteQuizEvent>(_completeQuiz);
  }

  void _startQuiz(event, emit) {
    emit(QuizLoadingState());
  }

  void _loadQuiz(event, emit) async {
    try {
      final quiz = await _getQuiz();
      emit(QuizLoadedState(quiz: quiz));
    } catch (err) {
      // Handle error
    }
  }

  void _selectAnswer(event, emit) {
    // Select answer

  }

  void _nextQuestion(event, emit) {
    // Next question
  }

  void _completeQuiz(event, emit) {
    // Complete quiz
  }

  Future<Quiz> _getQuiz() async {
    Quiz? quiz;

    // Load quiz

    if (quiz == null) {
      throw Exception('Failed to load quiz');
    }

    return quiz;
  }
}
