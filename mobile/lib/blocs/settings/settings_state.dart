part of 'settings_bloc.dart';

enum SettingsStatus {
  initial,
  processing,
  accountDeletionSuccessful,
  loginRequired,
  error;
}

class SettingsState extends Equatable {
  const SettingsState({
    this.notifications = false,
    this.location = false,
    this.status = SettingsStatus.initial,
    this.errorMessage = '',
  });

  SettingsState copyWith({
    bool? notifications,
    bool? location,
    SettingsStatus? status,
    String? errorMessage,
  }) {
    return SettingsState(
      notifications: notifications ?? this.notifications,
      location: location ?? this.location,
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  final bool notifications;
  final bool location;
  final SettingsStatus status;
  final String errorMessage;

  @override
  List<Object?> get props => [
        notifications,
        location,
        status,
        errorMessage,
      ];
}
