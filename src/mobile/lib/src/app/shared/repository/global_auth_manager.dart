import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/shared/repository/session_expiry_notifier.dart';
import 'package:loggy/loggy.dart';

class GlobalAuthManager with UiLoggy implements SessionExpiryNotifier {
  static GlobalAuthManager? _instance;
  static GlobalAuthManager get instance => _instance ??= GlobalAuthManager._();

  GlobalAuthManager._();

  AuthBloc? _authBloc;

  /// Prevents duplicate [SessionExpired] events when multiple 401 responses
  /// arrive concurrently or when the resume-check and an API 401 fire together.
  bool _sessionExpiredPending = false;

  void setAuthBloc(AuthBloc authBloc) {
    _authBloc = authBloc;
  }

  /// Fires a [SessionExpired] event at most once per authenticated session.
  /// Subsequent calls are ignored until [resetSessionExpiredGuard] is called.
  @override
  void notifySessionExpired() {
    if (_authBloc == null) {
      loggy.warning('notifySessionExpired called before AuthBloc was registered — event dropped');
      return;
    }
    if (_sessionExpiredPending) return;
    _sessionExpiredPending = true;
    _authBloc!.add(const SessionExpired());
  }

  /// Called by [AuthBloc] when the user successfully logs in or uses guest mode,
  /// so the guard resets for the next authenticated session.
  void resetSessionExpiredGuard() {
    _sessionExpiredPending = false;
  }

  bool get hasAuthBloc => _authBloc != null;
}