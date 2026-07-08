import 'package:airqo/src/app/shared/services/analytics_service.dart';

extension DashboardAnalyticsEvents on AnalyticsService {
  Future<void> trackDashboardViewed() => trackEvent('dashboard_viewed');

  Future<void> trackDashboardRefreshed() => trackEvent('dashboard_refreshed');

  Future<void> trackMapViewed() => trackEvent('map_viewed');

  Future<void> trackLocationSearched({String? location}) =>
      trackEvent('location_searched', properties: {
        if (location != null) 'location': location,
      });

  Future<void> trackForecastViewed({String? siteId, String? siteName}) =>
      trackEvent('forecast_viewed', properties: {
        if (siteId != null) 'site_id': siteId,
        if (siteName != null) 'site_name': siteName,
      });

  Future<void> trackForecastScopeChanged({required String scope}) =>
      trackEvent('forecast_scope_changed', properties: {'scope': scope});
}
