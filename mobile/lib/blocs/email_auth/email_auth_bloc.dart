import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'email_auth_event.dart';
part 'email_auth_state.dart';

class EmailAuthBloc extends Bloc<EmailAuthEvent, EmailAuthState> {
  EmailAuthBloc() : super(EmailAuthState.initial()) {
    on<UpdateEmailAddress>(_onUpdateEmailAddress);
    on<ClearEmailAddress>(_onClearEmailAddress);
    on<InitializeEmailAuth>(_onInitializeEmailAuth);
    on<UpdateEmailAuthStatus>(_onUpdateEmailAuthStatus);
    on<UpdateEmailAuthErrorMessage>(_onUpdateEmailAuthErrorMessage);
    on<UpdateEmailAuthModel>(_onUpdateEmailAuthModel);
    on<UpdateEmailAuthCountDown>(_onUpdateEmailAuthCountDown);
    on<UpdateEmailInputCode>(_onUpdateEmailInputCode);
  }

  void _onUpdateEmailInputCode(
    UpdateEmailInputCode event,
    Emitter<EmailAuthState> emit,
  ) {
    emit(state.copyWith(
        emailAuthModel: state.emailAuthModel.copyWith(inputToken: event.code)));
  }

  void _onUpdateEmailAuthCountDown(
    UpdateEmailAuthCountDown event,
    Emitter<EmailAuthState> emit,
  ) {
    emit(state.copyWith(codeCountDown: event.countDown));
  }

  void _onUpdateEmailAuthStatus(
    UpdateEmailAuthStatus event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(state.copyWith(status: event.status));
  }

  void _onUpdateEmailAuthErrorMessage(
    UpdateEmailAuthErrorMessage event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(state.copyWith(errorMessage: event.errorMessage));
  }

  void _onUpdateEmailAuthModel(
    UpdateEmailAuthModel event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(state.copyWith(emailAuthModel: event.model));
  }

  void _onInitializeEmailAuth(
    InitializeEmailAuth event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(EmailAuthState.initial().copyWith(
      authProcedure: event.authProcedure,
      emailAddress: event.emailAddress,
    ));
  }

  void _onUpdateEmailAddress(
    UpdateEmailAddress event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(state.copyWith(emailAddress: event.emailAddress));
  }

  void _onClearEmailAddress(
    ClearEmailAddress _,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(
      EmailAuthState.initial().copyWith(
        authProcedure: state.authProcedure,
      ),
    );
  }
}
