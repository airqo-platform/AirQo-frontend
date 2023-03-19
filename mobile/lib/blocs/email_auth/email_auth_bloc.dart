import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
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
    return emit(const EmailAuthState());
  }

  Future<void> _onValidateEmailAddress(
    ValidateEmailAddress event,
    Emitter<EmailAuthState> emit,
  ) async {
    emit(state.copyWith(loading: true));

    if (state.emailAddress.isEmpty) {
      return emit(state.copyWith(
        status: EmailAuthStatus.invalidEmailAddress,
        errorMessage: 'Email address can\'t be blank',
        loading: false,
      ));
    }

    if (!state.emailAddress.isValidEmail()) {
      return emit(state.copyWith(
        status: EmailAuthStatus.invalidEmailAddress,
        errorMessage: 'Invalid Email address',
        loading: false,
      ));
    }

    final hasConnection = await hasNetworkConnection();

    if (!hasConnection) {
      return emit(state.copyWith(
        status: EmailAuthStatus.error,
        errorMessage: 'Check your internet connection',
        loading: false,
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
            loading: false,
          ));
        }

        if (!exists) {
          return emit(state.copyWith(
            status: EmailAuthStatus.emailAddressDoesNotExist,
            errorMessage: 'This email address is not linked to any account.',
            loading: false,
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
            loading: false,
          ));
        }

        if (exists) {
          return emit(state.copyWith(
            status: EmailAuthStatus.emailAddressTaken,
            errorMessage: "An account already exists with this email address",
            loading: false,
          ));
        }
        break;

      case AuthProcedure.anonymousLogin:
      case AuthProcedure.deleteAccount:
      case AuthProcedure.none:
      case AuthProcedure.logout:
        break;
    }

    await apiClient
        .requestEmailVerificationCode(state.emailAddress, false)
        .then((emailAuthModel) {
      if (emailAuthModel == null) {
        return emit(state.copyWith(
          status: EmailAuthStatus.error,
          errorMessage: "Failed to send verification code. Try again later",
          loading: false,
        ));
      }

      return emit(state.copyWith(
        status: EmailAuthStatus.verificationCodeSent,
        emailAuthModel: emailAuthModel,
        loading: false,
      ));
    });

    // final appService = AppService();
    //
    // try {
    //   switch (state.authProcedure) {
    //     case AuthProcedure.login:
    //       await CustomAuth.sendEmailAuthCode(
    //         emailAddress: state.emailAddress,
    //         buildContext: event.context,
    //         authProcedure: state.authProcedure,
    //       );
    //       break;
    //     case AuthProcedure.signup:
    //       await appService
    //           .doesUserExist(
    //         emailAddress: state.emailAddress,
    //       )
    //           .then((exists) => {
    //         if (exists)
    //           {
    //             emit(state.copyWith(
    //               blocStatus: BlocStatus.error,
    //               error: AuthenticationError.emailTaken,
    //             )),
    //           }
    //         else
    //           {
    //             CustomAuth.sendEmailAuthCode(
    //               emailAddress: state.emailAddress,
    //               buildContext: event.context,
    //               authProcedure: state.authProcedure,
    //             ),
    //           },
    //       });
    //       break;
    //     case AuthProcedure.anonymousLogin:
    //     case AuthProcedure.deleteAccount:
    //     case AuthProcedure.logout:
    //     case AuthProcedure.none:
    //       break;
    //   }
    // } on FirebaseAuthException catch (exception, _) {
    //   final error = CustomAuth.getFirebaseErrorCodeMessage(exception.code);
    //
    //   return emit(state.copyWith(
    //     error: error,
    //     blocStatus: BlocStatus.error,
    //   ));
    // } catch (exception, stackTrace) {
    //   emit(state.copyWith(
    //     error: AuthenticationError.authFailure,
    //     blocStatus: BlocStatus.error,
    //   ));
    //   await logException(exception, stackTrace);
    // }
    //
    // return;
  }

// Future<void> _onEmailValidationFailed(
//   EmailValidationFailed event,
//   Emitter<EmailAuthState> emit,
// ) async {
//   return emit(state.copyWith(
//     blocStatus: BlocStatus.error,
//     error: event.authenticationError,
//   ));
// }

// Future<void> _onEmailValidationPassed(
//   EmailValidationPassed _,
//   Emitter<EmailAuthState> emit,
// ) async {
//   return emit(state.copyWith(
//     blocStatus: BlocStatus.success,
//     error: AuthenticationError.none,
//   ));
// }
}
