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

  // Session
  Future<void> trackSessionStarted({
    required String sessionId,
    String? userId,
    bool isGuest = false,
  }) =>
      trackEvent('session_started', properties: {
        'session_id': sessionId,
        if (userId != null) 'user_id': userId,
        'is_guest': isGuest,
        'timestamp': DateTime.now().toIso8601String(),
      });

  Future<void> trackSessionEnded({
    required String sessionId,
    required int durationSeconds,
    String? userId,
    bool isGuest = false,
  }) =>
      trackEvent('session_ended', properties: {
        'session_id': sessionId,
        'duration_seconds': durationSeconds,
        if (userId != null) 'user_id': userId,
        'is_guest': isGuest,
        'timestamp': DateTime.now().toIso8601String(),
      });

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
