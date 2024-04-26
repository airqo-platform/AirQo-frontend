import 'dart:async';

import 'package:app/other/lib/blocs/app/app_state.dart';
import 'package:app/other/lib/models/user_model.dart';
import 'package:app/other/lib/repositories/auth_repository.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'app_event.dart';

class AppBloc extends Bloc<AppEvent, AppState> {
  final AuthRepository _authRepository;
  StreamSubscription<User?>?
      _userSubscription; // Use User? since it can be null

  AppBloc({required AuthRepository authRepository})
      : _authRepository = authRepository,
        super(
          AppState.unauthenticated(),
        ) {
    _userSubscription = _authRepository.user.listen(
      (user) => add(AppUserChanged(user as User)),
    ) as StreamSubscription<User?>?;

    on<AppUserChanged>(_onUserChanged);
    on<AppLogoutRequested>(_onLogoutRequested);
  }

  void _onUserChanged(
    AppUserChanged event,
    Emitter<AppState> emit,
  ) {
    emit(AppState.authenticated(
      event.user,
    )); // Use event.user! to access non-null User
  }

  void _onLogoutRequested(
    AppLogoutRequested event,
    Emitter<AppState> emit,
  ) {
    unawaited(_authRepository.logOut());
  }

  @override
  Future<void> close() {
    _userSubscription?.cancel();
    return super.close();
  }
}
