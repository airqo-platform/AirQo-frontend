import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_response_model.dart';
import 'package:airqo/src/app/surveys/repository/survey_repository.dart';

part 'survey_event.dart';
part 'survey_state.dart';

class SurveyBloc extends Bloc<SurveyEvent, SurveyState> with UiLoggy {
  final SurveyRepository repository;

  SurveyBloc(this.repository) : super(SurveyInitial()) {
    on<LoadSurveys>(_onLoadSurveys);
    on<LoadSurvey>(_onLoadSurvey);
    on<StartSurvey>(_onStartSurvey);
    on<AnswerQuestion>(_onAnswerQuestion);
    on<NextQuestion>(_onNextQuestion);
    on<PreviousQuestion>(_onPreviousQuestion);
    on<SkipQuestion>(_onSkipQuestion);
    on<SubmitSurvey>(_onSubmitSurvey);
    on<LoadSurveyResponses>(_onLoadSurveyResponses);
    on<LoadSurveyStats>(_onLoadSurveyStats);
    on<RetryFailedSubmissions>(_onRetryFailedSubmissions);
    on<ResetSurvey>(_onResetSurvey);
    on<UpdateSurveyProgress>(_onUpdateSurveyProgress);
  }

  Future<void> _onLoadSurveys(LoadSurveys event, Emitter<SurveyState> emit) async {
    emit(SurveyLoading());
    try {
      final surveys = await repository.getSurveys(forceRefresh: event.forceRefresh);
      final userResponses = await repository.getSurveyResponses();
      
      emit(SurveysLoaded(surveys, userResponses: userResponses));
      loggy.info('Loaded ${surveys.length} surveys');
    } catch (e) {
      loggy.error('Error loading surveys: $e');
      emit(SurveyError('Failed to load surveys', error: e));
    }
  }

  Future<void> _onLoadSurvey(LoadSurvey event, Emitter<SurveyState> emit) async {
    emit(SurveyLoading());
    try {
      final survey = await repository.getSurvey(event.surveyId);
      if (survey != null) {
        emit(SurveyLoaded(survey));
        loggy.info('Loaded survey: ${survey.title}');
      } else {
        emit(SurveyError('Survey not found'));
      }
    } catch (e) {
      loggy.error('Error loading survey ${event.surveyId}: $e');
      emit(SurveyError('Failed to load survey', error: e));
    }
  }

  Future<void> _onStartSurvey(StartSurvey event, Emitter<SurveyState> emit) async {
    try {
      final responseId = DateTime.now().millisecondsSinceEpoch.toString();
      final startTime = DateTime.now();

      // Create initial survey response
      final response = SurveyResponse(
        id: responseId,
        surveyId: event.survey.id,
        userId: 'current_user', // TODO: Get from auth state
        answers: [],
        status: SurveyResponseStatus.inProgress,
        startedAt: startTime,
        contextData: event.contextData,
      );

      emit(SurveyInProgress(
        survey: event.survey,
        currentResponse: response,
        currentQuestionIndex: 0,
        answers: {},
        contextData: event.contextData,
      ));

      loggy.info('Started survey: ${event.survey.title}');
    } catch (e) {
      loggy.error('Error starting survey: $e');
      emit(SurveyError('Failed to start survey', error: e));
    }
  }

  Future<void> _onAnswerQuestion(AnswerQuestion event, Emitter<SurveyState> emit) async {
    if (state is SurveyInProgress) {
      final currentState = state as SurveyInProgress;
      final updatedAnswers = Map<String, dynamic>.from(currentState.answers);
      updatedAnswers[event.questionId] = event.answer;

      // Create survey answer
      final surveyAnswer = SurveyAnswer(
        questionId: event.questionId,
        answer: event.answer,
        answeredAt: DateTime.now(),
      );

      // Update current response
      final updatedResponseAnswers = List<SurveyAnswer>.from(currentState.currentResponse.answers);
      final existingAnswerIndex = updatedResponseAnswers.indexWhere(
        (a) => a.questionId == event.questionId,
      );

      if (existingAnswerIndex >= 0) {
        updatedResponseAnswers[existingAnswerIndex] = surveyAnswer;
      } else {
        updatedResponseAnswers.add(surveyAnswer);
      }

      final updatedResponse = currentState.currentResponse.copyWith(
        answers: updatedResponseAnswers,
      );

      emit(currentState.copyWith(
        answers: updatedAnswers,
        currentResponse: updatedResponse,
      ));

      loggy.info('Answered question: $event.questionId');
    }
  }

  Future<void> _onNextQuestion(NextQuestion event, Emitter<SurveyState> emit) async {
    if (state is SurveyInProgress) {
      final currentState = state as SurveyInProgress;
      
      if (!currentState.isLastQuestion) {
        emit(currentState.copyWith(
          currentQuestionIndex: currentState.currentQuestionIndex + 1,
        ));
        loggy.info('Moved to next question: ${currentState.currentQuestionIndex + 1}');
      }
    }
  }

  Future<void> _onPreviousQuestion(PreviousQuestion event, Emitter<SurveyState> emit) async {
    if (state is SurveyInProgress) {
      final currentState = state as SurveyInProgress;
      
      if (!currentState.isFirstQuestion) {
        emit(currentState.copyWith(
          currentQuestionIndex: currentState.currentQuestionIndex - 1,
        ));
        loggy.info('Moved to previous question: ${currentState.currentQuestionIndex - 1}');
      }
    }
  }

  Future<void> _onSkipQuestion(SkipQuestion event, Emitter<SurveyState> emit) async {
    if (state is SurveyInProgress) {
      final currentState = state as SurveyInProgress;
      final currentQuestion = currentState.currentQuestion;
      
      if (currentQuestion != null && !currentQuestion.isRequired) {
        // Move to next question if not the last one
        if (!currentState.isLastQuestion) {
          emit(currentState.copyWith(
            currentQuestionIndex: currentState.currentQuestionIndex + 1,
          ));
          loggy.info('Skipped question: ${currentQuestion.id}');
        }
      }
    }
  }

  Future<void> _onSubmitSurvey(SubmitSurvey event, Emitter<SurveyState> emit) async {
    if (state is SurveyInProgress) {
      final currentState = state as SurveyInProgress;
      
      if (!currentState.canSubmit) {
        emit(SurveyError('Please answer all required questions before submitting'));
        return;
      }

      emit(SurveySubmissionLoading(currentState.currentResponse));
      
      try {
        final completedAt = DateTime.now();
        final completionTime = completedAt.difference(currentState.currentResponse.startedAt);

        final finalResponse = currentState.currentResponse.copyWith(
          status: SurveyResponseStatus.completed,
          completedAt: completedAt,
          timeToComplete: completionTime,
        );

        final success = await repository.submitSurveyResponse(finalResponse);
        
        emit(SurveySubmitted(finalResponse, submittedSuccessfully: success));
        
        if (success) {
          loggy.info('Successfully submitted survey: ${currentState.survey.title}');
        } else {
          loggy.warning('Survey saved locally but failed to sync with server');
        }
      } catch (e) {
        loggy.error('Error submitting survey: $e');
        emit(SurveyError('Failed to submit survey', error: e));
      }
    }
  }

  Future<void> _onLoadSurveyResponses(LoadSurveyResponses event, Emitter<SurveyState> emit) async {
    emit(SurveyLoading());
    try {
      final responses = await repository.getSurveyResponses(surveyId: event.surveyId);
      emit(SurveyResponsesLoaded(responses, surveyId: event.surveyId));
      loggy.info('Loaded ${responses.length} survey responses');
    } catch (e) {
      loggy.error('Error loading survey responses: $e');
      emit(SurveyError('Failed to load survey responses', error: e));
    }
  }

  Future<void> _onLoadSurveyStats(LoadSurveyStats event, Emitter<SurveyState> emit) async {
    emit(SurveyLoading());
    try {
      final stats = await repository.getSurveyStats(event.surveyId);
      if (stats != null) {
        emit(SurveyStatsLoaded(stats));
        loggy.info('Loaded survey stats for: ${event.surveyId}');
      } else {
        emit(SurveyError('Survey statistics not available'));
      }
    } catch (e) {
      loggy.error('Error loading survey stats: $e');
      emit(SurveyError('Failed to load survey statistics', error: e));
    }
  }

  Future<void> _onRetryFailedSubmissions(RetryFailedSubmissions event, Emitter<SurveyState> emit) async {
    emit(SurveyRetryInProgress(0));
    try {
      await repository.retryFailedSubmissions();
      
      // Reload surveys to reflect updated status
      final surveys = await repository.getSurveys();
      final userResponses = await repository.getSurveyResponses();
      emit(SurveysLoaded(surveys, userResponses: userResponses));
      
      loggy.info('Retry completed successfully');
    } catch (e) {
      loggy.error('Error during retry: $e');
      emit(SurveyError('Failed to retry submissions', error: e));
    }
  }

  Future<void> _onResetSurvey(ResetSurvey event, Emitter<SurveyState> emit) async {
    emit(SurveyInitial());
    loggy.info('Survey state reset');
  }

  Future<void> _onUpdateSurveyProgress(UpdateSurveyProgress event, Emitter<SurveyState> emit) async {
    if (state is SurveyInProgress) {
      final currentState = state as SurveyInProgress;
      
      if (event.currentQuestionIndex >= 0 && 
          event.currentQuestionIndex < currentState.survey.questions.length) {
        emit(currentState.copyWith(
          currentQuestionIndex: event.currentQuestionIndex,
        ));
      }
    }
  }
}