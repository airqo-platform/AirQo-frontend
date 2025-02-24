part of 'notification_bloc.dart';

abstract class NotificationEvent extends Equatable {
  const NotificationEvent();
}

class ClearNotifications extends NotificationEvent {
  const ClearNotifications();
  @override
  List<Object?> get props => [];
}

class SyncNotifications extends NotificationEvent {
  const SyncNotifications();
  @override
  List<Object?> get props => [];
}
