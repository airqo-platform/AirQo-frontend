import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../constants/config.dart';

part 'insights_event.dart';
part 'insights_state.dart';

class InsightsBloc extends Bloc<InsightsEvent, InsightsState> {
  InsightsBloc()
      : super(const InsightsState.initial(frequency: Frequency.hourly)) {
    on<LoadInsights>(_onLoadInsights);
    on<ClearInsightsTab>(_onClearInsights);
    on<SwitchInsightsPollutant>(_onSwitchPollutant);
    on<UpdateInsightsActiveIndex>(_onUpdateActiveIndex);
    on<UpdateForecastInsightsActiveIndex>(_onUpdateForecastInsightsActiveIndex);
    on<UpdateSelectedInsight>(_onUpdateSelectedInsight);
    on<RefreshInsightsCharts>(_onRefreshInsights);
    on<SetScrolling>(_onSetScrolling);
    on<ToggleForecastData>(_onShowForecastData);
  }

  Future<void> _onLoadForecastData(
    Emitter<InsightsState> emit,
  ) async {
    emit(state.copyWith(insightsStatus: InsightsStatus.refreshing));

    final forecastData =
        await AirQoDatabase().getForecastInsights(state.siteId);

    final chartData = forecastData
        .map((event) => ChartData.fromForecastInsight(event))
        .toList();

    final forecastCharts = await _createCharts(chartData);

    return emit(state.copyWith(forecastCharts: forecastCharts));
  }

  Future<void> _onShowForecastData(
    ToggleForecastData _,
    Emitter<InsightsState> emit,
  ) async {
    if (!state.showForecastData) {
      return emit(state.copyWith(showForecastData: !state.showForecastData));
    }

    var selectedInsight =
        state.forecastCharts[state.pollutant]?.first.first.data.first;
    var chartIndex = state.forecastChartIndex;

    for (final chart in state.forecastCharts[state.pollutant]!) {
      for (final chart_2 in chart.toList()) {
        for (final chart_3 in chart_2.data) {
          if (chart_3.dateTime.isToday()) {
            chartIndex = state.forecastCharts[state.pollutant]!.indexOf(chart);
            selectedInsight = chart_3;
            break;
          }
        }
        if (chartIndex != state.chartIndex) {
          break;
        }
      }
      if (chartIndex != state.chartIndex) {
        break;
      }
    }

    return emit(state.copyWith(
        selectedInsight: selectedInsight,
        forecastChartIndex: chartIndex,
        insightsStatus: InsightsStatus.loaded,
        showForecastData: !state.showForecastData));
  }

  Future<void> _onSetScrolling(
    SetScrolling event,
    Emitter<InsightsState> emit,
  ) async {
    return emit(state.copyWith(scrollingGraphs: event.scrolling));
  }

  Future<void> _onRefreshInsights(
    RefreshInsightsCharts _,
    Emitter<InsightsState> emit,
  ) {
    return _refreshCharts(emit);
  }

  Future<void> _onUpdateSelectedInsight(
    UpdateSelectedInsight event,
    Emitter<InsightsState> emit,
  ) async {
    emit(state.copyWith(selectedInsight: event.selectedInsight));

    if (state.frequency == Frequency.daily && !state.showForecastData) {
      return _updateMiniCharts(emit);
    }

    return;
  }

  Future<void> _onUpdateActiveIndex(
    UpdateInsightsActiveIndex event,
    Emitter<InsightsState> emit,
  ) async {
    return emit(state.copyWith(
      chartIndex: event.index,
    ));
  }

  Future<void> _onUpdateForecastInsightsActiveIndex(
    UpdateForecastInsightsActiveIndex event,
    Emitter<InsightsState> emit,
  ) async {
    return emit(state.copyWith(
      forecastChartIndex: event.index,
    ));
  }

  Future<void> _onSwitchPollutant(
    SwitchInsightsPollutant event,
    Emitter<InsightsState> emit,
  ) async {
    return emit(state.copyWith(pollutant: event.pollutant));
  }

  Future<void> _updateMiniCharts(Emitter<InsightsState> emit) async {
    final day = state.selectedInsight?.dateTime.day;
    if (day == null) {
      return;
    }

    final historicalData =
        await AirQoDatabase().getDailyMiniHourlyInsights(state.siteId, day);

    final chartData = historicalData
        .map((event) => ChartData.fromHistoricalInsight(event))
        .toList();

    if (chartData.isEmpty) {
      return;
    }

    final pm2_5ChartData = miniInsightsChartData(
      chartData,
      Pollutant.pm2_5,
    );
    final pm10ChartData = miniInsightsChartData(
      chartData,
      Pollutant.pm10,
    );

    if (pm2_5ChartData.isEmpty || pm10ChartData.isEmpty) {
      return;
    }

    return emit(state.copyWith(
      miniInsightsCharts: {
        Pollutant.pm2_5: pm2_5ChartData,
        Pollutant.pm10: pm10ChartData,
      },
    ));
  }

  Future<Map<Pollutant, List<List<charts.Series<ChartData, String>>>>>
      _createCharts(List<ChartData> insightsData) async {
    final firstDay = state.frequency == Frequency.hourly
        ? DateTime.now().getDateOfFirstDayOfWeek().getDateOfFirstHourOfDay()
        : DateTime.now()
            .getFirstDateOfCalendarMonth()
            .getDateOfFirstHourOfDay();
    final lastDay = state.frequency == Frequency.hourly
        ? DateTime.now().getDateOfLastDayOfWeek().getDateOfLastHourOfDay()
        : DateTime.now().getLastDateOfCalendarMonth().getDateOfLastHourOfDay();

    final insights = insightsData
        .where((e) =>
            e.dateTime.isAfterEqualTo(firstDay) &&
            e.dateTime.isBeforeOrEqualTo(lastDay))
        .toList();

    final pm2_5ChartData = createChartsList(
      insights,
      Pollutant.pm2_5,
      state.frequency,
    );

    final pm10ChartData = createChartsList(
      insights,
      Pollutant.pm10,
      state.frequency,
    );

    return {Pollutant.pm2_5: pm2_5ChartData, Pollutant.pm10: pm10ChartData};
  }

  Future<void> _refreshCharts(
    Emitter<InsightsState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        errorMessage: Config.connectionErrorMessage,
        insightsStatus: state.insightsCharts.isEmpty
            ? InsightsStatus.failed
            : InsightsStatus.error,
      ));
    }

    emit(state.copyWith(
      insightsStatus: state.insightsCharts.isEmpty
          ? InsightsStatus.loading
          : InsightsStatus.refreshing,
    ));

    final insightsData = await AppService().fetchInsightsData(
      state.siteId,
      frequency: state.frequency,
    );

    final chartData = insightsData.historical
        .map((event) => ChartData.fromHistoricalInsight(event))
        .toList();

    if (chartData.isEmpty) {
      return emit(state.copyWith(
        insightsStatus: state.insightsCharts.isEmpty
            ? InsightsStatus.failed
            : state.insightsStatus,
      ));
    }

    await _onLoadForecastData(emit);
    return _updateCharts(emit, chartData);
  }

  Future<void> _updateCharts(
    Emitter<InsightsState> emit,
    List<ChartData> insights,
  ) async {
    final charts = await _createCharts(insights);

    if (state.selectedInsight != null) {
      emit(state.copyWith(
        insightsCharts: charts,
        insightsStatus: InsightsStatus.loaded,
      ));

      if (state.frequency == Frequency.hourly) {
        await _updateMiniCharts(emit);
      }

      return;
    }

    var selectedInsight = charts[state.pollutant]?.first.first.data.first;
    var chartIndex = state.chartIndex;

    for (final chart in charts[state.pollutant]!) {
      for (final chart_2 in chart.toList()) {
        for (final chart_3 in chart_2.data) {
          if (chart_3.dateTime.isToday()) {
            chartIndex = charts[state.pollutant]!.indexOf(chart);
            selectedInsight = chart_3;
            break;
          }
        }
        if (chartIndex != state.chartIndex) {
          break;
        }
      }
      if (chartIndex != state.chartIndex) {
        break;
      }
    }

    emit(state.copyWith(
      insightsCharts: charts,
      selectedInsight: selectedInsight,
      chartIndex: chartIndex,
      insightsStatus: InsightsStatus.loaded,
    ));

    if (state.frequency == Frequency.daily) {
      await _updateMiniCharts(emit);
    }

    return;
  }

  Future<void> _onLoadInsights(
    LoadInsights event,
    Emitter<InsightsState> emit,
  ) async {
    final siteId = event.siteId ?? state.siteId;
    emit(InsightsState.initial(frequency: event.frequency).copyWith(
      airQualityReading: event.airQualityReading ?? state.airQualityReading,
      siteId: siteId,
      insightsStatus: InsightsStatus.loading,
    ));

    final dbInsights = await AirQoDatabase().getHistoricalInsights(
      state.siteId,
      state.frequency,
    );

    final chartData = dbInsights
        .map((event) => ChartData.fromHistoricalInsight(event))
        .toList();

    if (dbInsights.isNotEmpty) {
      await _updateCharts(emit, chartData);
      await _onLoadForecastData(emit);
    }

    return _refreshCharts(emit);
  }

  Future<void> _onClearInsights(
    ClearInsightsTab _,
    Emitter<InsightsState> emit,
  ) async {
    return emit(InsightsState.initial(frequency: state.frequency));
  }
}

class HourlyInsightsBloc extends InsightsBloc {}

class DailyInsightsBloc extends InsightsBloc {}
