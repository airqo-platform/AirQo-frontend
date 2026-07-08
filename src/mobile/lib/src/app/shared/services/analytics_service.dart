import 'package:posthog_flutter/posthog_flutter.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/services/feature_flag_service.dart';

class AnalyticsService with UiLoggy {
  static final AnalyticsService _instance = AnalyticsService._internal();

  factory AnalyticsService() => _instance;
  AnalyticsService._internal();

  Future<void> trackEvent(
    String eventName, {
    Map<String, Object>? properties,
  }) async {
    try {
      await Posthog().capture(
        eventName: eventName,
        properties: properties,
      );
    } catch (e, stackTrace) {
      loggy.error('Failed to send event: $eventName', e, stackTrace);
    }
  }

  // Auth events
  Future<void> trackUserRegistered({String? method}) =>
      trackEvent('user_registered', properties: {'method': method ?? 'email'});

  Future<void> trackUserLoggedIn({String? method}) =>
      trackEvent('user_logged_in', properties: {'method': method ?? 'email'});

  Future<void> trackUserLoggedOut() => trackEvent('user_logged_out');

  Future<void> trackEmailVerified() => trackEvent('email_verified');

  Future<void> trackPasswordResetInitiated() =>
      trackEvent('password_reset_initiated');

  Future<void> trackGuestModeAccessed() => trackEvent('guest_mode_accessed');

  // Dashboard events
  Future<void> trackDashboardViewed() => trackEvent('dashboard_viewed');

  Future<void> trackDashboardRefreshed() => trackEvent('dashboard_refreshed');

  // Map events
  Future<void> trackMapViewed() => trackEvent('map_viewed');

  Future<void> trackLocationSearched({String? location}) =>
      trackEvent('location_searched', properties: {
        if (location != null) 'location': location,
      });

  // Forecast events
  Future<void> trackForecastViewed({String? siteId, String? siteName}) =>
      trackEvent('forecast_viewed', properties: {
        if (siteId != null) 'site_id': siteId,
        if (siteName != null) 'site_name': siteName,
      });

  Future<void> trackForecastScopeChanged({required String scope}) =>
      trackEvent('forecast_scope_changed', properties: {'scope': scope});

  // Share events (card / forum filter / IG sticker funnel)
  Future<void> trackShareSheetOpened({required String source}) =>
      trackEvent('share_sheet_opened', properties: {'source': source});

  Future<void> trackShareTabSelected({required String tab}) =>
      trackEvent('share_tab_selected', properties: {'tab': tab});

  Future<void> trackShareCompleted({
    required String format,
    required String method,
  }) =>
      trackEvent('share_completed', properties: {
        'format': format,
        'method': method,
      });

  // Clean Air Forum filter events
  Future<void> trackCafFilterTabOpened() => trackEvent('caf_filter_tab_opened');

  Future<void> trackCafSelfieSourceSelected({required String source}) =>
      trackEvent('caf_selfie_source_selected', properties: {'source': source});

  Future<void> trackCafSelfieCaptured() => trackEvent('caf_selfie_captured');

  Future<void> trackCafFilterShared() => trackEvent('caf_filter_shared');

  Future<void> trackCafWallConsentGiven() =>
      trackEvent('caf_wall_consent_given');

  Future<void> trackCafWallSubmissionSent() =>
      trackEvent('caf_wall_submission_sent');

  Future<void> trackCafWallSubmissionFailed({String? error}) =>
      trackEvent('caf_wall_submission_failed', properties: {
        if (error != null) 'error': error,
      });

  // Survey events
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

  // Learn events
  Future<void> trackLearnSectionViewed() => trackEvent('learn_section_viewed');

  Future<void> trackLessonViewed({String? lessonId}) =>
      trackEvent('lesson_viewed', properties: {
        if (lessonId != null) 'lesson_id': lessonId,
      });

  Future<void> trackLessonCompleted({String? lessonId}) =>
      trackEvent('lesson_completed', properties: {
        if (lessonId != null) 'lesson_id': lessonId,
      });

  // Profile/settings events
  Future<void> trackProfileOpened() => trackEvent('profile_opened');

  Future<void> trackProfileEdited({List<String>? fieldsChanged}) =>
      trackEvent('profile_edited', properties: {
        if (fieldsChanged != null) 'fields_changed': fieldsChanged.join(','),
      });

  Future<void> trackThemeToggled({String? theme}) =>
      trackEvent('theme_toggled', properties: {
        if (theme != null) 'theme': theme,
      });

  // Navigation
  Future<void> trackNavigationChanged({int? tabIndex, String? tabName}) =>
      trackEvent('navigation_changed', properties: {
        if (tabIndex != null) 'tab_index': tabIndex,
        if (tabName != null) 'tab_name': tabName,
      });

  // Connectivity
  Future<void> trackOfflineModeActivated() =>
      trackEvent('offline_mode_activated');

  Future<void> trackConnectivityChanged({String? connectionType}) =>
      trackEvent('connectivity_changed', properties: {
        if (connectionType != null) 'connection_type': connectionType,
      });

  // Errors
  Future<void> trackApiCallFailed({
    String? endpoint,
    int? statusCode,
    String? errorMessage,
  }) =>
      trackEvent('api_call_failed', properties: {
        if (endpoint != null) 'endpoint': endpoint,
        if (statusCode != null) 'status_code': statusCode,
        if (errorMessage != null) 'error_message': errorMessage,
      });

  /// Marks this device's events as a guest session — attached to every
  /// subsequent event as a super property until login overwrites it.
  Future<void> markGuestSession() async {
    try {
      await Posthog().register('is_guest', true);
    } catch (e, stackTrace) {
      loggy.error('Failed to register guest session property', e, stackTrace);
    }
  }

  /// Identify user in PostHog and reload feature flags.
  /// Called on login, registration, and app start with existing session.
  Future<void> setUserIdentity({
    required String userId,
    Map<String, Object>? userProperties,
  }) async {
    try {
      loggy.info('Identifying user in PostHog: $userId');
      await Posthog().identify(
        userId: userId,
        userProperties: userProperties,
      );
      await Posthog().register('is_guest', false);
      await FeatureFlagService.instance.reloadFlags();
    } catch (e, stackTrace) {
      loggy.error('Failed to identify user: $userId', e, stackTrace);
    }
  }

  /// Reset user on logout — clears PostHog identity and all feature flags.
  Future<void> resetUser() async {
    try {
      await Posthog().reset();
      FeatureFlagService.instance.reset();
      loggy.info('User reset — analytics identity and feature flags cleared');
    } catch (e, stackTrace) {
      loggy.error('Failed to reset user', e, stackTrace);
    }
  }
}
