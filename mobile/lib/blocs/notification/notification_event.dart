part of 'notification_bloc.dart';

abstract class NotificationEvent extends Equatable {
  const NotificationEvent();
}

class ClearNotifications extends NotificationEvent {
  const ClearNotifications();
  @override
  List<Object?> get props => [];
}

class FetchNotifications extends NotificationEvent {
  const FetchNotifications();
  @override
  List<Object?> get props => [];
}

class RefreshNotifications extends NotificationEvent {
  const RefreshNotifications();
  @override
  List<Object?> get props => [];
}
