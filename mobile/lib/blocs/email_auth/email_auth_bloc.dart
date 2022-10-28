import 'dart:async';

import 'package:app/utils/extensions.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

import '../../models/enum_constants.dart';
import '../../services/app_service.dart';
import '../../services/firebase_service.dart';
import '../../utils/network.dart';
import '../../widgets/dialogs.dart';

part 'email_auth_event.dart';
part 'email_auth_state.dart';

class EmailAuthBloc extends Bloc<EmailAuthEvent, EmailAuthState> {
  EmailAuthBloc()
      : super(
            const EmailAuthState.initial(authProcedure: AuthProcedure.signup)) {
    on<ValidateEmailAddress>(_onValidateEmailAddress);
    on<EmailValidationFailed>(_onEmailValidationFailed);
    on<EmailValidationPassed>(_onEmailValidationPassed);
    on<UpdateEmailAddress>(_onUpdateEmailAddress);
    on<ClearEmailAddress>(_onClearEmailAddress);
    on<InitializeEmailAuth>(_onInitializeEmailAuth);
  }

  Future<void> _onInitializeEmailAuth(
    InitializeEmailAuth event,
    Emitter<EmailAuthState> emit,
  ) async {
    return emit(EmailAuthState.initial(
      authProcedure: event.authProcedure,
      emailAddress: event.emailAddress,
    ));
  }

  Future<void> _onUpdateEmailAddress(
    UpdateEmailAddress event,
    Emitter<EmailAuthState> emit,
  ) async {
    return emit(state.copyWith(
      emailAddress: event.emailAddress,
      authStatus: AuthStatus.editing,
    ));
  }

  Future<void> _onClearEmailAddress(
    ClearEmailAddress event,
    Emitter<EmailAuthState> emit,
  ) async {
    return emit(state.copyWith(
      emailAddress: '',
      authStatus: AuthStatus.initial,
    ));
  }

  Future<void> _onEmailValidationFailed(
    EmailValidationFailed event,
    Emitter<EmailAuthState> emit,
  ) async {
    return emit(state.copyWith(
      authStatus: AuthStatus.error,
      error: event.authenticationError,
    ));
  }

  Future<void> _onEmailValidationPassed(
    EmailValidationPassed event,
    Emitter<EmailAuthState> emit,
  ) async {
    return emit(state.copyWith(
      authStatus: AuthStatus.success,
      error: AuthenticationError.none,
    ));
  }

  Future<void> _onValidateEmailAddress(
    ValidateEmailAddress event,
    Emitter<EmailAuthState> emit,
  ) async {
    if (!state.emailAddress.isValidEmail()) {
      return emit(state.copyWith(
        authStatus: AuthStatus.error,
        error: AuthenticationError.invalidEmailAddress,
      ));
    }

    final confirmation = await showDialog<ConfirmationAction>(
      context: event.context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AuthMethodDialog(
          credentials: state.emailAddress,
          authMethod: AuthMethod.email,
        );
      },
    );

    if (confirmation == null || confirmation == ConfirmationAction.cancel) {
      return emit(state.copyWith(
        authStatus: AuthStatus.initial,
        error: AuthenticationError.none,
      ));
    }

    emit(state.copyWith(authStatus: AuthStatus.processing));

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        authStatus: AuthStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    final appService = AppService();

    switch (state.authProcedure) {
      case AuthProcedure.login:
        await CustomAuth.sendEmailAuthCode(
          state.emailAddress,
          event.context,
        );
        break;
      case AuthProcedure.signup:
        await appService
            .doesUserExist(
              emailAddress: state.emailAddress,
            )
            .then((exists) => {
                  if (exists)
                    {
                      emit(state.copyWith(
                        authStatus: AuthStatus.error,
                        error: AuthenticationError.emailTaken,
                      ))
                    }
                  else
                    {
                      CustomAuth.sendEmailAuthCode(
                        state.emailAddress,
                        event.context,
                      ),
                    }
                });
        break;
      case AuthProcedure.anonymousLogin:
        break;
      case AuthProcedure.deleteAccount:
        break;
      case AuthProcedure.logout:
        break;
    }

    return;
  }
}
