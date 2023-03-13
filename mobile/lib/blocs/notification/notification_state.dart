part of 'notification_bloc.dart';

enum NotificationError {
  noInternetConnection,
  none;
}

enum NotificationStatus {
  error,
  initial;
}

class NotificationState extends Equatable {
  const NotificationState._({
    this.notifications = const [],
    this.status = NotificationStatus.initial,
    this.error = NotificationError.none,
  });

  const NotificationState({
    this.notifications = const [],
    this.status = NotificationStatus.initial,
    this.error = NotificationError.none,
  });

  const NotificationState.initial() : this._();

  NotificationState copyWith({
    List<AppNotification>? notifications,
    NotificationStatus? status,
    NotificationError? error,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      status: status ?? this.status,
      error: error ?? this.error,
    );
  }

  final List<AppNotification> notifications;

  final NotificationStatus status;
  final NotificationError error;

  @override
  List<Object?> get props => [
        notifications,
        status,
        error,
      ];
}
