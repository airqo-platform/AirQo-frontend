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
    // on<UpdateVerificationId>(_onUpdateVerificationId);
    on<UpdateEmailAuthModel>(_onUpdateEmailAuthModel);
  }

  /// Email  verification
  void _onUpdateEmailAuthModel(
    UpdateEmailAuthModel event,
    Emitter<AuthCodeState> emit,
  ) {
    return emit(
        const AuthCodeState().copyWith(emailAuthModel: event.authModel));
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
          emailLink = emailAuthModel.loginLink;
          break;
        case AuthProcedure.signup:
          emailLink = emailAuthModel.signUpLink;
          break;
        case AuthProcedure.anonymousLogin:
        case AuthProcedure.deleteAccount:
        case AuthProcedure.none:
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
    } on FirebaseAuthException catch (exception, stackTrace) {
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

  /// Phone number verification
  // void _onUpdateVerificationId(
  //   UpdateVerificationId event,
  //   Emitter<AuthCodeState> emit,
  // ) {
  //   return emit(state.copyWith(
  //     verificationId: event.verificationId,
  //     status: BlocStatus.initial,
  //   ));
  // }
  //
  // Future<void> _verifyPhoneSmsCode(
  //   Emitter<AuthCodeState> emit,
  // ) async {
  //   final hasConnection = await hasNetworkConnection();
  //   if (!hasConnection) {
  //     return emit(state.copyWith(
  //       status: BlocStatus.error,
  //       error: FirebaseAuthError.noInternetConnection,
  //     ));
  //   }
  //
  //   emit(state.copyWith(status: BlocStatus.processing));
  //
  //   try {
  //     final phoneCredential = PhoneAuthProvider.credential(
  //       verificationId: state.verificationId,
  //       smsCode: state.inputAuthCode,
  //     );
  //     final authCredential = state.phoneAuthCredential ?? phoneCredential;
  //
  //     final authenticationSuccessful = await AppService().authenticateUser(
  //       authProcedure: state.authProcedure,
  //       authCredential: authCredential,
  //     );
  //
  //     return emit(state.copyWith(
  //       error: authenticationSuccessful
  //           ? state.error
  //           : FirebaseAuthError.authFailure,
  //       status:
  //           authenticationSuccessful ? BlocStatus.success : BlocStatus.error,
  //     ));
  //   } on FirebaseAuthException catch (exception, _) {
  //     final error = CustomAuth.getFirebaseErrorCodeMessage(exception.code);
  //
  //     return emit(state.copyWith(
  //       error: error,
  //       status: BlocStatus.error,
  //     ));
  //   } catch (exception, stackTrace) {
  //     emit(state.copyWith(
  //       error: FirebaseAuthError.authFailure,
  //       status: BlocStatus.error,
  //     ));
  //     await logException(exception, stackTrace);
  //   }
  // }

  /// End

  void _onInitializeAuthCodeState(
    InitializeAuthCodeState event,
    Emitter<AuthCodeState> emit,
  ) {
    emit(AuthCodeState(
      authProcedure: event.authProcedure,
      authMethod: event.authMethod,
      emailAuthModel: event.emailAuthModel,
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
        // await _verifyPhoneSmsCode(emit);
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
          // await CustomAuth.sendPhoneAuthCode(
          //   phoneNumber: state.phoneNumber,
          //   buildContext: event.context,
          //   authProcedure: state.authProcedure,
          // );
          break;
        case AuthMethod.email:
          EmailAuthModel? emailAuthModel = state.emailAuthModel;
          if (emailAuthModel == null) {
            return emit(state.copyWith(
              status: AuthCodeStatus.error,
              errorMessage: 'Failed to validate code. Try again later',
              loading: false,
            ));
          }

          await apiClient
              .requestEmailVerificationCode(emailAuthModel.emailAddress, false)
              .then((emailAuthModel) {
            if (emailAuthModel == null) {
              return emit(state.copyWith(
                status: AuthCodeStatus.error,
                errorMessage:
                    "Failed to send verification code. Try again later",
                loading: false,
              ));
            }

            return emit(const AuthCodeState().copyWith(
              emailAuthModel: emailAuthModel,
            ));
          });
          break;
        case AuthMethod.none:
          break;
      }
    } on FirebaseAuthException catch (exception, _) {
      final error = CustomAuth.getFirebaseErrorCodeMessage(exception.code);

      // TODO handle this
      // return emit(state.copyWith(
      //   error: error,
      //   status: BlocStatus.error,
      // ));
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return emit(state.copyWith(
      status: AuthCodeStatus.error,
      errorMessage: "Failed to send verification code. Try again later",
      loading: false,
    ));
  }
}
