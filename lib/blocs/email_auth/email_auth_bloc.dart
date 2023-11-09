import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'email_auth_event.dart';
part 'email_auth_state.dart';

class EmailAuthBloc extends Bloc<EmailAuthEvent, EmailAuthState> {
  EmailAuthBloc() : super(const EmailAuthState()) {
    on<InitializeEmailAuth>(_onInitializeEmailAuth);
    on<SetEmailAuthStatus>(_onSetEmailAuthStatus);
  }

  void _onSetEmailAuthStatus(
    SetEmailAuthStatus event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(state.copyWith(
      status: event.status,
      errorMessage: event.errorMessage,
    ));
  }

  void _onInitializeEmailAuth(
    InitializeEmailAuth event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(EmailAuthState(authProcedure: event.authProcedure));
  }
}
