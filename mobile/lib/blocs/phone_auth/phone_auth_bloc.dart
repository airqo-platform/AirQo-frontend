import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'phone_auth_event.dart';
part 'phone_auth_state.dart';

class PhoneAuthBloc extends Bloc<PhoneAuthEvent, PhoneAuthState> {
  PhoneAuthBloc()
      : super(const PhoneAuthState.initial(
          authProcedure: AuthProcedure.signup,
        )) {
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
    return emit(state.copyWith(
      blocStatus: event.authStatus,
    ));
  }

  Future<void> _onInvalidPhoneNumber(
    InvalidPhoneNumber _,
    Emitter<PhoneAuthState> emit,
  ) async {
    return emit(state.copyWith(
      blocStatus: BlocStatus.error,
      error: AuthenticationError.invalidPhoneNumber,
    ));
  }

  Future<void> _onClearPhoneNumberEvent(
    ClearPhoneNumberEvent _,
    Emitter<PhoneAuthState> emit,
  ) async {
    return emit(state.copyWith(
      phoneNumber: '',
      blocStatus: BlocStatus.initial,
    ));
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
    return emit(state.copyWith(
      phoneNumber: event.phoneNumber,
      blocStatus: BlocStatus.editing,
    ));
  }

  Future<void> _onInitiatePhoneNumberVerification(
    InitiatePhoneNumberVerification event,
    Emitter<PhoneAuthState> emit,
  ) async {
    emit(state.copyWith(blocStatus: BlocStatus.processing));

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    final appService = AppService();

    final phoneNumber = '${state.countryCode} ${state.phoneNumber}';

    try {
      switch (state.authProcedure) {
        case AuthProcedure.login:
          await CustomAuth.sendPhoneAuthCode(
            phoneNumber: phoneNumber,
            buildContext: event.context,
            authProcedure: state.authProcedure,
          );
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
                          blocStatus: BlocStatus.error,
                          error: AuthenticationError.phoneNumberTaken,
                        )),
                      }
                    else
                      {
                        CustomAuth.sendPhoneAuthCode(
                          phoneNumber: phoneNumber,
                          buildContext: event.context,
                          authProcedure: state.authProcedure,
                        ),
                      },
                  });
          break;
        case AuthProcedure.anonymousLogin:
        case AuthProcedure.deleteAccount:
        case AuthProcedure.logout:
        case AuthProcedure.none:
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

    return;
  }
}
