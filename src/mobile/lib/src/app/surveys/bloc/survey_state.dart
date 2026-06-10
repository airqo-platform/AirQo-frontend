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
    return _isAnswerValid(question, answer);
  }

  // Check if survey can be submitted
  bool get canSubmit {
    final requiredQuestions = survey.questions.where((q) => q.isRequired);
    return requiredQuestions.every((q) => _isAnswerValid(q, answers[q.id]));
  }

  // Validate if an answer is valid for the given question
  bool _isAnswerValid(SurveyQuestion question, dynamic answer) {
    if (answer == null) return false;

    // Check for empty strings (after trimming)
    if (answer is String && answer.trim().isEmpty) return false;

    // Check for empty iterables/maps
    if (answer is Iterable && answer.isEmpty) return false;
    if (answer is Map && answer.isEmpty) return false;

    // For rating and scale questions, validate numeric bounds
    if (question.type == QuestionType.rating || question.type == QuestionType.scale) {
      return _isNumericAnswerValid(question, answer);
    }

    return true;
  }

  // Validate numeric answers for rating/scale questions
  bool _isNumericAnswerValid(SurveyQuestion question, dynamic answer) {
    // Try to parse as numeric
    num? numValue;
    
    if (answer is num) {
      numValue = answer;
      // Check for NaN values in existing numbers
      if (numValue.isNaN) return false;
    } else if (answer is String) {
      // Try parsing as int first, then as double
      final intValue = int.tryParse(answer);
      if (intValue != null) {
        numValue = intValue;
      } else {
        try {
          final doubleValue = double.parse(answer);
          // Check for NaN after parsing
          if (doubleValue.isNaN) return false;
          numValue = doubleValue;
        } catch (e) {
          return false; // Failed to parse as numeric
        }
      }
    } else {
      return false; // Not a valid numeric type
    }

    // numValue is guaranteed to be non-null at this point

    // Check bounds for rating questions
    if (question.type == QuestionType.rating) {
      final minValue = question.minValue ?? 1;
      final maxValue = question.maxValue ?? 5;
      return numValue >= minValue && numValue <= maxValue;
    }

    // Check bounds for scale questions
    if (question.type == QuestionType.scale) {
      final minValue = question.minValue ?? 1;
      final maxValue = question.maxValue ?? 10;
      return numValue >= minValue && numValue <= maxValue;
    }

    return true;
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
      answers: answers ?? Map<String, dynamic>.from(this.answers),
      contextData: contextData ?? (this.contextData != null ? Map<String, dynamic>.from(this.contextData!) : null),
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

/// Duplicate submission detected (409 — guest already submitted from this device)
class SurveyDuplicateSubmission extends SurveyState {
  final SurveyResponse response;

  const SurveyDuplicateSubmission(this.response);

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