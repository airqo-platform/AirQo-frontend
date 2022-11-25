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
    on<UpdateHistoricalChartIndex>(_onUpdateHistoricalChartIndex);
    on<UpdateForecastChartIndex>(_onUpdateForecastChartIndex);
    on<UpdateSelectedInsight>(_onUpdateSelectedInsight);
    on<RefreshInsightsCharts>(_onRefreshInsights);
    on<SetScrolling>(_onSetScrolling);
    on<ToggleForecast>(_onToggleForecast);
  }

  Future<void> _updateForecastCharts(
    Emitter<InsightsState> emit,
  ) async {
    if (state.frequency != Frequency.hourly) {
      return;
    }

    final forecastData =
        await AirQoDatabase().getForecastInsights(state.siteId);

    if (forecastData.isEmpty) {
      return;
    }

    DateTime now = DateTime.now();

    List<ChartData> chartData = forecastData.map((event) {
      ChartData data = ChartData.fromForecastInsight(event);
      if (event.time.isBefore(now) ||
          (event.time.isToday() && event.time.hour <= now.hour)) {
        return ChartData.fromForecastInsight(event).copyWith(available: false);
      }

      return data;
    }).toList();

    final chartsData =
        await _createCharts(chartData, frequency: Frequency.hourly);

    Map<String, dynamic> data =
        _getChartIndex(insightCharts: chartsData, forecastCharts: true);

    return emit(state.copyWith(
      forecastCharts: chartsData,
      featuredForecastInsight: data["selectedInsight"] as ChartData,
      forecastChartIndex: data["index"] as int,
    ));
  }

  Map<String, dynamic> _getChartIndex({
    Map<Pollutant, List<List<charts.Series<ChartData, String>>>>? insightCharts,
    bool forecastCharts = false,
  }) {
    ChartData? selectedInsight;
    int? chartIndex;

    if (forecastCharts) {
      Pollutant pollutant = Pollutant.pm2_5;
      insightCharts = insightCharts ?? state.forecastCharts;

      for (final pollutantChart in insightCharts[pollutant]!) {
        for (final chart in pollutantChart.toList()) {
          for (final chartData in chart.data) {
            if (chartData.available) {
              chartIndex = insightCharts[pollutant]!.indexOf(pollutantChart);
              selectedInsight = chartData;
              break;
            }
          }
          if (chartIndex != null) {
            break;
          }
        }
        if (chartIndex != null) {
          break;
        }
      }

      chartIndex = chartIndex ?? state.forecastChartIndex;
      selectedInsight =
          selectedInsight ?? insightCharts[pollutant]?.first.first.data.first;
    } else {
      insightCharts = insightCharts ?? state.historicalCharts;

      final airQualityReading = state.airQualityReading;
      final DateTime comparisonTime = airQualityReading == null
          ? DateTime.now()
          : airQualityReading.dateTime;

      for (final pollutantChart in insightCharts[state.pollutant]!) {
        for (final chart in pollutantChart.toList()) {
          for (final chartData in chart.data) {
            bool matchesDate = false;

            switch (state.frequency) {
              case Frequency.daily:
                if (chartData.dateTime.day == comparisonTime.day &&
                    chartData.dateTime.month == comparisonTime.month) {
                  matchesDate = true;
                }
                break;
              case Frequency.hourly:
                if (chartData.dateTime == comparisonTime) {
                  matchesDate = true;
                }
                break;
            }

            if (matchesDate) {
              chartIndex =
                  insightCharts[state.pollutant]!.indexOf(pollutantChart);
              selectedInsight = chartData;
              break;
            }
          }
          if (chartIndex != null) {
            break;
          }
        }
        if (chartIndex != null) {
          break;
        }
      }

      chartIndex = chartIndex ?? state.historicalChartIndex;
      selectedInsight = selectedInsight ??
          insightCharts[state.pollutant]?.first.first.data.first;
    }

    return {
      "index": chartIndex,
      "selectedInsight": selectedInsight,
    };
  }

  void _onToggleForecast(
    ToggleForecast _,
    Emitter<InsightsState> emit,
  ) {
    final bool isShowingForecast = !state.isShowingForecast;
    emit(state.copyWith(
      isShowingForecast: isShowingForecast,
      pollutant: isShowingForecast ? Pollutant.pm2_5 : state.pollutant,
    ));

    return _updateHealthTips(emit);
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
    if (state.isShowingForecast) {
      emit(state.copyWith(featuredForecastInsight: event.selectedInsight));
    } else {
      emit(state.copyWith(featuredHistoricalInsight: event.selectedInsight));
    }

    if (state.frequency == Frequency.daily) {
      return _updateMiniCharts(emit);
    }

    return;
  }

  void _onUpdateHistoricalChartIndex(
    UpdateHistoricalChartIndex event,
    Emitter<InsightsState> emit,
  ) {
    emit(state.copyWith(
      historicalChartIndex: event.index,
    ));

    return _updateHealthTips(emit);
  }

  void _onUpdateForecastChartIndex(
    UpdateForecastChartIndex event,
    Emitter<InsightsState> emit,
  ) {
    emit(state.copyWith(
      forecastChartIndex: event.index,
    ));

    return _updateHealthTips(emit);
  }

  void _updateHealthTips(Emitter<InsightsState> emit) {
    if (state.frequency != Frequency.hourly) {
      return;
    }

    int chartIndex;

    Map<Pollutant, List<List<charts.Series<ChartData, String>>>> chart;

    if (state.isShowingForecast) {
      chartIndex = state.forecastChartIndex;
      chart = state.forecastCharts;
    } else {
      chartIndex = state.historicalChartIndex;
      chart = state.historicalCharts;
    }

    List<Recommendation> healthTips = [];
    String healthTipsTitle = '';

    ChartData chartData = chart[state.pollutant]![chartIndex].first.data.first;

    chartData = chart[state.pollutant]![chartIndex]
        .first
        .data
        .firstWhere((element) => element.available, orElse: () => chartData);

    if (state.frequency == Frequency.hourly &&
        chartData.available &&
        (chartData.dateTime.isToday() || chartData.dateTime.isTomorrow())) {
      healthTips = getHealthRecommendations(
        chartData.pm2_5,
        state.pollutant,
      );
      healthTipsTitle = chartData.dateTime.isToday()
          ? 'Today’s health tips'
          : 'Tomorrow’s health tips';
    }

    return emit(state.copyWith(
      healthTips: healthTips,
      healthTipsTitle: healthTipsTitle,
    ));
  }

  Future<void> _onSwitchPollutant(
    SwitchInsightsPollutant event,
    Emitter<InsightsState> emit,
  ) async {
    return emit(state.copyWith(pollutant: event.pollutant));
  }

  Future<void> _updateMiniCharts(Emitter<InsightsState> emit) async {
    final day = state.featuredHistoricalInsight?.dateTime.day;
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
            ? InsightsStatus.noInternetConnection
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

    if (insightsData.historical.isEmpty) {
      return emit(state.copyWith(
        insightsStatus: state.historicalCharts.isEmpty
            ? InsightsStatus.noData
            : state.insightsStatus,
      ));
    }

    final historicalInsights = await AirQoDatabase().getHistoricalInsights(
      siteId: state.siteId,
      frequency: state.frequency,
    );

    final historicalCharts = historicalInsights
        .map((event) => ChartData.fromHistoricalInsight(event))
        .toList();

    await _updateForecastCharts(emit);

    return _updateHistoricalCharts(emit, historicalCharts);
  }

  Future<void> _updateHistoricalCharts(
    Emitter<InsightsState> emit,
    List<ChartData> insights,
  ) async {
    final charts = await _createCharts(insights);

    if (state.featuredHistoricalInsight != null) {
      emit(state.copyWith(
        historicalCharts: charts,
        insightsStatus: InsightsStatus.loaded,
      ));

      if (state.frequency == Frequency.hourly) {
        await _updateMiniCharts(emit);
      }

      return;
    }

    Map<String, dynamic> data = _getChartIndex(insightCharts: charts);

    emit(state.copyWith(
      historicalCharts: charts,
      featuredHistoricalInsight: data["selectedInsight"] as ChartData,
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
      siteId: state.siteId,
      frequency: state.frequency,
    );

    if (dbInsights.isNotEmpty) {
      final chartData = dbInsights
          .map((event) => ChartData.fromHistoricalInsight(event))
          .toList();
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
