import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

part 'notification_event.dart';

class NotificationBloc
    extends HydratedBloc<NotificationEvent, List<AppNotification>> {
  NotificationBloc() : super([]) {
    on<ClearNotifications>(_onClearNotifications);
    on<SyncNotifications>(_onSyncNotifications);
  }

  Future<void> _onSyncNotifications(
    SyncNotifications _,
    Emitter<List<AppNotification>> emit,
  ) async {
    List<AppNotification> notifications = await CloudStore.getNotifications();

    Set<AppNotification> notificationsSet = state.toSet();
    notificationsSet.addAll(notifications.toSet());

    emit(notificationsSet.toList());

    emit(notifications);
  }

  void _onClearNotifications(
    ClearNotifications _,
    Emitter<List<AppNotification>> emit,
  ) {
    emit([]);
  }

  @override
  List<AppNotification>? fromJson(Map<String, dynamic> json) {
    return AppNotificationList.fromJson(json).data;
  }

  @override
  Map<String, dynamic>? toJson(List<AppNotification> state) {
    return AppNotificationList(data: state).toJson();
  }
}
