import 'package:posthog_flutter/posthog_flutter.dart';
import 'package:loggy/loggy.dart';

enum AppFeatureFlag {
  researchMode('research_mode'),
  exposureTracking('exposure_tracking'),
  surveys('surveys'),
  dataSharing('data_sharing');

  final String key;
  const AppFeatureFlag(this.key);
}

class FeatureFlagService with UiLoggy {
  static final FeatureFlagService instance = FeatureFlagService._();
  FeatureFlagService._();

  final Map<AppFeatureFlag, bool> _flags = {
    for (final flag in AppFeatureFlag.values) flag: false,
  };

  bool isEnabled(AppFeatureFlag flag) => _flags[flag] ?? false;

  Future<void> reloadFlags() async {
    try {
      await Posthog().reloadFeatureFlags();
      for (final flag in AppFeatureFlag.values) {
        _flags[flag] = await Posthog().isFeatureEnabled(flag.key);
      }
      loggy.info('Feature flags reloaded: $_flags');
    } catch (e, stackTrace) {
      loggy.error('Failed to reload feature flags', e, stackTrace);
    }
  }

  void reset() {
    for (final flag in AppFeatureFlag.values) {
      _flags[flag] = false;
    }
    loggy.info('Feature flags reset to defaults');
  }
}
