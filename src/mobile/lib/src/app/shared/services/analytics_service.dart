import 'package:flutter/foundation.dart';
import 'package:posthog_flutter/posthog_flutter.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/services/feature_flag_service.dart';

// Typed event wrappers live in per-domain extension files so each feature
// evolves its own taxonomy without everyone editing this class. They are
// re-exported here so call sites only ever import analytics_service.dart.
export 'package:airqo/src/app/shared/services/analytics/analytics_app_events.dart';
export 'package:airqo/src/app/shared/services/analytics/analytics_auth_events.dart';
export 'package:airqo/src/app/shared/services/analytics/analytics_dashboard_events.dart';
export 'package:airqo/src/app/shared/services/analytics/analytics_learn_events.dart';
export 'package:airqo/src/app/shared/services/analytics/analytics_share_events.dart';
export 'package:airqo/src/app/shared/services/analytics/analytics_survey_events.dart';

/// Core analytics transport: event capture, identity, and session-scoped
/// super properties. Domain-specific event methods are extensions — see the
/// files under `analytics/`.
class AnalyticsService with UiLoggy {
  static AnalyticsService _instance = AnalyticsService._internal();

  factory AnalyticsService() => _instance;
  AnalyticsService._internal();

  /// For test fakes/spies to extend — production code must go through the
  /// factory so the whole app shares one instance.
  @visibleForTesting
  AnalyticsService.forTesting();

  /// Swap the shared instance for a fake in tests. Every `AnalyticsService()`
  /// call site resolves through this single choke point, so overriding it
  /// here gives all widgets a test seam without changing their convention.
  @visibleForTesting
  static set instance(AnalyticsService value) {
    if (!kDebugMode) {
      throw UnsupportedError('AnalyticsService.instance is for testing only');
    }
    _instance = value;
  }

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

  /// Reset user on logout/session expiry — clears PostHog identity and all
  /// feature flags, then marks the device as a guest session so subsequent
  /// events always carry an accurate is_guest super property.
  Future<void> resetUser() async {
    try {
      await Posthog().reset();
      FeatureFlagService.instance.reset();
      await markGuestSession();
      loggy.info('User reset — analytics identity and feature flags cleared');
    } catch (e, stackTrace) {
      loggy.error('Failed to reset user', e, stackTrace);
    }
  }
}
