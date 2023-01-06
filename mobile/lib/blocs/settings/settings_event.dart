part of 'settings_bloc.dart';

abstract class SettingsEvent extends Equatable {
  const SettingsEvent();
}

class InitializeSettings extends SettingsEvent {
  const InitializeSettings();
  @override
  List<Object?> get props => [];
}

class UpdateNotificationPref extends SettingsEvent {
  const UpdateNotificationPref(this.enable);
  final bool enable;

  @override
  List<Object?> get props => [enable];
}

class UpdateLocationPref extends SettingsEvent {
  const UpdateLocationPref(this.enable);
  final bool enable;

  @override
  List<Object?> get props => [enable];
}
