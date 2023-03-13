import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';

part 'settings_event.dart';
part 'settings_state.dart';

class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  SettingsBloc() : super(const SettingsState()) {
    on<InitializeSettings>(_onInitializeSettings);
    on<DeleteAccount>(_onDeleteAccount);
    on<UpdateLocationPref>(_onUpdateLocationPref);
    on<UpdateNotificationPref>(_onUpdateNotificationPref);
  }

  Future<void> _onInitializeSettings(
    InitializeSettings _,
    Emitter<SettingsState> emit,
  ) async {
    final locationStatus = await Permission.location.status;
    switch (locationStatus) {
      case PermissionStatus.permanentlyDenied:
      case PermissionStatus.denied:
        emit(state.copyWith(location: false));
        break;
      case PermissionStatus.restricted:
      case PermissionStatus.limited:
      case PermissionStatus.granted:
        emit(state.copyWith(location: true));
        break;
    }

    final notificationStatus = await Permission.notification.status;
    switch (notificationStatus) {
      case PermissionStatus.permanentlyDenied:
      case PermissionStatus.denied:
        emit(state.copyWith(notifications: false));
        break;
      case PermissionStatus.restricted:
      case PermissionStatus.limited:
      case PermissionStatus.granted:
        emit(state.copyWith(notifications: true));
        break;
    }
  }

  Future<void> _onUpdateLocationPref(
    UpdateLocationPref event,
    Emitter<SettingsState> emit,
  ) async {
    emit(state.copyWith(location: event.enable));
    if (event.enable) {
      await CloudAnalytics.logEvent(Event.allowLocation);
    }
  }

  Future<void> _onUpdateNotificationPref(
    UpdateNotificationPref event,
    Emitter<SettingsState> emit,
  ) async {
    emit(state.copyWith(notifications: event.enable));
    if (event.enable) {
      await CloudAnalytics.logEvent(Event.allowNotification);
    }
  }

  Future<void> _onDeleteAccount(
    DeleteAccount _,
    Emitter<SettingsState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        status: SettingsStatus.error,
        errorMessage: 'No Internet connection',
      ));
    }

    emit(state.copyWith(status: SettingsStatus.processing, errorMessage: ''));

    try {
      final success = await CustomAuth.deleteAccount();
      if (success) {
        emit(state.copyWith(status: SettingsStatus.accountDeletionSuccessful));
      }
    } on FirebaseAuthException catch (exception, stackTrace) {
      AuthenticationError error = CustomAuth.getFirebaseExceptionMessage(
        exception,
      );
      if (error == AuthenticationError.logInRequired) {
        return emit(state.copyWith(status: SettingsStatus.loginRequired));
      } else {
        logException(exception, stackTrace);
      }
    } catch (exception, stackTrace) {
      logException(exception, stackTrace);
    }

    return emit(state.copyWith(
      status: SettingsStatus.error,
      errorMessage: 'Could not logout. Try again later',
    ));
  }
}
