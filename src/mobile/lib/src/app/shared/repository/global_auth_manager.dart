import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';

class GlobalAuthManager {
  static GlobalAuthManager? _instance;
  static GlobalAuthManager get instance => _instance ??= GlobalAuthManager._();
  
  GlobalAuthManager._();
  
  AuthBloc? _authBloc;
  
  void setAuthBloc(AuthBloc authBloc) {
    _authBloc = authBloc;
  }
  
  void notifySessionExpired() {
    _authBloc?.add(const SessionExpired());
  }
  
  bool get hasAuthBloc => _authBloc != null;
}