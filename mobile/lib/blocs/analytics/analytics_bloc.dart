import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'analytics_event.dart';
part 'analytics_state.dart';

class AnalyticsBloc extends Bloc<AnalyticsEvent, AnalyticsState> {
  AnalyticsBloc() : super(const AnalyticsState.initial()) {
    on<RefreshAnalytics>(_onRefreshAnalytics);
    on<ClearAnalytics>(_onClearAnalytics);
    on<FetchAnalytics>(_fetchAnalytics);
  }

  Future<void> _fetchAnalytics(
    FetchAnalytics _,
    Emitter<AnalyticsState> emit,
  ) async {
    final analytics = await CloudStore.getCloudAnalytics();
    emit(const AnalyticsState.initial().copyWith(analytics: analytics));
    await HiveService.loadAnalytics(analytics);
  }

  Future<void> _onClearAnalytics(
    ClearAnalytics _,
    Emitter<AnalyticsState> emit,
  ) async {
    // TODO await CloudStore.updateCloudAnalytics()
    emit(const AnalyticsState.initial());
    await HiveService.loadAnalytics([], clear: true);
  }

  Future<void> _onRefreshAnalytics(
    RefreshAnalytics _,
    Emitter<AnalyticsState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        error: AnalyticsError.noInternetConnection,
        status: AnalyticsStatus.error,
      ));
    }

    await AppService().refreshAirQualityReadings();
    // TODO: update cloud Analytics
  }
}
