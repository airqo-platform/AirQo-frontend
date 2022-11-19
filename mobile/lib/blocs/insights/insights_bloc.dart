import 'dart:async';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'insights_event.dart';
part 'insights_state.dart';

class InsightsBloc extends Bloc<InsightsEvent, InsightsState> {
  InsightsBloc()
      : super(const InsightsState.initial(frequency: Frequency.hourly)) {
    on<LoadInsights>(_onLoadInsights);
    on<DeleteOldInsights>(_onDeleteOldInsights);
    on<ClearInsightsTab>(_onClearInsights);
    on<SwitchInsightsPollutant>(_onSwitchPollutant);
    on<UpdateInsightsActiveIndex>(_onUpdateActiveIndex);
    on<UpdateForecastInsightsActiveIndex>(_onUpdateForecastInsightsActiveIndex);
    on<UpdateSelectedInsight>(_onUpdateSelectedInsight);
    on<RefreshInsightsCharts>(_onRefreshInsights);
    on<SetScrolling>(_onSetScrolling);
    on<ToggleForecastData>(_onToggleForecast);
  }

  Future<void> _updateForecastCharts(
    Emitter<InsightsState> emit,
  ) async {
    emit(state.copyWith(insightsStatus: InsightsStatus.refreshing));

    final forecastData =
        await AirQoDatabase().getForecastInsights(state.siteId);

    final chartData = forecastData
        .map((event) => ChartData.fromForecastInsight(event))
        .toList();

    final forecastCharts =
        await _createCharts(chartData, frequency: Frequency.hourly);

    return emit(state.copyWith(forecastCharts: forecastCharts));
  }

  Map<String, dynamic> _onGetChartIndex({
    Map<Pollutant, List<List<charts.Series<ChartData, String>>>>? insightCharts,
  }) {
    ChartData? selectedInsight;
    int chartIndex;
    int referenceChartIndex;
    final airQualityReading = state.airQualityReading;
    final DateTime comparisonTime =
        airQualityReading == null ? DateTime.now() : airQualityReading.dateTime;

    if (state.frequency == Frequency.daily ||
        (state.frequency == Frequency.hourly && state.isShowingForecast)) {
      selectedInsight =
          state.historicalCharts[state.pollutant]?.first.first.data.first;
      chartIndex = state.historicalChartIndex;
      referenceChartIndex = state.historicalChartIndex;
      insightCharts = insightCharts ?? state.historicalCharts;
    } else {
      selectedInsight =
          state.forecastCharts[state.pollutant]?.first.first.data.first;
      chartIndex = state.forecastChartIndex;
      referenceChartIndex = state.forecastChartIndex;
      insightCharts = insightCharts ?? state.forecastCharts;
    }

    for (final chart in insightCharts[state.pollutant]!) {
      for (final chart_2 in chart.toList()) {
        for (final chart_3 in chart_2.data) {
          if (state.frequency == Frequency.hourly) {
            if (chart_3.dateTime.isToday() &&
                chart_3.dateTime.hour == comparisonTime.hour) {
              chartIndex = insightCharts[state.pollutant]!.indexOf(chart);
              selectedInsight = chart_3;
              break;
            }
          } else if (state.frequency == Frequency.daily &&
              chart_3.dateTime.day == comparisonTime.day) {
            if (chart_3.dateTime.isToday()) {
              chartIndex = insightCharts[state.pollutant]!.indexOf(chart);
              selectedInsight = chart_3;
              break;
            }
          }
        }
        if (chartIndex != referenceChartIndex) {
          break;
        }
      }
      if (chartIndex != referenceChartIndex) {
        break;
      }
    }

    return {
      "index": chartIndex,
      "selectedInsight": selectedInsight,
    };
  }

  void _onToggleForecast(
    ToggleForecastData _,
    Emitter<InsightsState> emit,
  ) {
    if (state.forecastCharts.isEmpty) {
      return;
    }

    Map<String, dynamic> data = _onGetChartIndex();

    return emit(state.copyWith(
      selectedInsight: data["selectedInsight"] as ChartData,
      forecastChartIndex: state.isShowingForecast
          ? state.forecastChartIndex
          : data["index"] as int,
      historicalChartIndex: state.isShowingForecast
          ? data["index"] as int
          : state.historicalChartIndex,
      insightsStatus: InsightsStatus.loaded,
      isShowingForecast: !state.isShowingForecast,
    ));
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

    if (state.frequency == Frequency.daily && !state.isShowingForecast) {
      return _updateMiniCharts(emit);
    }

    return;
  }

  Future<void> _onUpdateActiveIndex(
    UpdateInsightsActiveIndex event,
    Emitter<InsightsState> emit,
  ) async {
    return emit(state.copyWith(
      historicalChartIndex: event.index,
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
      _createCharts(
    List<ChartData> insightsData, {
    Frequency? frequency,
  }) async {
    final pm2_5ChartData = createChartsList(
      insights: insightsData,
      pollutant: Pollutant.pm2_5,
      frequency: frequency ?? state.frequency,
    );

    final pm10ChartData = createChartsList(
      insights: insightsData,
      pollutant: Pollutant.pm10,
      frequency: frequency ?? state.frequency,
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
        insightsStatus: state.historicalCharts.isEmpty
            ? InsightsStatus.failed
            : InsightsStatus.error,
      ));
    }

    emit(state.copyWith(
      insightsStatus: state.historicalCharts.isEmpty
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
        insightsStatus: state.historicalCharts.isEmpty
            ? InsightsStatus.noData
            : state.insightsStatus,
      ));
    }

    await _updateForecastCharts(emit);

    return _updateHistoricalCharts(emit, chartData);
  }

  Future<void> _updateHistoricalCharts(
    Emitter<InsightsState> emit,
    List<ChartData> insights,
  ) async {
    final charts = await _createCharts(insights);

    if (state.selectedInsight != null) {
      emit(state.copyWith(
        historicalCharts: charts,
        insightsStatus: InsightsStatus.loaded,
      ));

      if (state.frequency == Frequency.hourly) {
        await _updateMiniCharts(emit);
      }

      return;
    }

    Map<String, dynamic> data = _onGetChartIndex(insightCharts: charts);

    emit(state.copyWith(
      historicalCharts: charts,
      selectedInsight: data["selectedInsight"] as ChartData,
      historicalChartIndex: data["index"] as int,
      insightsStatus: InsightsStatus.loaded,
    ));

    if (state.frequency == Frequency.daily) {
      await _updateMiniCharts(emit);
    }

    return;
  }

  void _onDeleteOldInsights(
    DeleteOldInsights _,
    Emitter<InsightsState> emit,
  ) {
    emit(state);
    AirQoDatabase().deleteOldInsights();
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
      await _updateHistoricalCharts(emit, chartData);
      await _updateForecastCharts(emit);
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
