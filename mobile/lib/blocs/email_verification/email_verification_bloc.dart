import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'email_verification_event.dart';
part 'email_verification_state.dart';

class EmailVerificationBloc
    extends Bloc<EmailVerificationEvent, EmailVerificationState> {
  EmailVerificationBloc()
      : super(EmailVerificationState(
          EmailAuthModel(
            token: 0,
            emailAddress: '',
            signInLink: '',
            reAuthenticationLink: '',
          ),
          AuthProcedure.signup,
        )) {
    on<InitializeEmailVerification>(_onInitializeEmailAuth);
    on<SetEmailVerificationStatus>(_onSetEmailAuthStatus);
    on<UpdateEmailVerificationCountDown>(_onUpdateEmailVerificationCountDown);
  }

  void _onUpdateEmailVerificationCountDown(
    UpdateEmailVerificationCountDown event,
    Emitter<EmailVerificationState> emit,
  ) {
    return emit(state.copyWith(codeCountDown: event.countDown));
  }

  void _onSetEmailAuthStatus(
    SetEmailVerificationStatus event,
    Emitter<EmailVerificationState> emit,
  ) {
    return emit(state.copyWith(status: event.status));
  }

  void _onInitializeEmailAuth(
    InitializeEmailVerification event,
    Emitter<EmailVerificationState> emit,
  ) {
    return emit(
        EmailVerificationState(event.emailAuthModel, event.authProcedure));
  }
}
