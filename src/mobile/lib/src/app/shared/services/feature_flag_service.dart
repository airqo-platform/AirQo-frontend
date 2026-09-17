import 'package:flutter/foundation.dart';
import 'package:posthog_flutter/posthog_flutter.dart';
import 'package:loggy/loggy.dart';

enum AppFeatureFlag {
  exposureTracking('exposure_tracking'),
  surveys('surveys'),
  dataSharing('data_sharing'),
  feedback('feedback'),
  socialLogin('social_login'),
  conferenceWall('conference_wall');

  final String key;
  const AppFeatureFlag(this.key);
}

class FeatureFlagService with UiLoggy {
  static final FeatureFlagService instance = FeatureFlagService._();
  FeatureFlagService._();

  /// Sideloaded Firebase App Distribution AABs are release-mode, so
  /// [kDebugMode] is false. Pass `--dart-define=AIRQO_INTERNAL_BUILD=true`
  /// from the `app_distribution` lane so testers still see flagged features
  /// before PostHog has a cohort for that install.
  static const bool _internalBuild =
      bool.fromEnvironment('AIRQO_INTERNAL_BUILD');

  static bool get _unlockFlagsByDefault => kDebugMode || _internalBuild;

  final Map<AppFeatureFlag, bool> _flags = {
    for (final flag in AppFeatureFlag.values) flag: _unlockFlagsByDefault,
  };

  bool isEnabled(AppFeatureFlag flag) => _flags[flag] ?? false;

  Future<void> reloadFlags() async {
    try {
      await Posthog().reloadFeatureFlags();
      for (final flag in AppFeatureFlag.values) {
        final enabled = await Posthog().isFeatureEnabled(flag.key);
        // Sideloaded debug APKs are a new anonymous app id, so PostHog often
        // leaves flags off. Keep them on in debug/internal so testers see the
        // full app.
        _flags[flag] = _unlockFlagsByDefault || enabled;
      }
      loggy.info('Feature flags reloaded: $_flags');
    } catch (e, stackTrace) {
      if (_unlockFlagsByDefault) {
        for (final flag in AppFeatureFlag.values) {
          _flags[flag] = true;
        }
      }
      loggy.error('Failed to reload feature flags', e, stackTrace);
    }
  }

  void reset() {
    for (final flag in AppFeatureFlag.values) {
      _flags[flag] = _unlockFlagsByDefault;
    }
    loggy.info('Feature flags reset to defaults');
  }
}
