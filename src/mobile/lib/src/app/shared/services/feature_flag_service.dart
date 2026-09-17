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

  final Map<AppFeatureFlag, bool> _flags = {
    for (final flag in AppFeatureFlag.values) flag: kDebugMode,
  };

  bool isEnabled(AppFeatureFlag flag) => _flags[flag] ?? false;

  Future<void> reloadFlags() async {
    try {
      await Posthog().reloadFeatureFlags();
      for (final flag in AppFeatureFlag.values) {
        final enabled = await Posthog().isFeatureEnabled(flag.key);
        // Sideloaded debug APKs are a new anonymous app id, so PostHog often
        // leaves flags off. Keep them on in debug so testers see the full app.
        _flags[flag] = kDebugMode || enabled;
      }
      loggy.info('Feature flags reloaded: $_flags');
    } catch (e, stackTrace) {
      if (kDebugMode) {
        for (final flag in AppFeatureFlag.values) {
          _flags[flag] = true;
        }
      }
      loggy.error('Failed to reload feature flags', e, stackTrace);
    }
  }

  void reset() {
    for (final flag in AppFeatureFlag.values) {
      _flags[flag] = kDebugMode;
    }
    loggy.info('Feature flags reset to defaults');
  }
}
