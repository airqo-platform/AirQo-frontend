import 'package:posthog_flutter/posthog_flutter.dart';
import 'package:loggy/loggy.dart';

/// Analytics service for tracking user events and interactions
/// Uses PostHog for event tracking and analytics
class AnalyticsService with UiLoggy {
  static final AnalyticsService _instance = AnalyticsService._internal();

  factory AnalyticsService() {
    return _instance;
  }

  AnalyticsService._internal();

  /// Track a generic event with optional properties
  Future<void> trackEvent(
    String eventName, {
    Map<String, Object>? properties,
  }) async {
    try {
      logDebug('📊 [PostHog] Attempting to capture event: $eventName');
      logDebug('📊 [PostHog] Event properties: $properties');

      final sw = Stopwatch()..start();
      await Posthog().capture(
        eventName: eventName,
        properties: properties,
      );
      sw.stop();

      logDebug('✅ [PostHog] Event captured in ${sw.elapsedMilliseconds}ms: $eventName');
    } catch (e, stackTrace) {
      logError('❌ [PostHog] Failed to send event: $eventName', e, stackTrace);
    }
  }

  /// Track authentication events
  Future<void> trackUserRegistered({
    String? method,
  }) =>
      trackEvent('user_registered', properties: {'method': method ?? 'email'});

  Future<void> trackUserLoggedIn({
    String? method,
  }) =>
      trackEvent('user_logged_in', properties: {'method': method ?? 'email'});

  Future<void> trackUserLoggedOut() => trackEvent('user_logged_out');

  Future<void> trackEmailVerified() => trackEvent('email_verified');

  Future<void> trackPasswordResetInitiated() =>
      trackEvent('password_reset_initiated');

  Future<void> trackGuestModeAccessed() => trackEvent('guest_mode_accessed');

  /// Track dashboard events
  Future<void> trackDashboardViewed() => trackEvent('dashboard_viewed');

  Future<void> trackDashboardRefreshed() => trackEvent('dashboard_refreshed');

  /// Track map events
  Future<void> trackMapViewed() => trackEvent('map_viewed');

  Future<void> trackLocationSearched({
    String? location,
  }) =>
      trackEvent('location_searched', properties: {
        if (location != null) 'location': location,
      });

  /// Track exposure events
  Future<void> trackExposureTabAccessed() =>
      trackEvent('exposure_tab_accessed');

  Future<void> trackExposureTrackingEnabled() =>
      trackEvent('exposure_tracking_enabled');

  Future<void> trackExposureTrackingDisabled() =>
      trackEvent('exposure_tracking_disabled');

  Future<void> trackExposureDataLoaded() => trackEvent('exposure_data_loaded');

  Future<void> trackExposureLevelViewed({
    String? level, // minimal, low, moderate, high
  }) =>
      trackEvent('exposure_level_viewed', properties: {
        if (level != null) 'level': level,
      });

  Future<void> trackHourlyExposureViewed() =>
      trackEvent('hourly_exposure_viewed');

  Future<void> trackExposureTimelineViewed() =>
      trackEvent('exposure_timeline_viewed');

  /// Track location permission events
  Future<void> trackLocationPermissionRequested() =>
      trackEvent('location_permission_requested');

  Future<void> trackLocationPermissionGranted() =>
      trackEvent('location_permission_granted');

  Future<void> trackLocationPermissionDenied() =>
      trackEvent('location_permission_denied');

  /// Track learn/education events
  Future<void> trackLearnSectionViewed() => trackEvent('learn_section_viewed');

  Future<void> trackLessonViewed({
    String? lessonId,
  }) =>
      trackEvent('lesson_viewed', properties: {
        if (lessonId != null) 'lesson_id': lessonId,
      });

  Future<void> trackLessonCompleted({
    String? lessonId,
  }) =>
      trackEvent('lesson_completed', properties: {
        if (lessonId != null) 'lesson_id': lessonId,
      });

  /// Track research and survey events
  Future<void> trackResearchStudyViewed() =>
      trackEvent('research_study_viewed');

  Future<void> trackResearchConsentAccepted() =>
      trackEvent('research_consent_accepted');

  Future<void> trackSurveyPresented({
    String? surveyId,
  }) =>
      trackEvent('survey_presented', properties: {
        if (surveyId != null) 'survey_id': surveyId,
      });

  Future<void> trackSurveyStarted({
    String? surveyId,
  }) =>
      trackEvent('survey_started', properties: {
        if (surveyId != null) 'survey_id': surveyId,
      });

  Future<void> trackSurveyQuestionAnswered({
    String? surveyId,
    String? questionId,
  }) =>
      trackEvent('survey_question_answered', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (questionId != null) 'question_id': questionId,
      });

  Future<void> trackSurveyCompleted({
    String? surveyId,
    int? responseTime,
  }) =>
      trackEvent('survey_completed', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (responseTime != null) 'response_time': responseTime,
      });

  Future<void> trackSurveyAbandoned({
    String? surveyId,
    int? questionNumber,
  }) =>
      trackEvent('survey_abandoned', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (questionNumber != null) 'question_number': questionNumber,
      });

  Future<void> trackSurveySubmissionFailed({
    String? surveyId,
    String? error,
  }) =>
      trackEvent('survey_submission_failed', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (error != null) 'error': error,
      });

  Future<void> trackSurveyListViewed() => trackEvent('survey_list_viewed');

  Future<void> trackSurveyDetailViewed({
    String? surveyId,
  }) =>
      trackEvent('survey_detail_viewed', properties: {
        if (surveyId != null) 'survey_id': surveyId,
      });

  Future<void> trackSurveySkipped({
    String? surveyId,
    int? questionNumber,
  }) =>
      trackEvent('survey_skipped', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (questionNumber != null) 'question_number': questionNumber,
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

  Future<void> trackSurveyQuestionTimeSpent({
    String? surveyId,
    String? questionId,
    int? timeSpentSeconds,
  }) =>
      trackEvent('survey_question_time_spent', properties: {
        if (surveyId != null) 'survey_id': surveyId,
        if (questionId != null) 'question_id': questionId,
        if (timeSpentSeconds != null) 'time_spent_seconds': timeSpentSeconds,
      });

  Future<void> trackSurveyResultsViewed({
    String? surveyId,
  }) =>
      trackEvent('survey_results_viewed', properties: {
        if (surveyId != null) 'survey_id': surveyId,
      });

  /// Track profile and settings events
  Future<void> trackProfileOpened() => trackEvent('profile_opened');

  Future<void> trackProfileEdited({
    List<String>? fieldsChanged,
  }) =>
      trackEvent('profile_edited',
          properties: {
            if (fieldsChanged != null)
              'fields_changed': fieldsChanged.join(','),
          });

  Future<void> trackPrivacySettingsViewed() =>
      trackEvent('privacy_settings_viewed');

  Future<void> trackPrivacySettingChanged({
    String? settingName,
    dynamic newValue,
  }) =>
      trackEvent('privacy_setting_changed', properties: {
        if (settingName != null) 'setting_name': settingName,
        'new_value': newValue.toString(),
      });

  // Future<void> trackLanguageChanged({
  //   String? language,
  // }) =>
  //     trackEvent('language_changed', properties: {'language': language});

  Future<void> trackThemeToggled({
    String? theme,
  }) =>
      trackEvent('theme_toggled', properties: {
        if (theme != null) 'theme': theme,
      });

  /// Track data and performance events
  Future<void> trackDataRefreshStarted() => trackEvent('data_refresh_started');

  Future<void> trackDataRefreshCompleted({
    int? durationMs,
  }) =>
      trackEvent('data_refresh_completed',
          properties: {
            if (durationMs != null) 'duration_ms': durationMs,
          });

  Future<void> trackDataRefreshFailed({
    String? errorType,
  }) =>
      trackEvent('data_refresh_failed', properties: {
        if (errorType != null) 'error_type': errorType,
      });

  Future<void> trackOfflineModeActivated() =>
      trackEvent('offline_mode_activated');

  Future<void> trackConnectivityChanged({
    String? connectionType,
  }) =>
      trackEvent('connectivity_changed',
          properties: {
            if (connectionType != null) 'connection_type': connectionType,
          });

  /// Track screen navigation
  Future<void> trackScreenViewed({
    required String screenName,
  }) =>
      trackEvent('screen_viewed', properties: {'screen_name': screenName});

  Future<void> trackNavigationChanged({
    int? tabIndex,
    String? tabName,
  }) =>
      trackEvent('navigation_changed', properties: {
        if (tabIndex != null) 'tab_index': tabIndex,
        if (tabName != null) 'tab_name': tabName,
      });

  /// Track errors and debugging
  Future<void> trackError({
    required String errorType,
    String? errorMessage,
    String? stackTrace,
  }) =>
      trackEvent('error_occurred', properties: {
        'error_type': errorType,
        if (errorMessage != null) 'error_message': errorMessage,
        if (stackTrace != null) 'stack_trace': stackTrace,
      });

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

  /// Set user properties for identification
  Future<void> setUserIdentity({
    required String userId,
    Map<String, Object>? userProperties,
  }) async {
    try {
      logDebug('👤 [PostHog] Identifying user: $userId');
      logDebug('👤 [PostHog] User properties: $userProperties');

      await Posthog().identify(
        userId: userId,
        userProperties: userProperties);

      final distinctId = await Posthog().getDistinctId();
      logDebug('✅ [PostHog] User identified successfully. Distinct ID: $distinctId');
    } catch (e, stackTrace) {
      logError('❌ [PostHog] Failed to identify user: $userId', e, stackTrace);
    }
  }

  /// Reset user when they log out
  Future<void> resetUser() async {
    try {
      logDebug('🔄 [PostHog] Resetting user data...');
      await Posthog().reset();
      logDebug('✅ [PostHog] User reset successfully for analytics');
    } catch (e, stackTrace) {
      logError('❌ [PostHog] Failed to reset user', e, stackTrace);
    }
  }

}
