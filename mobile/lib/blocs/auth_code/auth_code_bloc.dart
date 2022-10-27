import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../models/enum_constants.dart';
import '../../services/app_service.dart';
import '../../services/firebase_service.dart';
import '../../utils/exception.dart';

part 'auth_code_event.dart';
part 'auth_code_state.dart';

class AuthCodeBloc extends Bloc<AuthCodeEvent, AuthCodeState> {
  AuthCodeBloc() : super(const AuthCodeState.initial()) {
    on<UpdateAuthCode>(_onUpdateAuthCode);
    on<AuthenticatePhoneNumber>(_onVerifyAuthCode);
    on<ResendAuthCode>(_onResendAuthCode);
    on<InitializeAuthCodeState>(_onInitializeAuthCodeState);
    on<GuestUserEvent>(_onGuestUserEvent);
  }

  Future<void> _onInitializeAuthCodeState(
    InitializeAuthCodeState event,
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(
      authStatus: AuthStatus.initial,
      phoneNumber: event.phoneNumber,
      verificationId: event.verificationId,
      credential: event.credential,
      authProcedure: event.authProcedure,
    ));
    await _updateCountDown(emit);
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

  Future<void> _verifyPhoneNumberCode(
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(authStatus: AuthStatus.processing));

    final appService = AppService();

    var error = AuthenticationError.authFailure;
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
        error = AuthenticationError.invalidAuthCode;
      } else if (exception.code == 'session-expired') {
        error = AuthenticationError.authSessionTimeout;
      } else if (exception.code == 'account-exists-with-different-credential') {
        error = AuthenticationError.phoneNumberTaken;
      } else if (exception.code == 'user-disabled') {
        error = AuthenticationError.accountInvalid;
      }

      emit(state.copyWith(
        error: error,
        authStatus: AuthStatus.error,
      ));

      debugPrint('$exception\n$stackTrace');
      if (![
        'invalid-verification-code',
        'invalid-verification-code',
        'account-exists-with-different-credential',
      ].contains(exception.code)) {
        await logException(
          exception,
          stackTrace,
        );
      }
      return;
    } catch (exception, stackTrace) {
      emit(state.copyWith(
        error: error,
        authStatus: AuthStatus.error,
      ));
      await logException(exception, stackTrace);
      return;
    }
  }

  Future<void> _onVerifyAuthCode(
    AuthenticatePhoneNumber event,
    Emitter<AuthCodeState> emit,
  ) async {
    switch (state.authMethod) {
      case AuthMethod.phone:
        await _verifyPhoneNumberCode(emit);
        break;
      case AuthMethod.email:
        // TODO: Handle this case.
        break;
      case AuthMethod.none:
        break;
    }
  }

  Future<void> _updateCountDown(
    Emitter<AuthCodeState> emit,
  ) async {
    emit(state.copyWith(codeCountDown: 5));

  }

  Future<void> _onResendAuthCode(
    ResendAuthCode event,
    Emitter<AuthCodeState> emit,
  ) async {
    var success = false;
    switch (state.authMethod) {
      case AuthMethod.phone:
        success = await CustomAuth.reSendPhoneAuthCode(
          phoneNumber: state.phoneNumber,
        );
        break;
      case AuthMethod.email:
        // TODO: Handle this case.
        break;
      case AuthMethod.none:
        break;
    }

    if (success) {
      emit(const AuthCodeState.initial());
      await _updateCountDown(emit);
    }
  }
}
