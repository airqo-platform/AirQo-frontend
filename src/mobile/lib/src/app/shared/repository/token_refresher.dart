import 'package:airqo/src/app/auth/services/auth_helper.dart';

/// Abstraction that [BaseRepository] depends on to silently refresh an
/// expired JWT before making authenticated requests.
///
/// Decouples HTTP infrastructure from the concrete [AuthHelper],
/// satisfying the Dependency Inversion Principle — mirrors how
/// [SessionExpiryNotifier] is handled.
abstract class TokenRefresher {
  /// Returns a valid token (refreshed if the stored one was expired), or
  /// `null` if no token is stored or the refresh request fails.
  Future<String?> refreshTokenIfNeeded();
}

/// Production implementation — delegates to [AuthHelper].
class DefaultTokenRefresher implements TokenRefresher {
  const DefaultTokenRefresher();

  @override
  Future<String?> refreshTokenIfNeeded() => AuthHelper.refreshTokenIfNeeded();
}
