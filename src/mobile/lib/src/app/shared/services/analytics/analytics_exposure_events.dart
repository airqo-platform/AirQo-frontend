import 'package:airqo/src/app/shared/services/analytics_service.dart';

/// Exposure tab funnel: launch announcement, Favorites/Trips, declared places,
/// place-card tour, hourly detail, and trip route exposure.
extension ExposureAnalyticsEvents on AnalyticsService {
  Future<void> trackExposureSectionChanged({required String section}) =>
      trackEvent('exposure_section_changed', properties: {
        'section': section,
      });

  Future<void> trackExposureLaunchAnnouncementShown() =>
      trackEvent('exposure_launch_announcement_shown');

  Future<void> trackExposureLaunchAnnouncementExplored() =>
      trackEvent('exposure_launch_announcement_explored');

  Future<void> trackExposureLaunchAnnouncementDismissed({
    String? source,
  }) =>
      trackEvent('exposure_launch_announcement_dismissed', properties: {
        if (source != null) 'source': source,
      });

  Future<void> trackExposureFavoritesIntroDismissed() =>
      trackEvent('exposure_favorites_intro_dismissed');

  Future<void> trackExposurePlaceCardTourShown() =>
      trackEvent('exposure_place_card_tour_shown');

  Future<void> trackExposurePlaceCardTourDismissed() =>
      trackEvent('exposure_place_card_tour_dismissed');

  Future<void> trackExposurePlaceSetupStarted({String? siteId}) =>
      trackEvent('exposure_place_setup_started', properties: {
        if (siteId != null) 'site_id': siteId,
      });

  Future<void> trackExposurePlaceSaved({
    required String placeType,
    required String source,
    bool? absentWeekdays,
    bool? absentWeekends,
  }) =>
      trackEvent('exposure_place_saved', properties: {
        'place_type': placeType,
        'source': source,
        if (absentWeekdays != null) 'absent_weekdays': absentWeekdays,
        if (absentWeekends != null) 'absent_weekends': absentWeekends,
      });

  Future<void> trackExposurePlaceEditOpened({String? placeType}) =>
      trackEvent('exposure_place_edit_opened', properties: {
        if (placeType != null) 'place_type': placeType,
      });

  Future<void> trackExposureHourlyDetailOpened({String? placeType}) =>
      trackEvent('exposure_hourly_detail_opened', properties: {
        if (placeType != null) 'place_type': placeType,
      });

  Future<void> trackExposureEmptyCtaTapped({
    required String cta,
    String? section,
  }) =>
      trackEvent('exposure_empty_cta_tapped', properties: {
        'cta': cta,
        if (section != null) 'section': section,
      });

  Future<void> trackExposureTripCountrySelected({required String country}) =>
      trackEvent('exposure_trip_country_selected', properties: {
        'country': country,
      });

  Future<void> trackExposureTripEndpointSelected({
    required String endpoint,
    String? country,
  }) =>
      trackEvent('exposure_trip_endpoint_selected', properties: {
        'endpoint': endpoint,
        if (country != null) 'country': country,
      });

  Future<void> trackExposureTripAnalyzed({
    String? country,
    bool? success,
  }) =>
      trackEvent('exposure_trip_analyzed', properties: {
        if (country != null) 'country': country,
        if (success != null) 'success': success,
      });
}
