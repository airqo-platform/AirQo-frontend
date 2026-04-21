import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:loggy/loggy.dart';

class GlobalAuthManager with UiLoggy {
  static GlobalAuthManager? _instance;
  static GlobalAuthManager get instance => _instance ??= GlobalAuthManager._();

  GlobalAuthManager._();

  AuthBloc? _authBloc;

  // Prevents duplicate SessionExpired events when multiple 401s arrive concurrently.
  bool _sessionExpiredPending = false;

  void setAuthBloc(AuthBloc authBloc) {
    _authBloc = authBloc;
  }

  /// Fires [SessionExpired] at most once per authenticated session.
  /// Ignored until [resetSessionExpiredGuard] is called after a new login.
  void notifySessionExpired() {
    if (_authBloc == null) {
      loggy.warning('notifySessionExpired called before AuthBloc was registered — event dropped');
      return;
    }
    if (_sessionExpiredPending) return;
    _sessionExpiredPending = true;
    _authBloc!.add(const SessionExpired());
  }

  void resetSessionExpiredGuard() {
    _sessionExpiredPending = false;
  }

  bool get hasAuthBloc => _authBloc != null;
}
