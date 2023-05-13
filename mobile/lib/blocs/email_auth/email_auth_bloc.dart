import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'email_auth_event.dart';
part 'email_auth_state.dart';

class EmailAuthBloc extends Bloc<EmailAuthEvent, EmailAuthState> {
  final AirqoApiClient apiClient;

  EmailAuthBloc(this.apiClient) : super(const EmailAuthState()) {
    on<ValidateEmailAddress>(_onValidateEmailAddress);
    on<UpdateEmailAddress>(_onUpdateEmailAddress);
    on<ClearEmailAddress>(_onClearEmailAddress);
    on<InitializeEmailAuth>(_onInitializeEmailAuth);
  }

  void _onInitializeEmailAuth(
    InitializeEmailAuth event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(EmailAuthState(
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
    return emit(EmailAuthState(authProcedure: state.authProcedure));
  }

  Future<void> _onValidateEmailAddress(
    ValidateEmailAddress _,
    Emitter<EmailAuthState> emit,
  ) async {
    emit(state.copyWith(loading: true));

    if (state.emailAddress.isEmpty) {
      return emit(state.copyWith(
        status: EmailAuthStatus.invalidEmailAddress,
        errorMessage: 'Email address can\'t be blank',
      ));
    }

    if (!state.emailAddress.isValidEmail()) {
      return emit(state.copyWith(
        status: EmailAuthStatus.invalidEmailAddress,
        errorMessage: 'Invalid Email address',
      ));
    }

    final hasConnection = await hasNetworkConnection();

    if (!hasConnection) {
      return emit(state.copyWith(
        status: EmailAuthStatus.error,
        errorMessage: 'Check your internet connection',
      ));
    }

    switch (state.authProcedure) {
      case AuthProcedure.login:
        final bool? exists = await apiClient.checkIfUserExists(
          emailAddress: state.emailAddress,
        );
        if (exists == null) {
          return emit(state.copyWith(
            status: EmailAuthStatus.error,
            errorMessage: "Failed to send verification code. Try again later",
          ));
        }

        if (!exists) {
          return emit(state.copyWith(
            status: EmailAuthStatus.emailAddressDoesNotExist,
            errorMessage: 'This email address is not linked to any account.',
          ));
        }
        break;

      case AuthProcedure.signup:
        final bool? exists = await apiClient.checkIfUserExists(
          emailAddress: state.emailAddress,
        );

        if (exists == null) {
          return emit(state.copyWith(
            status: EmailAuthStatus.error,
            errorMessage: "Failed to send verification code. Try again later",
          ));
        }

        if (exists) {
          return emit(state.copyWith(
            status: EmailAuthStatus.emailAddressTaken,
            errorMessage: "An account already exists with this email address",
          ));
        }
        break;

      case AuthProcedure.anonymousLogin:
      case AuthProcedure.deleteAccount:
      case AuthProcedure.logout:
        break;
    }

    await apiClient
        .sendEmailVerificationCode(state.emailAddress)
        .then((emailAuthModel) {
      if (emailAuthModel == null) {
        return emit(state.copyWith(
          status: EmailAuthStatus.error,
          errorMessage: "Failed to send verification code. Try again later",
        ));
      }

      return emit(state.copyWith(
        status: EmailAuthStatus.verificationCodeSent,
        emailAuthModel: emailAuthModel,
      ));
    });
  }
}
