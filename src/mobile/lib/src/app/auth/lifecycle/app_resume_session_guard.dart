import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/shared/repository/global_auth_manager.dart';
import 'package:airqo/src/app/shared/repository/session_expiry_notifier.dart';
import 'package:airqo/src/app/shared/repository/token_refresher.dart';

class AppResumeSessionGuard {
  final TokenRefresher _tokenRefresher;
  final SessionExpiryNotifier _sessionExpiryNotifier;

  AppResumeSessionGuard({
    TokenRefresher? tokenRefresher,
    SessionExpiryNotifier? sessionExpiryNotifier,
  })  : _tokenRefresher = tokenRefresher ?? const DefaultTokenRefresher(),
        _sessionExpiryNotifier =
            sessionExpiryNotifier ?? GlobalAuthManager.instance;

  Future<void> handleAuthState(
    AuthState currentState, {
    required bool isMounted,
  }) async {
    if (currentState is! AuthLoaded) return;

    final token = await _tokenRefresher.refreshTokenIfNeeded();
    if (token == null && isMounted) {
      _sessionExpiryNotifier.notifySessionExpired();
    }
  }
}
