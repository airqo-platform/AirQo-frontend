import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';

part 'settings_event.dart';
part 'settings_state.dart';

class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  SettingsBloc() : super(const SettingsState.initial()) {
    on<InitializeSettings>(_onInitializeSettings);
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
      await CloudAnalytics.logEvent(CloudAnalyticsEvent.allowLocation);
    }
    Profile profile = await Profile.getProfile();
    await profile.update(enableLocation: event.enable);
  }

  Future<void> _onUpdateNotificationPref(
    UpdateNotificationPref event,
    Emitter<SettingsState> emit,
  ) async {
    emit(state.copyWith(notifications: event.enable));
    if (event.enable) {
      await CloudAnalytics.logEvent(CloudAnalyticsEvent.allowNotification);
    }
    Profile profile = await Profile.getProfile();
    await profile.update(enableNotification: event.enable);
  }
}
