import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';

part 'settings_event.dart';
part 'settings_state.dart';

class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  SettingsBloc() : super(const SettingsState.initial()) {
    on<InitializeSettings>(_onInitializeSettings);
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
}
