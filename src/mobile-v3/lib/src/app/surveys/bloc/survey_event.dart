part of 'survey_bloc.dart';

abstract class SurveyEvent extends Equatable {
  const SurveyEvent();

  @override
  List<Object?> get props => [];
}

/// Load available surveys
class LoadSurveys extends SurveyEvent {
  final bool forceRefresh;

  const LoadSurveys({this.forceRefresh = false});

  @override
  List<Object?> get props => [forceRefresh];
}

/// Load a specific survey
class LoadSurvey extends SurveyEvent {
  final String surveyId;

  const LoadSurvey(this.surveyId);

  @override
  List<Object?> get props => [surveyId];
}

/// Start taking a survey
class StartSurvey extends SurveyEvent {
  final Survey survey;
  final Map<String, dynamic>? contextData;

  const StartSurvey(this.survey, {this.contextData});

  @override
  List<Object?> get props => [survey, contextData];
}

/// Answer a survey question
class AnswerQuestion extends SurveyEvent {
  final String questionId;
  final dynamic answer;

  const AnswerQuestion(this.questionId, this.answer);

  @override
  List<Object?> get props => [questionId, answer];
}

/// Navigate to next question
class NextQuestion extends SurveyEvent {
  const NextQuestion();
}

/// Navigate to previous question
class PreviousQuestion extends SurveyEvent {
  const PreviousQuestion();
}

/// Skip current question
class SkipQuestion extends SurveyEvent {
  const SkipQuestion();
}

/// Submit survey response
class SubmitSurvey extends SurveyEvent {
  const SubmitSurvey();
}

/// Load user's survey responses
class LoadSurveyResponses extends SurveyEvent {
  final String? surveyId;

  const LoadSurveyResponses({this.surveyId});

  @override
  List<Object?> get props => [surveyId];
}

/// Load survey statistics
class LoadSurveyStats extends SurveyEvent {
  final String surveyId;

  const LoadSurveyStats(this.surveyId);

  @override
  List<Object?> get props => [surveyId];
}

/// Retry failed submissions
class RetryFailedSubmissions extends SurveyEvent {
  const RetryFailedSubmissions();
}

/// Reset survey state
class ResetSurvey extends SurveyEvent {
  const ResetSurvey();
}

/// Update current survey progress
class UpdateSurveyProgress extends SurveyEvent {
  final int currentQuestionIndex;

  const UpdateSurveyProgress(this.currentQuestionIndex);

  @override
  List<Object?> get props => [currentQuestionIndex];
}