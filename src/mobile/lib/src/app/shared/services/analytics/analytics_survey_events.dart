import 'package:airqo/src/app/shared/services/analytics_service.dart';

extension SurveyAnalyticsEvents on AnalyticsService {
  Future<void> trackSurveyListViewed() => trackEvent('survey_list_viewed');

  Future<void> trackSurveyDetailViewed({String? surveyId}) =>
      trackEvent('survey_detail_viewed', properties: {
        if (surveyId != null) 'survey_id': surveyId,
      });

  Future<void> trackSurveyPresented({String? surveyId}) =>
      trackEvent('survey_presented', properties: {
        if (surveyId != null) 'survey_id': surveyId,
      });

  Future<void> trackSurveyStarted({String? surveyId, String? deviceId}) =>
      trackEvent('survey_started', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (deviceId != null) 'device_id': deviceId,
      });

  Future<void> trackSurveyCompleted({
    String? surveyId,
    int? responseTime,
    String? deviceId,
  }) =>
      trackEvent('survey_completed', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (responseTime != null) 'response_time': responseTime,
        if (deviceId != null) 'device_id': deviceId,
      });

  Future<void> trackSurveyAbandoned({String? surveyId, int? questionNumber}) =>
      trackEvent('survey_abandoned', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (questionNumber != null) 'question_number': questionNumber,
      });

  Future<void> trackSurveySkipped({String? surveyId, int? questionNumber}) =>
      trackEvent('survey_skipped', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (questionNumber != null) 'question_number': questionNumber,
      });

  Future<void> trackSurveySubmissionFailed({
    String? surveyId,
    String? error,
    String? deviceId,
  }) =>
      trackEvent('survey_submission_failed', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (error != null) 'error': error,
        if (deviceId != null) 'device_id': deviceId,
      });

  Future<void> trackSurveyQuestionViewed({
    String? surveyId,
    String? questionId,
    int? questionNumber,
  }) =>
      trackEvent('survey_question_viewed', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (questionId != null) 'question_id': questionId,
        if (questionNumber != null) 'question_number': questionNumber,
      });

  Future<void> trackSurveyQuestionAnswered({
    String? surveyId,
    String? questionId,
  }) =>
      trackEvent('survey_question_answered', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (questionId != null) 'question_id': questionId,
      });
}
