import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'email_auth_event.dart';
part 'email_auth_state.dart';

class EmailAuthBloc extends Bloc<EmailAuthEvent, EmailAuthState> {
  EmailAuthBloc()
      : super(const EmailAuthState.initial(
          authProcedure: AuthProcedure.signup,
        )) {
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
      blocStatus: BlocStatus.editing,
    ));
  }

  Future<void> _onClearEmailAddress(
    ClearEmailAddress _,
    Emitter<EmailAuthState> emit,
  ) async {
    return emit(state.copyWith(
      emailAddress: '',
      blocStatus: BlocStatus.initial,
    ));
  }

  Future<void> _onEmailValidationFailed(
    EmailValidationFailed event,
    Emitter<EmailAuthState> emit,
  ) async {
    return emit(state.copyWith(
      blocStatus: BlocStatus.error,
      error: event.authenticationError,
    ));
  }

  Future<void> _onEmailValidationPassed(
    EmailValidationPassed _,
    Emitter<EmailAuthState> emit,
  ) async {
    return emit(state.copyWith(
      blocStatus: BlocStatus.success,
      error: AuthenticationError.none,
    ));
  }

  Future<void> _onValidateEmailAddress(
    ValidateEmailAddress event,
    Emitter<EmailAuthState> emit,
  ) async {
    if (!state.emailAddress.isValidEmail()) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
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
        blocStatus: BlocStatus.initial,
        error: AuthenticationError.none,
      ));
    }

    emit(state.copyWith(blocStatus: BlocStatus.processing));

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    final appService = AppService();

    /*
          TODO: update status in case error occurs
    *       buildContext
          .read<EmailAuthBloc>()
          .add(const EmailValidationFailed(AuthenticationError.authFailure));
    *
    * */

    switch (state.authProcedure) {
      case AuthProcedure.login:
        await CustomAuth.sendEmailAuthCode(
          emailAddress: state.emailAddress,
          buildContext: event.context,
          authProcedure: state.authProcedure,
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
                        blocStatus: BlocStatus.error,
                        error: AuthenticationError.emailTaken,
                      )),
                    }
                  else
                    {
                      CustomAuth.sendEmailAuthCode(
                        emailAddress: state.emailAddress,
                        buildContext: event.context,
                        authProcedure: state.authProcedure,
                      ),
                    },
                });
        break;
      case AuthProcedure.anonymousLogin:
      case AuthProcedure.deleteAccount:
      case AuthProcedure.logout:
      case AuthProcedure.none:
        break;
    }

    return;
  }
}
