part of 'settings_bloc.dart';

class SettingsState extends Equatable {
  const SettingsState._({
    this.notifications = false,
    this.location = false,
  });

  const SettingsState({
    this.notifications = false,
    this.location = false,
  });

  const SettingsState.initial() : this._();

  SettingsState copyWith({
    bool? notifications,
    bool? location,
  }) {
    return SettingsState(
      notifications: notifications ?? this.notifications,
      location: location ?? this.location,
    );
  }

  final bool notifications;
  final bool location;

  @override
  List<Object?> get props => [
        notifications,
        location,
      ];
}
