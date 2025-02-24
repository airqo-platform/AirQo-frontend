part of 'settings_bloc.dart';

abstract class SettingsEvent extends Equatable {
  const SettingsEvent();
}

class InitializeSettings extends SettingsEvent {
  const InitializeSettings();
  @override
  List<Object?> get props => [];
}
