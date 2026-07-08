import 'package:airqo/src/app/shared/services/analytics_service.dart';

/// App-level events: profile/settings, navigation, connectivity, and errors.
extension AppAnalyticsEvents on AnalyticsService {
  Future<void> trackProfileOpened() => trackEvent('profile_opened');

  Future<void> trackProfileEdited({List<String>? fieldsChanged}) =>
      trackEvent('profile_edited', properties: {
        if (fieldsChanged != null) 'fields_changed': fieldsChanged.join(','),
      });

  Future<void> trackThemeToggled({String? theme}) =>
      trackEvent('theme_toggled', properties: {
        if (theme != null) 'theme': theme,
      });

  Future<void> trackNavigationChanged({int? tabIndex, String? tabName}) =>
      trackEvent('navigation_changed', properties: {
        if (tabIndex != null) 'tab_index': tabIndex,
        if (tabName != null) 'tab_name': tabName,
      });

  Future<void> trackOfflineModeActivated() =>
      trackEvent('offline_mode_activated');

  Future<void> trackConnectivityChanged({String? connectionType}) =>
      trackEvent('connectivity_changed', properties: {
        if (connectionType != null) 'connection_type': connectionType,
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
}
