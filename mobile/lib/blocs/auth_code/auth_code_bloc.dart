import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../models/enum_constants.dart';
import '../../services/app_service.dart';
import '../../services/firebase_service.dart';
import '../../utils/exception.dart';
import '../../utils/network.dart';

part 'auth_code_event.dart';
part 'auth_code_state.dart';

class AuthCodeBloc extends Bloc<AuthCodeEvent, AuthCodeState> {
  AuthCodeBloc() : super(const AuthCodeState.initial()) {
    on<UpdateAuthCode>(_onUpdateAuthCode);
    on<VerifySmsCode>(_onVerifySmsCode);
    on<ResendAuthCode>(_onResendAuthCode);
    on<InitializeAuthCodeState>(_onInitializeAuthCodeState);
    on<GuestUserEvent>(_onGuestUserEvent);
    on<UpdateCountDown>(_updateCountDown);
    on<UpdateVerificationId>(_onUpdateVerificationId);
  }

  /// Phone number verification
  Future<void> _onUpdateVerificationId(
    UpdateVerificationId event,
    Emitter<AuthCodeState> emit,
  ) async {
    return emit(state.copyWith(
        verificationId: event.verificationId, authStatus: AuthStatus.initial));
  }

  Future<void> _verifyPhoneSmsCode(
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(authStatus: AuthStatus.processing));

    final appService = AppService();
    final phoneCredential = PhoneAuthProvider.credential(
      verificationId: state.verificationId,
      smsCode: state.inputAuthCode,
    );

    final authCredential = state.credential ?? phoneCredential;
    try {
      final authenticationSuccessful = await appService.authenticateUser(
        authProcedure: state.authProcedure,
        authMethod: AuthMethod.phone,
        authCredential: authCredential,
      );

      if (authenticationSuccessful) {
        return emit(state.copyWith(authStatus: AuthStatus.success));
      } else {
        return emit(state.copyWith(
          error: AuthenticationError.authFailure,
          authStatus: AuthStatus.error,
        ));
      }
    } on FirebaseAuthException catch (exception, stackTrace) {
      if (exception.code == 'invalid-verification-code') {
        return emit(state.copyWith(
          error: AuthenticationError.invalidAuthCode,
          authStatus: AuthStatus.error,
        ));
      } else if (exception.code == 'session-expired') {
        return emit(state.copyWith(
          error: AuthenticationError.authSessionTimeout,
          authStatus: AuthStatus.error,
        ));
      } else if (exception.code == 'account-exists-with-different-credential') {
        return emit(state.copyWith(
          error: AuthenticationError.phoneNumberTaken,
          authStatus: AuthStatus.error,
        ));
      } else if (exception.code == 'user-disabled') {
        return emit(state.copyWith(
          error: AuthenticationError.accountInvalid,
          authStatus: AuthStatus.error,
        ));
      } else {
        emit(state.copyWith(
          error: AuthenticationError.authFailure,
          authStatus: AuthStatus.error,
        ));

        await logException(
          exception,
          stackTrace,
        );
        return;
      }
    } catch (exception, stackTrace) {
      emit(state.copyWith(
        error: AuthenticationError.authFailure,
        authStatus: AuthStatus.error,
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
    emit(const AuthCodeState.initial().copyWith(
      phoneNumber: event.phoneNumber,
      authProcedure: event.authProcedure,
    ));
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
    return emit(state.copyWith(
        inputAuthCode: event.value, authStatus: AuthStatus.editing));
  }

  Future<void> _onVerifySmsCode(
    VerifySmsCode event,
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(credential: event.credential));
    switch (state.authMethod) {
      case AuthMethod.phone:
        await _verifyPhoneSmsCode(emit);
        break;
      case AuthMethod.email:
        // TODO: Handle this case.
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
    emit(state.copyWith(authStatus: AuthStatus.processing));

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        authStatus: AuthStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    switch (state.authMethod) {
      case AuthMethod.phone:
        CustomAuth.sendPhoneAuthCode(state.phoneNumber, event.context);
        break;
      case AuthMethod.email:
        // TODO: Handle this case.
        break;
      case AuthMethod.none:
        break;
    }
  }
}
