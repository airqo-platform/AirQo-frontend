import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

part 'notification_event.dart';
part 'notification_state.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  NotificationBloc() : super(const NotificationState.initial()) {
    on<ClearNotifications>(_onClearNotifications);
    on<RefreshNotifications>(_onRefreshNotifications);
    on<FetchNotifications>(_onFetchNotifications);
  }

  Future<void> _onFetchNotifications(
    FetchNotifications _,
    Emitter<NotificationState> emit,
  ) async {
    List<AppNotification> notifications = await CloudStore.getNotifications();
    emit(const NotificationState.initial()
        .copyWith(notifications: notifications));
    await HiveService.loadNotifications(notifications, clear: true);
  }

  Future<void> _onRefreshNotifications(
    RefreshNotifications _,
    Emitter<NotificationState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      // return emit(state.copyWith(
      //   blocStatus: BlocStatus.error,
      //   blocError: AuthenticationError.noInternetConnection,
      // ));
    }

    final notifications =
        Hive.box<AppNotification>(HiveBox.appNotifications).values.toList();

    final cloudNotifications = await CloudStore.getNotifications();
    final notificationsIds = notifications.map((e) => e.id).toList();

    cloudNotifications.removeWhere((x) => notificationsIds.contains(x.id));

    notifications.addAll(cloudNotifications);

    emit(state.copyWith(notifications: notifications));

    await HiveService.loadNotifications(notifications);
  }

  Future<void> _onClearNotifications(
    ClearNotifications _,
    Emitter<NotificationState> emit,
  ) async {
    emit(const NotificationState.initial());
    await HiveService.loadNotifications([], clear: true);
  }
}
