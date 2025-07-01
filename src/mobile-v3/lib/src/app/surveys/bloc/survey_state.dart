part of 'survey_bloc.dart';

abstract class SurveyState extends Equatable {
  const SurveyState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class SurveyInitial extends SurveyState {}

/// Loading state
class SurveyLoading extends SurveyState {}

/// Surveys loaded successfully
class SurveysLoaded extends SurveyState {
  final List<Survey> surveys;
  final List<SurveyResponse> userResponses;

  const SurveysLoaded(this.surveys, {this.userResponses = const []});

  @override
  List<Object?> get props => [surveys, userResponses];
}

/// Single survey loaded
class SurveyLoaded extends SurveyState {
  final Survey survey;

  const SurveyLoaded(this.survey);

  @override
  List<Object?> get props => [survey];
}

/// Survey taking in progress
class SurveyInProgress extends SurveyState {
  final Survey survey;
  final SurveyResponse currentResponse;
  final int currentQuestionIndex;
  final Map<String, dynamic> answers;
  final Map<String, dynamic>? contextData;

  const SurveyInProgress({
    required this.survey,
    required this.currentResponse,
    required this.currentQuestionIndex,
    required this.answers,
    this.contextData,
  });

  @override
  List<Object?> get props => [
        survey,
        currentResponse,
        currentQuestionIndex,
        answers,
        contextData,
      ];

  // Helper getters
  bool get isFirstQuestion => currentQuestionIndex == 0;
  bool get isLastQuestion => currentQuestionIndex >= survey.questions.length - 1;
  double get progressPercentage => 
      survey.questions.isNotEmpty ? (currentQuestionIndex + 1) / survey.questions.length * 100 : 0;
  int get totalQuestions => survey.questions.length;
  int get currentQuestionNumber => currentQuestionIndex + 1;
  
  SurveyQuestion? get currentQuestion => 
      currentQuestionIndex < survey.questions.length ? survey.questions[currentQuestionIndex] : null;

  // Get answer for current question
  dynamic getCurrentAnswer() {
    final question = currentQuestion;
    if (question != null) {
      return answers[question.id];
    }
    return null;
  }

  // Check if current question is answered
  bool get isCurrentQuestionAnswered {
    final question = currentQuestion;
    if (question == null) return false;
    final answer = answers[question.id];
    return answer != null && answer.toString().isNotEmpty;
  }

  // Check if survey can be submitted
  bool get canSubmit {
    final requiredQuestions = survey.questions.where((q) => q.isRequired);
    return requiredQuestions.every((q) => answers.containsKey(q.id) && answers[q.id] != null);
  }

  // Copy with method for state updates
  SurveyInProgress copyWith({
    Survey? survey,
    SurveyResponse? currentResponse,
    int? currentQuestionIndex,
    Map<String, dynamic>? answers,
    Map<String, dynamic>? contextData,
  }) {
    return SurveyInProgress(
      survey: survey ?? this.survey,
      currentResponse: currentResponse ?? this.currentResponse,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      answers: answers ?? this.answers,
      contextData: contextData ?? this.contextData,
    );
  }
}

/// Survey submitted successfully
class SurveySubmitted extends SurveyState {
  final SurveyResponse response;
  final bool submittedSuccessfully;

  const SurveySubmitted(this.response, {this.submittedSuccessfully = true});

  @override
  List<Object?> get props => [response, submittedSuccessfully];
}

/// Survey responses loaded
class SurveyResponsesLoaded extends SurveyState {
  final List<SurveyResponse> responses;
  final String? surveyId;

  const SurveyResponsesLoaded(this.responses, {this.surveyId});

  @override
  List<Object?> get props => [responses, surveyId];
}

/// Survey statistics loaded
class SurveyStatsLoaded extends SurveyState {
  final SurveyStats stats;

  const SurveyStatsLoaded(this.stats);

  @override
  List<Object?> get props => [stats];
}

/// Error state
class SurveyError extends SurveyState {
  final String message;
  final dynamic error;

  const SurveyError(this.message, {this.error});

  @override
  List<Object?> get props => [message, error];
}

/// Submission loading state
class SurveySubmissionLoading extends SurveyState {
  final SurveyResponse response;

  const SurveySubmissionLoading(this.response);

  @override
  List<Object?> get props => [response];
}

/// Retry state for failed submissions
class SurveyRetryInProgress extends SurveyState {
  final int retryCount;

  const SurveyRetryInProgress(this.retryCount);

  @override
  List<Object?> get props => [retryCount];
}