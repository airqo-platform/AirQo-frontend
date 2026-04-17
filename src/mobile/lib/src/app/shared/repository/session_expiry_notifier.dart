/// Abstraction that [BaseRepository] depends on to signal a session expiry.
///
/// Decouples HTTP infrastructure from the concrete [GlobalAuthManager],
/// satisfying the Dependency Inversion Principle.
abstract class SessionExpiryNotifier {
  void notifySessionExpired();
}
