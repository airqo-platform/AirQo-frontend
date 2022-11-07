import 'dart:async';

import 'package:app/blocs/auth_code/auth_code_bloc.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'settings_event.dart';
part 'settings_state.dart';

class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  SettingsBloc() : super(SettingsState.initial()) {
    on<DeleteAccount>(_onDeleteAccount);
    on<AccountPreDeletionFailed>(_onAccountPreDeletionFailed);
    on<AccountPreDeletionPassed>(_onAccountPreDeletionPassed);
  }

  Future<void> _onAccountPreDeletionFailed(
    AccountPreDeletionFailed event,
    Emitter<SettingsState> emit,
  ) async {
    return emit(state.copyWith(
      blocStatus: BlocStatus.error,
      error: event.authenticationError,
    ));
  }

  Future<void> _onAccountPreDeletionPassed(
    AccountPreDeletionPassed _,
    Emitter<SettingsState> emit,
  ) async {
    return emit(state.copyWith(
      blocStatus: BlocStatus.accountPreDeletionSuccess,
      error: AuthenticationError.none,
    ));
  }

  Future<void> _onDeleteAccount(
    DeleteAccount event,
    Emitter<SettingsState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        error: AuthenticationError.noInternetConnection,
      ));
    }

    final action = await showDialog<ConfirmationAction>(
      context: event.context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const AuthProcedureDialog(
          authProcedure: AuthProcedure.deleteAccount,
        );
      },
    );

    if (action == null || action == ConfirmationAction.cancel) {
      return;
    }

    emit(state.copyWith(
      blocStatus: BlocStatus.processing,
    ));

    final profile = await Profile.getProfile();
    final authMethod =
        profile.emailAddress == '' ? AuthMethod.phone : AuthMethod.email;

    event.context.read<AuthCodeBloc>().add(InitializeAuthCodeState(
          phoneNumber: profile.phoneNumber,
          emailAddress: profile.emailAddress,
          authProcedure: AuthProcedure.deleteAccount,
          authMethod: authMethod,
        ));

    try {
      switch (authMethod) {
        case AuthMethod.phone:
          CustomAuth.sendPhoneAuthCode(
            phoneNumber: profile.phoneNumber,
            buildContext: event.context,
            authProcedure: AuthProcedure.deleteAccount,
          );
          break;
        case AuthMethod.email:
          CustomAuth.sendEmailAuthCode(
            emailAddress: profile.emailAddress,
            buildContext: event.context,
            authProcedure: AuthProcedure.deleteAccount,
          );
          break;
        case AuthMethod.none:
          return emit(state.copyWith(
            blocStatus: BlocStatus.error,
            error: AuthenticationError.authFailure,
          ));
      }
    } on FirebaseAuthException catch (exception, stackTrace) {
      final authenticationError =
          CustomAuth.getErrorFromFirebaseCode(exception.code);
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
      await logException(
        exception,
        stackTrace,
      );
    }
  }
}
