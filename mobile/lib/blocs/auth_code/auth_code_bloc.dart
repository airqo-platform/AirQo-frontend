import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'auth_code_event.dart';
part 'auth_code_state.dart';

class AuthCodeBloc extends Bloc<AuthCodeEvent, AuthCodeState> {
  final AirqoApiClient apiClient;

  AuthCodeBloc(this.apiClient) : super(const AuthCodeState()) {
    on<UpdateAuthCode>(_onUpdateAuthCode);
    on<VerifyAuthCode>(_onVerifyAuthCode);
    on<ResendAuthCode>(_onResendAuthCode);
    on<InitializeAuthCodeState>(_onInitializeAuthCodeState);
    on<ClearAuthCodeState>(_onClearAuthCodeState);
    on<UpdateCountDown>(_updateCountDown);
    on<UpdateAuthCodeStatus>(_onUpdateAuthCodeStatus);
  }
  void _onUpdateAuthCodeStatus(
    UpdateAuthCodeStatus event,
    Emitter<AuthCodeState> emit,
  ) {
    return emit(state.copyWith(status: event.status));
  }

  Future<void> _verifyEmailCode(
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(loading: true));

    final hasConnection = await hasNetworkConnection();

    if (!hasConnection) {
      return emit(state.copyWith(
        status: AuthCodeStatus.error,
        errorMessage: 'Check your internet connection',
        loading: false,
      ));
    }

    EmailAuthModel? emailAuthModel = state.emailAuthModel;

    if (emailAuthModel == null) {
      return emit(state.copyWith(
        status: AuthCodeStatus.error,
        errorMessage: 'Failed to validate code. Try again later',
        loading: false,
      ));
    }

    if (int.parse(state.inputAuthCode) != emailAuthModel.token) {
      return emit(state.copyWith(status: AuthCodeStatus.invalidCode));
    }

    try {
      String emailLink = "";
      switch (state.authProcedure) {
        case AuthProcedure.login:
        case AuthProcedure.signup:
          emailLink = emailAuthModel.signInLink;
          break;
        case AuthProcedure.anonymousLogin:
        case AuthProcedure.deleteAccount:
          emailLink = emailAuthModel.reAuthenticationLink;
          break;
        case AuthProcedure.logout:
          break;
      }

      final emailCredential = EmailAuthProvider.credentialWithLink(
        emailLink: emailLink,
        email: emailAuthModel.emailAddress,
      );

      final bool authenticationSuccessful =
          await CustomAuth.firebaseSignIn(emailCredential);
      if (authenticationSuccessful) {
        return emit(state.copyWith(
          status: AuthCodeStatus.success,
        ));
      }
    } on FirebaseAuthException catch (exception, _) {
      final firebaseAuthError =
          CustomAuth.getFirebaseErrorCodeMessage(exception.code);

      switch (firebaseAuthError) {
        case FirebaseAuthError.noInternetConnection:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage: 'Check your internet connection',
            loading: false,
          ));
        case FirebaseAuthError.accountInvalid:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage: 'Failed to validate code. Try again later',
            loading: false,
          ));
        case FirebaseAuthError.invalidAuthCode:
          return emit(state.copyWith(status: AuthCodeStatus.invalidCode));
        case FirebaseAuthError.authSessionTimeout:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage:
                'You took a tad too long but no worries, we can send you another ',
            loading: false,
          ));
        case FirebaseAuthError.authFailure:
        case FirebaseAuthError.logInRequired:
        case FirebaseAuthError.phoneNumberTaken:
        case FirebaseAuthError.invalidPhoneNumber:
          break;
        case FirebaseAuthError.invalidEmailAddress:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage: 'Failed to validate code. Try again later',
            loading: false,
          ));
        case FirebaseAuthError.accountTaken:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage: 'Failed to validate code. Try again later',
            loading: false,
          ));
        case FirebaseAuthError.emailTaken:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage: 'Failed to validate code. Try again later',
            loading: false,
          ));
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return emit(state.copyWith(
      status: AuthCodeStatus.error,
      errorMessage: 'Failed to validate code. Try again later',
    ));
  }

  Future<void> _verifyPhoneSmsCode(
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(loading: true));

    final hasConnection = await hasNetworkConnection();

    if (!hasConnection) {
      return emit(state.copyWith(
        status: AuthCodeStatus.error,
        errorMessage: 'Check your internet connection',
        loading: false,
      ));
    }

    PhoneAuthModel? phoneAuthModel = state.phoneAuthModel;
    if (phoneAuthModel == null) {
      return emit(state.copyWith(
        status: AuthCodeStatus.error,
        errorMessage: 'Failed to validate code. Try again later',
        loading: false,
      ));
    }

    try {
      final phoneCredential = PhoneAuthProvider.credential(
        verificationId: phoneAuthModel.verificationId ?? "",
        smsCode: state.inputAuthCode,
      );
      final authCredential =
          phoneAuthModel.phoneAuthCredential ?? phoneCredential;

      final bool authenticationSuccessful =
          await CustomAuth.firebaseSignIn(authCredential);
      if (authenticationSuccessful) {
        return emit(state.copyWith(
          status: AuthCodeStatus.success,
        ));
      }
    } on FirebaseAuthException catch (exception, _) {
      final firebaseAuthError =
          CustomAuth.getFirebaseErrorCodeMessage(exception.code);

      switch (firebaseAuthError) {
        case FirebaseAuthError.noInternetConnection:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage: 'Check your internet connection',
            loading: false,
          ));
        case FirebaseAuthError.accountInvalid:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage: 'Failed to validate code. Try again later',
            loading: false,
          ));
        case FirebaseAuthError.invalidAuthCode:
          return emit(state.copyWith(status: AuthCodeStatus.invalidCode));
        case FirebaseAuthError.authSessionTimeout:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage:
                'You took a tad too long but no worries, we can send you another ',
            loading: false,
          ));
        case FirebaseAuthError.authFailure:
        case FirebaseAuthError.logInRequired:
        case FirebaseAuthError.phoneNumberTaken:
        case FirebaseAuthError.invalidPhoneNumber:
          break;
        case FirebaseAuthError.invalidEmailAddress:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage: 'Failed to validate code. Try again later',
            loading: false,
          ));
        case FirebaseAuthError.accountTaken:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage: 'Failed to validate code. Try again later',
            loading: false,
          ));
        case FirebaseAuthError.emailTaken:
          return emit(state.copyWith(
            status: AuthCodeStatus.error,
            errorMessage: 'Failed to validate code. Try again later',
            loading: false,
          ));
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return emit(state.copyWith(
      status: AuthCodeStatus.error,
      errorMessage: 'Failed to validate code. Try again later',
    ));
  }

  void _onInitializeAuthCodeState(
    InitializeAuthCodeState event,
    Emitter<AuthCodeState> emit,
  ) {
    emit(AuthCodeState(
      authProcedure: event.authProcedure,
      authMethod: event.authMethod,
      emailAuthModel: event.emailAuthModel,
      phoneAuthModel: event.phoneAuthModel,
    ));
  }

  void _onClearAuthCodeState(
    ClearAuthCodeState _,
    Emitter<AuthCodeState> emit,
  ) {
    emit(const AuthCodeState());
  }

  void _onUpdateAuthCode(
    UpdateAuthCode event,
    Emitter<AuthCodeState> emit,
  ) {
    return emit(state.copyWith(inputAuthCode: event.value));
  }

  Future<void> _onVerifyAuthCode(
    VerifyAuthCode event,
    Emitter<AuthCodeState> emit,
  ) async {
    switch (state.authMethod) {
      case AuthMethod.phone:
        await _verifyPhoneSmsCode(emit);
        break;
      case AuthMethod.email:
        await _verifyEmailCode(emit);
        break;
    }
  }

  void _updateCountDown(
    UpdateCountDown event,
    Emitter<AuthCodeState> emit,
  ) {
    emit(state.copyWith(codeCountDown: event.countDown));
  }

  Future<void> _onResendAuthCode(
    ResendAuthCode event,
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(loading: true));

    final hasConnection = await hasNetworkConnection();

    if (!hasConnection) {
      return emit(state.copyWith(
        status: AuthCodeStatus.error,
        errorMessage: 'Check your internet connection',
      ));
    }

    try {
      switch (state.authMethod) {
        case AuthMethod.phone:
          break;
        case AuthMethod.email:
          EmailAuthModel? emailAuthModel = state.emailAuthModel;
          if (emailAuthModel == null) {
            return emit(state.copyWith(
              status: AuthCodeStatus.error,
              errorMessage: 'Failed to resend code. Try again later',
            ));
          }

          await apiClient
              .requestEmailVerificationCode(emailAuthModel.emailAddress, false)
              .then((emailAuthModel) {
            if (emailAuthModel == null) {
              return emit(state.copyWith(
                status: AuthCodeStatus.error,
                errorMessage: "Failed to send code. Try again later",
              ));
            }

            return emit(const AuthCodeState().copyWith(
              emailAuthModel: emailAuthModel,
              authProcedure: state.authProcedure,
              authMethod: state.authMethod,
            ));
          });
          break;
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
      return emit(state.copyWith(
        status: AuthCodeStatus.error,
        errorMessage: "Failed to send verification code. Try again later",
      ));
    }
  }
}
