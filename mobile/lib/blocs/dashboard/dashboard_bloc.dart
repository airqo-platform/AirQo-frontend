import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/utils/extensions.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:hive/hive.dart';

import '../../services/hive_service.dart';

part 'dashboard_event.dart';
part 'dashboard_state.dart';

class DashboardBloc extends Bloc<DashboardEvent, DashboardState> {
  DashboardBloc()
      : super(const DashboardState(
          greetings: '',
          incompleteKya: [],
          airQualityReadings: [],
          loading: false,
        )) {
    on<UpdateGreetings>(_onUpdateGreetings);
    on<InitializeDashboard>(_onInitializeDashboard);
  }

  Future<void> _onUpdateGreetings(
    UpdateGreetings event,
    Emitter<DashboardState> emit,
  ) async {
    emit(DashboardLoading(
      greetings: state.greetings,
      incompleteKya: state.incompleteKya,
      airQualityReadings: state.airQualityReadings,
      loading: true,
    ));
    final greetings = await DateTime.now().getGreetings();

    return emit(state.copyWith(greetings: greetings));
  }

  Future<List<AirQualityReading>> _getAirQualityReadings() async {
    final airQualityCards = <AirQualityReading>[];

    final ugandaAirQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
            .values
            .where((element) => element.country.toLowerCase().contains('ug'))
            .toList()
          ..shuffle();

    final otherAirQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
            .values
            .where((element) => !element.country.toLowerCase().contains('ug'))
            .toList()
          ..shuffle();

    final airQualityReadings = ugandaAirQualityReadings.take(2).toList()
      ..addAll(otherAirQualityReadings.take(6).toList())
      ..shuffle();

    for (final regionAirQualityReading in airQualityReadings) {
      airQualityCards.add(
        AirQualityReading.duplicate(regionAirQualityReading),
      );
    }

    return airQualityCards;
  }

  Future<void> _onInitializeDashboard(
    InitializeDashboard event,
    Emitter<DashboardState> emit,
  ) async {
    emit(DashboardLoading(
      greetings: state.greetings,
      incompleteKya: state.incompleteKya,
      airQualityReadings: state.airQualityReadings,
      loading: true,
    ));

    final greetings = await DateTime.now().getGreetings();
    final incompleteKya = await Kya.getIncompleteKya();
    final airQualityReadings = await _getAirQualityReadings();

    return emit(DashboardState(
      greetings: greetings,
      incompleteKya: incompleteKya,
      airQualityReadings: airQualityReadings,
      loading: false,
    ));
  }
}
