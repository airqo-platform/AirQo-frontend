import 'dart:async';

import 'package:app/constants/constants.dart';
import 'package:app/widgets/widgets.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'phone_auth_event.dart';
part 'phone_auth_state.dart';

class PhoneAuthBloc extends Bloc<PhoneAuthEvent, PhoneAuthState> {
  PhoneAuthBloc()
      : super(const PhoneAuthState.initial(
          authProcedure: AuthProcedure.signup,
        )) {
    on<UpdatePhoneAuthCode>(_onUpdatePhoneAuthCode);
    on<VerifyPhoneNumber>(_onVerifyPhoneNumber);
    on<UpdateCountryCode>(_onUpdateCountryCode);
    on<UpdatePhoneNumber>(_onUpdatePhoneNumber);
    on<ClearPhoneNumberEvent>(_onClearPhoneNumberEvent);
    on<PhoneAutoVerificationCompleted>(_onPhoneAutoVerificationCompleted);
    on<PhoneVerificationException>(_onPhoneVerificationException);
    on<PhoneVerificationCodeSent>(_onPhoneVerificationCodeSent);
    on<PhoneAutoVerificationTimeout>(_onPhoneAutoVerificationTimeout);
    on<VerifyPhoneAuthCode>(_onVerifyPhoneAuthCode);
    on<UpdatePhoneCountDown>(_onUpdatePhoneCountDown);
    on<InitializePhoneAuth>(_onInitializePhoneAuth);
  }

  void _onUpdatePhoneCountDown(
    UpdatePhoneCountDown event,
    Emitter<PhoneAuthState> emit,
  ) {
    emit(state.copyWith(codeCountDown: event.countDown));
  }

  Future<void> _onVerifyPhoneAuthCode(
    VerifyPhoneAuthCode event,
    Emitter<PhoneAuthState> emit,
  ) async {
    if (state.inputAuthCode.length != 6) {
      return emit(state.copyWith(
        status: PhoneBlocStatus.error,
        error: PhoneBlocError.invalidCode,
        errorMessage: "Invalid code",
      ));
    }

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        status: PhoneBlocStatus.error,
        error: PhoneBlocError.noInternetConnection,
      ));
    }

    emit(state.copyWith(
      status: PhoneBlocStatus.processing,
      error: PhoneBlocError.none,
      errorMessage: "",
    ));

    try {
      final authCredential = PhoneAuthProvider.credential(
        verificationId: state.verificationId,
        smsCode: state.inputAuthCode,
      );
      // final authCredential = state.phoneAuthCredential ?? phoneCredential;

      final signInSuccess = await CustomAuth.signIn(authCredential);

      return emit(state.copyWith(
        error: signInSuccess
            ? PhoneBlocError.none
            : PhoneBlocError.verificationFailed,
        status: signInSuccess
            ? PhoneBlocStatus.verificationSuccessful
            : PhoneBlocStatus.error,
      ));
    } on FirebaseAuthException catch (exception, _) {
      final error = CustomAuth.getFirebaseExceptionMessage(exception);

      return emit(state.copyWith(
        errorMessage: error.message,
        status: PhoneBlocStatus.error,
        error: PhoneBlocError.verificationFailed,
      ));
    } catch (exception, stackTrace) {
      emit(state.copyWith(
        status: PhoneBlocStatus.error,
        error: PhoneBlocError.verificationFailed,
      ));
      await logException(exception, stackTrace);
    }
  }

  void _onUpdatePhoneAuthCode(
    UpdatePhoneAuthCode event,
    Emitter<PhoneAuthState> emit,
  ) {
    emit(state.copyWith(
      inputAuthCode: event.value,
      errorMessage: "",
      error: PhoneBlocError.none,
      status: PhoneBlocStatus.initial,
    ));
  }

  void _onPhoneAutoVerificationTimeout(
    PhoneAutoVerificationTimeout event,
    Emitter<PhoneAuthState> emit,
  ) {
    return emit(state.copyWith(
      verificationId: event.verificationId,
      status: PhoneBlocStatus.verificationCodeSent,
    ));
  }

  void _onPhoneVerificationCodeSent(
    PhoneVerificationCodeSent event,
    Emitter<PhoneAuthState> emit,
  ) {
    return emit(state.copyWith(
      verificationId: event.verificationId,
      resendingToken: event.resendingToken,
      inputAuthCode: "",
      status: state.status == PhoneBlocStatus.autoVerifying
          ? state.status
          : PhoneBlocStatus.verificationCodeSent,
    ));
  }

  void _onPhoneVerificationException(
    PhoneVerificationException event,
    Emitter<PhoneAuthState> emit,
  ) {
    final error = CustomAuth.getFirebaseExceptionMessage(event.exception);

    return emit(state.copyWith(
      status: PhoneBlocStatus.error,
      error: PhoneBlocError.verificationFailed,
      errorMessage: error.message,
    ));
  }

  Future<void> _onPhoneAutoVerificationCompleted(
    PhoneAutoVerificationCompleted event,
    Emitter<PhoneAuthState> emit,
  ) async {
    emit(state.copyWith(
      authCredential: event.authCredential,
      status: PhoneBlocStatus.autoVerifying,
      error: PhoneBlocError.none,
    ));
    bool success = await CustomAuth.signIn(event.authCredential);
    if (success) {
      return emit(state.copyWith(
        authCredential: event.authCredential,
        status: PhoneBlocStatus.verificationSuccessful,
      ));
    }
  }

  Future<void> _onVerifyPhoneNumber(
    VerifyPhoneNumber event,
    Emitter<PhoneAuthState> emit,
  ) async {
    emit(
      state.copyWith(
        status: PhoneBlocStatus.initial,
        error: PhoneBlocError.none,
        errorMessage: "",
      ),
    );

    final phoneNumber = state.fullPhoneNumber().replaceAll(" ", "");

    if (!phoneNumber.isValidPhoneNumber()) {
      return emit(state.copyWith(
        status: PhoneBlocStatus.error,
        error: PhoneBlocError.invalidPhoneNumber,
      ));
    }

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        status: PhoneBlocStatus.error,
        error: PhoneBlocError.noInternetConnection,
        errorMessage: Config.connectionErrorMessage,
      ));
    }

    if (event.showConfirmationDialog) {
      ConfirmationAction? action = await showDialog<ConfirmationAction>(
        context: event.buildContext,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return AuthMethodDialog(
            credentials: phoneNumber,
            authMethod: AuthMethod.phone,
          );
        },
      );

      if (action == null || action != ConfirmationAction.ok) {
        return;
      }
    }

    emit(state.copyWith(status: PhoneBlocStatus.processing));

    if (state.authProcedure == AuthProcedure.signup) {
      try {
        bool isTaken = await AirqoApiClient().checkIfUserExists(
          phoneNumber: phoneNumber,
        );
        if (isTaken) {
          return emit(
            state.copyWith(
              status: PhoneBlocStatus.error,
              error: PhoneBlocError.phoneNumberTaken,
              errorMessage: "Phone number taken",
            ),
          );
        }
      } catch (exception, stackTrace) {
        emit(state.copyWith(
          status: PhoneBlocStatus.error,
          error: PhoneBlocError.verificationFailed,
          errorMessage: "Error occurred. Try again later",
        ));
        await logException(exception, stackTrace);

        return;
      }
    }

    await CustomAuth.initiatePhoneNumberVerification(
      phoneNumber,
      buildContext: event.buildContext,
      resendingToken: state.resendingToken,
    );
  }

  Future<void> _onClearPhoneNumberEvent(
    ClearPhoneNumberEvent _,
    Emitter<PhoneAuthState> emit,
  ) async {
    return emit(PhoneAuthState.initial(
      authProcedure: state.authProcedure,
      countryCode: state.countryCode,
    ));
  }

  Future<void> _onUpdateCountryCode(
    UpdateCountryCode event,
    Emitter<PhoneAuthState> emit,
  ) async {
    return emit(state.copyWith(
      countryCode: event.code,
      error: PhoneBlocError.none,
    ));
  }

  Future<void> _onInitializePhoneAuth(
    InitializePhoneAuth event,
    Emitter<PhoneAuthState> emit,
  ) async {
    return emit(PhoneAuthState.initial(
      authProcedure: event.authProcedure,
      phoneNumber: event.phoneNumber,
    ));
  }

  Future<void> _onUpdatePhoneNumber(
    UpdatePhoneNumber event,
    Emitter<PhoneAuthState> emit,
  ) async {
    return emit(state.copyWith(
      phoneNumber: event.phoneNumber,
      error: PhoneBlocError.none,
    ));
  }
}
