import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';
part 'dashboard_event.dart';
part 'dashboard_state.dart';

class DashboardBloc extends Bloc<DashboardEvent, DashboardState> {
  DashboardBloc() : super(const DashboardState.initial()) {
    on<InitializeDashboard>(_onInitializeDashboard);
    on<RefreshDashboard>(_onRefreshDashboard);
  }

  Future<void> _onUpdateGreetings(Emitter<DashboardState> emit) async {
    final greetings = await DateTime.now().getGreetings();
    emit(state.copyWith(greetings: greetings));
  }

  void _getAirQualityReadings(Emitter<DashboardState> emit) {
    List<AirQualityReading> airQualityCards = <AirQualityReading>[];

    List<AirQualityReading> nearbyAirQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
            .values
            .toList();
    nearbyAirQualityReadings.sort((x, y) {
      return x.distanceToReferenceSite.compareTo(y.distanceToReferenceSite);
    });

    if (nearbyAirQualityReadings.isNotEmpty) {
      nearbyAirQualityReadings.removeAt(0);
    }

    airQualityCards.addAll(nearbyAirQualityReadings.take(2).toList());

    List<AirQualityReading> airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();
    airQualityReadings.shuffle();

    final List<String> countries =
        airQualityReadings.map((e) => e.country).toSet().toList();

    for (final country in countries) {
      List<AirQualityReading> countryReadings = airQualityReadings
          .where((element) => element.country.equalsIgnoreCase(country))
          .toList();
      countryReadings.removeWhere((element) => airQualityCards
          .map((e) => e.placeId)
          .toList()
          .contains(element.placeId));
      airQualityCards.addAll(countryReadings.take(2));
    }

    airQualityCards.shuffle();

    return emit(state.copyWith(
      airQualityReadings: airQualityCards,
      blocStatus: airQualityCards.isEmpty
          ? DashboardStatus.error
          : DashboardStatus.loaded,
      error: airQualityCards.isEmpty
          ? DashboardError.noAirQuality
          : DashboardError.none,
    ));
  }

  Future<void> _onRefreshDashboard(
    RefreshDashboard _,
    Emitter<DashboardState> emit,
  ) async {
    // TODO check internet connection
    // TODO return error if air quality is empty

    emit(state.copyWith(blocStatus: DashboardStatus.processing));
    await AppService().refreshAirQualityReadings();
    await AppService().updateFavouritePlacesReferenceSites();
    await _onUpdateGreetings(emit);
    _getAirQualityReadings(emit);
  }

  Future<void> _onInitializeDashboard(
    InitializeDashboard _,
    Emitter<DashboardState> emit,
  ) async {
    emit(state.copyWith(blocStatus: DashboardStatus.processing));
    await _onUpdateGreetings(emit);
    _getAirQualityReadings(emit);
  }
}
