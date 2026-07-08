import 'package:airqo/src/app/shared/services/analytics_service.dart';

/// Share funnel (card / forum filter / IG sticker) and the Clean Air Forum
/// filter-specific events.
extension ShareAnalyticsEvents on AnalyticsService {
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
}
