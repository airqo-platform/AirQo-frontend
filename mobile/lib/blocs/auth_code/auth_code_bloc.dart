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
  AuthCodeBloc() : super(const AuthCodeState.initial()) {
    on<UpdateAuthCode>(_onUpdateAuthCode);
    on<VerifyAuthCode>(_onVerifyAuthCode);
    on<ResendAuthCode>(_onResendAuthCode);
    on<InitializeAuthCodeState>(_onInitializeAuthCodeState);
    on<ClearAuthCodeState>(_onClearAuthCodeState);
    on<GuestUserEvent>(_onGuestUserEvent);
    on<UpdateCountDown>(_updateCountDown);
    on<UpdateVerificationId>(_onUpdateVerificationId);
    on<UpdateEmailCredentials>(_onUpdateEmailCredentials);
  }

  /// Email  verification
  Future<void> _onUpdateEmailCredentials(
    UpdateEmailCredentials event,
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(
      validAuthCode: event.emailToken.toString(),
      validEmailLink: event.emailVerificationLink,
    ));
    return emit(state.copyWith(
      validAuthCode: event.emailToken.toString(),
      validEmailLink: event.emailVerificationLink,
    ));
  }

  Future<void> _verifyEmailCode(
    Emitter<AuthCodeState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        authStatus: BlocStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    emit(state.copyWith(authStatus: BlocStatus.processing));

    if (state.inputAuthCode != state.validAuthCode) {
      return emit(state.copyWith(
        error: AuthenticationError.invalidAuthCode,
        authStatus: BlocStatus.error,
      ));
    }

    try {
      final emailCredential = EmailAuthProvider.credentialWithLink(
        emailLink: state.validEmailLink,
        email: state.emailAddress,
      );

      final authenticationSuccessful = await AppService().authenticateUser(
          authProcedure: state.authProcedure,
          authMethod: AuthMethod.email,
          authCredential: emailCredential);

      if (authenticationSuccessful) {
        return emit(const AuthCodeState.initial()
            .copyWith(authStatus: BlocStatus.success));
      } else {
        return emit(state.copyWith(
          error: AuthenticationError.authFailure,
          authStatus: BlocStatus.error,
        ));
      }
    } on FirebaseAuthException catch (exception, stackTrace) {
      final authenticationError =
          CustomAuth.getErrorFromFirebaseCode(exception.code);
      emit(state.copyWith(
        error: authenticationError,
        authStatus: BlocStatus.error,
      ));

      if (authenticationError == AuthenticationError.authFailure) {
        await logException(
          exception,
          stackTrace,
        );
      }
      return;
    } catch (exception, stackTrace) {
      emit(state.copyWith(
        error: AuthenticationError.authFailure,
        authStatus: BlocStatus.error,
      ));
      await logException(exception, stackTrace);
      return;
    }
  }

  /// Phone number verification
  Future<void> _onUpdateVerificationId(
    UpdateVerificationId event,
    Emitter<AuthCodeState> emit,
  ) async {
    return emit(state.copyWith(
        verificationId: event.verificationId, authStatus: BlocStatus.initial));
  }

  Future<void> _verifyPhoneSmsCode(
    Emitter<AuthCodeState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        authStatus: BlocStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    emit(state.copyWith(authStatus: BlocStatus.processing));

    try {
      final phoneCredential = PhoneAuthProvider.credential(
        verificationId: state.verificationId,
        smsCode: state.inputAuthCode,
      );
      final authCredential = state.phoneAuthCredential ?? phoneCredential;

      final authenticationSuccessful = await AppService().authenticateUser(
        authProcedure: state.authProcedure,
        authMethod: AuthMethod.phone,
        authCredential: authCredential,
      );

      if (authenticationSuccessful) {
        return emit(state.copyWith(authStatus: BlocStatus.success));
      } else {
        return emit(state.copyWith(
          error: AuthenticationError.authFailure,
          authStatus: BlocStatus.error,
        ));
      }
    } on FirebaseAuthException catch (exception, _) {
      if (exception.code == 'invalid-verification-code') {
        return emit(state.copyWith(
          error: AuthenticationError.invalidAuthCode,
          authStatus: BlocStatus.error,
        ));
      } else if (exception.code == 'session-expired') {
        return emit(state.copyWith(
          error: AuthenticationError.authSessionTimeout,
          authStatus: BlocStatus.error,
        ));
      } else if (exception.code == 'account-exists-with-different-credential') {
        return emit(state.copyWith(
          error: AuthenticationError.phoneNumberTaken,
          authStatus: BlocStatus.error,
        ));
      } else if (exception.code == 'user-disabled') {
        return emit(state.copyWith(
          error: AuthenticationError.accountInvalid,
          authStatus: BlocStatus.error,
        ));
      } else {
        emit(state.copyWith(
          error: AuthenticationError.authFailure,
          authStatus: BlocStatus.error,
        ));

        return;
      }
    } catch (exception, stackTrace) {
      emit(state.copyWith(
        error: AuthenticationError.authFailure,
        authStatus: BlocStatus.error,
      ));
      await logException(exception, stackTrace);
      return;
    }
  }

  /// End

  Future<void> _onInitializeAuthCodeState(
    InitializeAuthCodeState event,
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(
      phoneNumber: event.phoneNumber,
      authProcedure: event.authProcedure,
      emailAddress: event.emailAddress,
      authMethod: event.authMethod,
      authStatus: BlocStatus.initial,
      error: AuthenticationError.none,
      codeCountDown: 5,
    ));
  }

  Future<void> _onClearAuthCodeState(
    ClearAuthCodeState event,
    Emitter<AuthCodeState> emit,
  ) async {
    emit(const AuthCodeState.initial());
  }

  Future<void> _onGuestUserEvent(
    GuestUserEvent event,
    Emitter<AuthCodeState> emit,
  ) async {
    try {
      await AppService().authenticateUser(
        authMethod: AuthMethod.none,
        authProcedure: AuthProcedure.anonymousLogin,
      );
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  Future<void> _onUpdateAuthCode(
    UpdateAuthCode event,
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(
        inputAuthCode: event.value, authStatus: BlocStatus.editing));
    return emit(state.copyWith(
        inputAuthCode: event.value, authStatus: BlocStatus.editing));
  }

  Future<void> _onVerifyAuthCode(
    VerifyAuthCode event,
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(phoneAuthCredential: event.credential));
    switch (state.authMethod) {
      case AuthMethod.phone:
        await _verifyPhoneSmsCode(emit);
        break;
      case AuthMethod.email:
        await _verifyEmailCode(emit);
        break;
      case AuthMethod.none:
        break;
    }
  }

  Future<void> _updateCountDown(
    UpdateCountDown event,
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(codeCountDown: event.countDown));
  }

  Future<void> _onResendAuthCode(
    ResendAuthCode event,
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(authStatus: BlocStatus.processing));

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        authStatus: BlocStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    switch (state.authMethod) {
      case AuthMethod.phone:
        await CustomAuth.sendPhoneAuthCode(
          phoneNumber: state.phoneNumber,
          buildContext: event.context,
          authProcedure: state.authProcedure,
        );
        break;
      case AuthMethod.email:
        await CustomAuth.sendEmailAuthCode(
          emailAddress: state.emailAddress,
          buildContext: event.context,
          authProcedure: state.authProcedure,
        );
        break;
      case AuthMethod.none:
        break;
    }
  }
}
