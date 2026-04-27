/// Thrown by [BaseRepository] when the server returns a 401 response,
/// indicating the user's authentication token is no longer valid.
///
/// Callers should NOT catch this themselves — it propagates to [AuthBloc]
/// via [SessionExpiryNotifier] and is handled globally.
class SessionExpiredException implements Exception {
  const SessionExpiredException();

  @override
  String toString() => 'SessionExpiredException: Your session has expired. Please log in again.';
}
