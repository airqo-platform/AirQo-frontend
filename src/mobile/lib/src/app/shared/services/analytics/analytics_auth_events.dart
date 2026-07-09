import 'package:airqo/src/app/shared/services/analytics_service.dart';

extension AuthAnalyticsEvents on AnalyticsService {
  Future<void> trackUserRegistered({String? method}) =>
      trackEvent('user_registered', properties: {'method': method ?? 'email'});

  Future<void> trackUserLoggedIn({String? method}) =>
      trackEvent('user_logged_in', properties: {'method': method ?? 'email'});

  Future<void> trackUserLoggedOut() => trackEvent('user_logged_out');

  Future<void> trackEmailVerified() => trackEvent('email_verified');

  Future<void> trackPasswordResetInitiated() =>
      trackEvent('password_reset_initiated');

  Future<void> trackGuestModeAccessed() => trackEvent('guest_mode_accessed');
}
