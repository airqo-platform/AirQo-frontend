import 'dart:async';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive/hive.dart';
import 'package:shared_preferences/shared_preferences.dart';

part 'dashboard_event.dart';
part 'dashboard_state.dart';

class DashboardBloc extends Bloc<DashboardEvent, DashboardState> {
  DashboardBloc()
      : super(const DashboardState(
          greetings: '',
          airQualityReadings: [],
          loading: false,
        )) {
    on<UpdateGreetings>(_onUpdateGreetings);
    on<InitializeDashboard>(_onInitializeDashboard);
  }

  Future<void> _onUpdateGreetings(
    UpdateGreetings _,
    Emitter<DashboardState> emit,
  ) async {
    emit(DashboardLoading(
      greetings: state.greetings,
      airQualityReadings: state.airQualityReadings,
      loading: true,
    ));
    final greetings = await DateTime.now().getGreetings();

    return emit(state.copyWith(greetings: greetings));
  }

  Future<List<AirQualityReading>> _getAirQualityReadings() async {
    final airQualityCards = <AirQualityReading>[];

    final regionAirQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList()
          ..shuffle();

    for (final regionAirQualityReading in regionAirQualityReadings.take(8)) {
      airQualityCards.add(
        AirQualityReading.duplicate(regionAirQualityReading),
      );
    }

    return airQualityCards;
  }

  Future<void> _onInitializeDashboard(
    InitializeDashboard _,
    Emitter<DashboardState> emit,
  ) async {
    emit(DashboardLoading(
      greetings: state.greetings,
      airQualityReadings: state.airQualityReadings,
      loading: true,
    ));

    final greetings = await DateTime.now().getGreetings();
    final airQualityReadings = await _getAirQualityReadings();

    return emit(DashboardState(
      greetings: greetings,
      airQualityReadings: airQualityReadings,
      loading: false,
    ));
  }
}
