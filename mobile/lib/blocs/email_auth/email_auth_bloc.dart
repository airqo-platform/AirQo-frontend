import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'email_auth_event.dart';
part 'email_auth_state.dart';

class EmailAuthBloc extends Bloc<EmailAuthEvent, EmailAuthState> {
  EmailAuthBloc()
      : super(const EmailAuthState.initial(
          authProcedure: AuthProcedure.signup,
        )) {
    on<EmailVerificationCodeSent>(_onEmailVerificationCodeSent);
    on<ValidateEmailAddress>(_onValidateEmailAddress);
    on<UpdateEmailCountDown>(_onUpdateEmailCountDown);
    on<UpdateEmailAuthCode>(_onUpdateEmailAuthCode);
    on<UpdateEmailAddress>(_onUpdateEmailAddress);
    on<ClearEmailAddress>(_onClearEmailAddress);
    on<VerifyEmailCode>(_verifyEmailCode);
    on<EmailValidationFailed>(_onEmailValidationFailed);
    on<InitializeEmailAuth>(_onInitializeEmailAuth);
  }

  Future<void> _verifyEmailCode(
    VerifyEmailCode event,
    Emitter<EmailAuthState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        status: EmailBlocStatus.error,
        error: EmailBlocError.noInternetConnection,
      ));
    }

    if (state.inputAuthCode != state.validAuthCode) {
      return emit(state.copyWith(
        error: EmailBlocError.invalidCode,
        status: EmailBlocStatus.error,
      ));
    }

    try {
      final emailCredential = EmailAuthProvider.credentialWithLink(
        emailLink: state.verificationLink,
        email: state.emailAddress,
      );

      final signInSuccess = await CustomAuth.firebaseSignIn(emailCredential);

      return emit(state.copyWith(
        error: signInSuccess
            ? EmailBlocError.none
            : EmailBlocError.verificationFailed,
        status: signInSuccess
            ? EmailBlocStatus.verificationSuccessful
            : EmailBlocStatus.error,
      ));
    } on FirebaseAuthException catch (exception, _) {
      final error = CustomAuth.getFirebaseExceptionMessage(exception);
      return emit(state.copyWith(
        errorMessage: error.message,
        status: EmailBlocStatus.error,
        error: EmailBlocError.verificationFailed,
      ));
    } catch (exception, stackTrace) {
      emit(state.copyWith(
        status: EmailBlocStatus.error,
        error: EmailBlocError.verificationFailed,
      ));
      await logException(exception, stackTrace);
    }
  }

  void _onUpdateEmailAuthCode(
    UpdateEmailAuthCode event,
    Emitter<EmailAuthState> emit,
  ) {
    emit(state.copyWith(
      inputAuthCode: event.value,
      errorMessage: "",
      error: EmailBlocError.none,
      status: EmailBlocStatus.initial,
    ));
  }

  void _onUpdateEmailCountDown(
    UpdateEmailCountDown event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(state.copyWith(codeCountDown: event.countDown));
  }

  void _onEmailVerificationCodeSent(
    EmailVerificationCodeSent event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(state.copyWith(
      validAuthCode: event.token.toString(),
      verificationLink: event.verificationLink,
      error: EmailBlocError.none,
      errorMessage: "",
      status: EmailBlocStatus.verificationCodeSent,
    ));
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

  void _onUpdateEmailAddress(
    UpdateEmailAddress event,
    Emitter<EmailAuthState> emit,
  ) {
    return emit(state.copyWith(emailAddress: event.emailAddress));
  }

  Future<void> _onClearEmailAddress(
    ClearEmailAddress _,
    Emitter<EmailAuthState> emit,
  ) async {
    return emit(state.copyWith(
      emailAddress: '',
      status: EmailBlocStatus.initial,
    ));
  }

  Future<void> _onEmailValidationFailed(
    EmailValidationFailed event,
    Emitter<EmailAuthState> emit,
  ) async {
    return emit(state.copyWith(
        status: EmailBlocStatus.error,
        error: EmailBlocError.verificationFailed,
        errorMessage: "Verification failed. Try again later"));
  }

  // Future<void> _onEmailValidationPassed(
  //   EmailValidationPassed _,
  //   Emitter<EmailAuthState> emit,
  // ) async {
  //   return emit(state.copyWith(
  //     status: EmailBlocStatus.verificationSuccessful,
  //     error: EmailBlocError.none,
  //   ));
  // }

  Future<void> _onValidateEmailAddress(
    ValidateEmailAddress event,
    Emitter<EmailAuthState> emit,
  ) async {
    if (!state.emailAddress.isValidEmail()) {
      return emit(state.copyWith(
        status: EmailBlocStatus.error,
        error: EmailBlocError.invalidEmailAddress,
      ));
    }

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        status: EmailBlocStatus.error,
        error: EmailBlocError.noInternetConnection,
      ));
    }
    if (event.showConfirmationDialog) {
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
          status: EmailBlocStatus.initial,
          error: EmailBlocError.none,
        ));
      }
    }

    emit(state.copyWith(status: EmailBlocStatus.processing));

    if (state.authProcedure == AuthProcedure.signup) {
      bool exists = await AirqoApiClient().checkIfUserExists(
        emailAddress: state.emailAddress,
      );
      if (exists) {
        return emit(state.copyWith(
          status: EmailBlocStatus.error,
          error: EmailBlocError.emailTaken,
        ));
      }
    }

    await CustomAuth.initiateEmailVerification(
      emailAddress: state.emailAddress,
      buildContext: event.context,
      authProcedure: state.authProcedure,
    );

    return;
  }
}
