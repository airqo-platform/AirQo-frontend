import 'dart:async';

import 'package:app/services/app_service.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';

import '../../models/enum_constants.dart';
import '../../services/firebase_service.dart';
import '../../utils/network.dart';

part 'phone_auth_event.dart';
part 'phone_auth_state.dart';

class PhoneAuthBloc extends Bloc<PhoneAuthEvent, PhoneAuthState> {
  PhoneAuthBloc()
      : super(
            const PhoneAuthState.initial(authProcedure: AuthProcedure.login)) {
    on<InitiatePhoneNumberVerification>(_onInitiatePhoneNumberVerification);
    on<UpdateCountryCode>(_onUpdateCountryCode);
    on<UpdatePhoneNumber>(_onUpdatePhoneNumber);
    on<InitializePhoneAuth>(_onInitializePhoneAuth);
    on<ClearPhoneNumberEvent>(_onClearPhoneNumberEvent);
    on<UpdateStatus>(_onUpdateStatus);

    on<InvalidPhoneNumber>(_onInvalidPhoneNumber);
  }

  Future<void> _onUpdateStatus(
    UpdateStatus event,
    Emitter<PhoneAuthState> emit,
  ) async {
    return emit(state.copyWith(authStatus: event.authStatus));
  }

  Future<void> _onInvalidPhoneNumber(
    InvalidPhoneNumber event,
    Emitter<PhoneAuthState> emit,
  ) async {
    return emit(state.copyWith(
        authStatus: AuthStatus.error,
        error: AuthenticationError.invalidPhoneNumber));
  }

  Future<void> _onClearPhoneNumberEvent(
    ClearPhoneNumberEvent event,
    Emitter<PhoneAuthState> emit,
  ) async {
    return emit(
        state.copyWith(phoneNumber: '', authStatus: AuthStatus.initial));
  }

  Future<void> _onUpdateCountryCode(
    UpdateCountryCode event,
    Emitter<PhoneAuthState> emit,
  ) async {
    return emit(state.copyWith(countryCode: event.code));
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
    if (event.phoneNumber.length >= 5) {
      return emit(state.copyWith(
          phoneNumber: event.phoneNumber,
          isValidPhoneNumber: true,
          authStatus: AuthStatus.editing));
    }
    return emit(state.copyWith(
        phoneNumber: event.phoneNumber,
        isValidPhoneNumber: false,
        authStatus: AuthStatus.editing));
  }

  Future<void> _onInitiatePhoneNumberVerification(
    InitiatePhoneNumberVerification event,
    Emitter<PhoneAuthState> emit,
  ) async {
    emit(state.copyWith(authStatus: AuthStatus.processing));

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        authStatus: AuthStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    final appService = AppService();

    final phoneNumber = '${state.countryCode} ${state.phoneNumber}';

    switch (state.authProcedure) {
      case AuthProcedure.login:
        await CustomAuth.sendPhoneAuthCode(phoneNumber, event.context);
        break;
      case AuthProcedure.signup:
        await appService
            .doesUserExist(
              phoneNumber: state.phoneNumber,
            )
            .then((exists) => {
                  if (exists)
                    {
                      emit(state.copyWith(
                        authStatus: AuthStatus.error,
                        error: AuthenticationError.phoneNumberTaken,
                      ))
                    }
                  else
                    {
                      CustomAuth.sendPhoneAuthCode(phoneNumber, event.context),
                    }
                });
        break;
      case AuthProcedure.anonymousLogin:
        break;
      case AuthProcedure.deleteAccount:
        break;
      case AuthProcedure.logout:
        break;
    }

    return;
  }

  // Future<void> _onValidatePhoneNumber(
  //     ValidatePhoneNumber event,
  //     Emitter<PhoneAuthState> emit,
  //     ) async {
  //   emit(state.copyWith(authStatus: AuthStatus.processing));
  //
  //   final hasConnection = await hasNetworkConnection();
  //   if(!hasConnection){
  //     return emit(state.copyWith(authStatus: AuthStatus.error, error: AuthenticationError.noInternetConnection,));
  //   }
  //
  //   final appService = AppService();
  //   switch(state.authProcedure){
  //
  //     case AuthProcedure.login:
  //       // TODO: Handle this case.
  //       break;
  //     case AuthProcedure.signup:
  //       final phoneNumberTaken = await appService.doesUserExist(
  //         phoneNumber: state.phoneNumber,
  //       );
  //       if(phoneNumberTaken){
  //         return emit(state.copyWith(authStatus: AuthStatus.error, error: AuthenticationError.phoneNumberTaken,));
  //       }
  //       break;
  //     case AuthProcedure.anonymousLogin:
  //       break;
  //     case AuthProcedure.deleteAccount:
  //       break;
  //     case AuthProcedure.logout:
  //       break;
  //   }
  //
  //
  //   //
  //   // var error = AuthenticationError.authFailure;
  //   // final authCredential = event.credential == null ? state.credential : event.credential;
  //   // try {
  //   //   final authenticationSuccessful = await appService.authenticateUser(
  //   //     authProcedure: state.authProcedure == AuthProcedure.login
  //   //         ? AuthProcedure.login
  //   //         : AuthProcedure.signup,
  //   //     authMethod: AuthMethod.phone,
  //   //     authCredential: authCredential,
  //   //   );
  //   //
  //   //   if (authenticationSuccessful) {
  //   //     return emit(const PhoneAuthState.verificationSuccessful());
  //   //   } else {
  //   //     return emit(const PhoneAuthState.error(AuthenticationError.authFailure));
  //   //   }
  //   // } on FirebaseAuthException catch (exception, stackTrace) {
  //   //   if (exception.code == 'invalid-verification-code') {
  //   //     error = AuthenticationError.invalidAuthCode;
  //   //   } else if (exception.code == 'session-expired') {
  //   //     error = AuthenticationError.authSessionTimeout;
  //   //   } else if (exception.code == 'account-exists-with-different-credential') {
  //   //     error = AuthenticationError.phoneNumberTaken;
  //   //   } else if (exception.code == 'user-disabled') {
  //   //     error = AuthenticationError.accountInvalid;
  //   //   }
  //   //
  //   //   emit(PhoneAuthState.error(error));
  //   //
  //   //   debugPrint('$exception\n$stackTrace');
  //   //   if (![
  //   //     'invalid-verification-code',
  //   //     'invalid-verification-code',
  //   //     'account-exists-with-different-credential',
  //   //   ].contains(exception.code)) {
  //   //     await logException(
  //   //       exception,
  //   //       stackTrace,
  //   //     );
  //   //   }
  //   //   return;
  //   // } catch (exception, stackTrace) {
  //   //   emit(PhoneAuthState.error(error));
  //   //   await logException(exception, stackTrace);
  //   //   return;
  //   // }
  // }

  // Future<void> verifyPhoneFn(verificationId) {
  //   setState(
  //         () {
  //       _verifyCode = true;
  //       _verificationId = verificationId;
  //     },
  //   );
  // }

  // Future<void> _verifyPhoneNumberEvent(
  //   VerifyPhoneNumber event,
  //   Emitter<PhoneAuthState> emit,
  // ) async {
  //
  //   emit(const PhoneAuthState.verifying());
  //
  //   final appService = AppService();
  //
  //   var error = AuthenticationError.authFailure;
  //   final authCredential = event.credential == null ? state.credential : event.credential;
  //   try {
  //     final authenticationSuccessful = await appService.authenticateUser(
  //       authProcedure: state.authProcedure == AuthProcedure.login
  //           ? AuthProcedure.login
  //           : AuthProcedure.signup,
  //       authMethod: AuthMethod.phone,
  //       authCredential: authCredential,
  //     );
  //
  //     if (authenticationSuccessful) {
  //       return emit(const PhoneAuthState.verificationSuccessful());
  //     } else {
  //       return emit(const PhoneAuthState.error(AuthenticationError.authFailure));
  //     }
  //   } on FirebaseAuthException catch (exception, stackTrace) {
  //     if (exception.code == 'invalid-verification-code') {
  //       error = AuthenticationError.invalidAuthCode;
  //     } else if (exception.code == 'session-expired') {
  //       error = AuthenticationError.authSessionTimeout;
  //     } else if (exception.code == 'account-exists-with-different-credential') {
  //       error = AuthenticationError.phoneNumberTaken;
  //     } else if (exception.code == 'user-disabled') {
  //       error = AuthenticationError.accountInvalid;
  //     }
  //
  //     emit(PhoneAuthState.error(error));
  //
  //     debugPrint('$exception\n$stackTrace');
  //     if (![
  //       'invalid-verification-code',
  //       'invalid-verification-code',
  //       'account-exists-with-different-credential',
  //     ].contains(exception.code)) {
  //       await logException(
  //         exception,
  //         stackTrace,
  //       );
  //     }
  //     return;
  //   } catch (exception, stackTrace) {
  //     emit(PhoneAuthState.error(error));
  //     await logException(exception, stackTrace);
  //     return;
  //   }
  // }

  // Future<void> _requestVerification(
  //     VerifyPhoneNumberEvent event,
  //     Emitter<PhoneAuthState> emit,
  //     ) async {
  //
  //
  //   final authState = state as PhoneAuthState;
  //   final phoneNumber = '${authState.countryCode} ${authState.phoneNumber}';
  //   final appService = AppService();
  //
  //   if (authState.authProcedure == AuthProcedure.signup) {
  //     final phoneNumberTaken = await appService.doesUserExist(
  //       phoneNumber: phoneNumber,
  //     );
  //
  //     if (phoneNumberTaken) {
  //       final errorState = authState as PhoneAuthErrorState;
  //       return emit(errorState.copyWith(
  //         error: AuthenticationError.phoneNumberTaken,
  //       ));
  //     }
  //   }
  //
  //   final success = await CustomAuth.requestPhoneAuthCode(
  //     phoneNumber,
  //     event.context,
  //   );
  // }
  //
  // Future<void> _resendVerificationCode() async {
  //   final connected = await checkNetworkConnection(
  //     context,
  //     notifyUser: true,
  //   );
  //   if (!connected) {
  //     return;
  //   }
  //
  //   loadingScreen(_loadingContext);
  //
  //   final success = await CustomAuth.requestPhoneAuthCode(
  //     '$_countryCode$_phoneNumber',
  //     context,
  //     verifyPhoneFn,
  //     autoVerifyPhoneFn,
  //   );
  //
  //   Navigator.pop(_loadingContext);
  //
  //   if (success) {
  //     setState(
  //       () {
  //         _codeSent = true;
  //       },
  //     );
  //   } else {
  //     setState(
  //       () {
  //         _codeSent = false;
  //       },
  //     );
  //   }
  //
  //   _startCodeSentCountDown();
  // }
  //
  // Future<void> _verifySentCode() async {
  //   final code = _phoneVerificationCode.join('');
  //
  //   if (code.length != 6) {
  //     await showSnackBar(
  //       context,
  //       'Enter all the 6 digits',
  //     );
  //
  //     return;
  //   }
  //
  //   FocusScope.of(context).requestFocus(
  //     FocusNode(),
  //   );
  //   setState(
  //     () {
  //       _nextBtnColor = CustomColors.appColorDisabled;
  //       _showAuthOptions = true;
  //     },
  //   );
  //
  //   loadingScreen(_loadingContext);
  //
  //   final phoneCredential = PhoneAuthProvider.credential(
  //     verificationId: _verificationId,
  //     smsCode: _phoneVerificationCode.join(''),
  //   );
  //
  //   await _authenticatePhoneNumber(phoneCredential);
  // }
  //
  // void autoVerifyPhoneFn(PhoneAuthCredential credential) {
  //   _authenticatePhoneNumber(credential);
  // }
}
