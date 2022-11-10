import 'dart:async';

import 'package:app/blocs/account/account_bloc.dart';
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
  void _onUpdateEmailCredentials(
    UpdateEmailCredentials event,
    Emitter<AuthCodeState> emit,
  ) {
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
        blocStatus: BlocStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    emit(state.copyWith(blocStatus: BlocStatus.processing));

    if (state.inputAuthCode != state.validAuthCode) {
      return emit(state.copyWith(
        error: AuthenticationError.invalidAuthCode,
        blocStatus: BlocStatus.error,
      ));
    }

    try {
      final emailCredential = EmailAuthProvider.credentialWithLink(
        emailLink: state.validEmailLink,
        email: state.emailAddress,
      );

      final authenticationSuccessful = await AppService().authenticateUser(
        authProcedure: state.authProcedure,
        authCredential: emailCredential,
      );

      return emit(state.copyWith(
        error: authenticationSuccessful
            ? state.error
            : AuthenticationError.authFailure,
        blocStatus:
            authenticationSuccessful ? BlocStatus.success : BlocStatus.error,
      ));
    } on FirebaseAuthException catch (exception, stackTrace) {
      final authenticationError =
          CustomAuth.getFirebaseErrorCodeMessage(exception.code);
      emit(state.copyWith(
        error: authenticationError,
        blocStatus: BlocStatus.error,
      ));

      if (authenticationError == AuthenticationError.authFailure) {
        await logException(
          exception,
          stackTrace,
        );
      }
    } catch (exception, stackTrace) {
      emit(state.copyWith(
        error: AuthenticationError.authFailure,
        blocStatus: BlocStatus.error,
      ));
      await logException(exception, stackTrace);
    }
  }

  /// Phone number verification
  void _onUpdateVerificationId(
    UpdateVerificationId event,
    Emitter<AuthCodeState> emit,
  ) {
    return emit(state.copyWith(
      verificationId: event.verificationId,
      blocStatus: BlocStatus.initial,
    ));
  }

  Future<void> _verifyPhoneSmsCode(
    Emitter<AuthCodeState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    emit(state.copyWith(blocStatus: BlocStatus.processing));

    try {
      final phoneCredential = PhoneAuthProvider.credential(
        verificationId: state.verificationId,
        smsCode: state.inputAuthCode,
      );
      final authCredential = state.phoneAuthCredential ?? phoneCredential;

      final authenticationSuccessful = await AppService().authenticateUser(
        authProcedure: state.authProcedure,
        authCredential: authCredential,
      );

      return emit(state.copyWith(
        error: authenticationSuccessful
            ? state.error
            : AuthenticationError.authFailure,
        blocStatus:
            authenticationSuccessful ? BlocStatus.success : BlocStatus.error,
      ));
    } on FirebaseAuthException catch (exception, _) {
      final error = CustomAuth.getFirebaseErrorCodeMessage(exception.code);

      return emit(state.copyWith(
        error: error,
        blocStatus: BlocStatus.error,
      ));
    } catch (exception, stackTrace) {
      emit(state.copyWith(
        error: AuthenticationError.authFailure,
        blocStatus: BlocStatus.error,
      ));
      await logException(exception, stackTrace);
    }
  }

  /// End

  void _onInitializeAuthCodeState(
    InitializeAuthCodeState event,
    Emitter<AuthCodeState> emit,
  ) {
    emit(state.copyWith(
      phoneNumber: event.phoneNumber,
      authProcedure: event.authProcedure,
      emailAddress: event.emailAddress,
      authMethod: event.authMethod,
      blocStatus: BlocStatus.initial,
      error: AuthenticationError.none,
      codeCountDown: 5,
    ));
  }

  void _onClearAuthCodeState(
    ClearAuthCodeState _,
    Emitter<AuthCodeState> emit,
  ) {
    emit(const AuthCodeState.initial());
  }

  Future<void> _onGuestUserEvent(
    GuestUserEvent event,
    Emitter<AuthCodeState> emit,
  ) async {
    try {
      await AppService().authenticateUser(
        authProcedure: AuthProcedure.anonymousLogin,
      );
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    } finally {
      event.context.read<AccountBloc>().add(const FetchAccountInfo());
      emit(const AuthCodeState.initial());
    }
  }

  void _onUpdateAuthCode(
    UpdateAuthCode event,
    Emitter<AuthCodeState> emit,
  ) {
    emit(state.copyWith(
      inputAuthCode: event.value,
      blocStatus: BlocStatus.editing,
    ));

    return emit(state.copyWith(
      inputAuthCode: event.value,
      blocStatus: BlocStatus.editing,
    ));
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
    emit(state.copyWith(blocStatus: BlocStatus.processing));

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    try {
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
    } on FirebaseAuthException catch (exception, _) {
      final error = CustomAuth.getFirebaseErrorCodeMessage(exception.code);

      return emit(state.copyWith(
        error: error,
        blocStatus: BlocStatus.error,
      ));
    } catch (exception, stackTrace) {
      emit(state.copyWith(
        error: AuthenticationError.authFailure,
        blocStatus: BlocStatus.error,
      ));
      await logException(exception, stackTrace);
    }
  }
}
