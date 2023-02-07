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
  }

  Future<void> _onClearAnalytics(
    ClearAnalytics _,
    Emitter<AnalyticsState> emit,
  ) async {
    emit(const AnalyticsState.initial());
    await HiveService.deleteAnalytics();
  }

  Future<void> _onRefreshAnalytics(
    RefreshAnalytics _,
    Emitter<AnalyticsState> emit,
  ) async {
    List<Analytics> analytics = HiveService.getAnalytics();
    emit(const AnalyticsState().copyWith(analytics: analytics));

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        status: AnalyticsStatus.noInternetConnection,
      ));
    }

    await AppService().refreshAirQualityReadings();
  }
}
