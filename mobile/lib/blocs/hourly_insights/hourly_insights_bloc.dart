import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/utils/extensions.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../constants/config.dart';
import '../../services/app_service.dart';
import '../../services/local_storage.dart';
import '../../utils/data_formatter.dart';
import '../../utils/network.dart';
import '../commons.dart';

part 'hourly_insights_state.dart';

class HourlyInsightsBloc extends Bloc<InsightsEvent, HourlyInsightsState> {
  HourlyInsightsBloc() : super(const HourlyInsightsState.initial()) {
    on<LoadInsights>(_onLoadHourlyInsights);
    on<ClearInsightsTab>(_onClearInsights);
    on<SwitchInsightsPollutant>(_onSwitchPollutant);
    on<UpdateInsightsActiveIndex>(_onUpdateActiveIndex);
    on<UpdateSelectedInsight>(_onUpdateSelectedInsight);
    on<RefreshInsights>(_onRefreshInsights);
  }

  Future<void> _onRefreshInsights(
    RefreshInsights event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    return _refreshCharts(emit);
  }

  Future<void> _onUpdateSelectedInsight(
    UpdateSelectedInsight event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    return emit(state.copyWith(selectedInsight: event.selectedInsight));
  }

  Future<void> _onUpdateActiveIndex(
    UpdateInsightsActiveIndex event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    return emit(state.copyWith(chartIndex: event.index));
  }

  Future<void> _onSwitchPollutant(
    SwitchInsightsPollutant event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    return emit(state.copyWith(pollutant: event.pollutant));
  }

  Future<Map<Pollutant, List<List<charts.Series<Insights, String>>>>>
      _createInsightsCharts(
    List<Insights> insightsData,
  ) async {
    final firstDay =
        DateTime.now().getDateOfFirstDayOfWeek().getDateOfFirstHourOfDay();
    final lastDay =
        DateTime.now().getDateOfLastDayOfWeek().getDateOfLastHourOfDay();

    final hourlyInsights = insightsData.where(
      (element) {
        final date = element.time;
        if (date == firstDay ||
            date == lastDay ||
            (date.isAfter(firstDay) & date.isBefore(lastDay))) {
          return true;
        }

        return false;
      },
    ).toList();
    final pm2_5ChartData = insightsChartData(
      hourlyInsights,
      Pollutant.pm2_5,
      Frequency.hourly,
    );
    final pm10ChartData =
        insightsChartData(hourlyInsights, Pollutant.pm10, Frequency.hourly);

    return {Pollutant.pm2_5: pm2_5ChartData, Pollutant.pm10: pm10ChartData};
  }

  Future<void> _refreshCharts(
    Emitter<HourlyInsightsState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        errorMessage: Config.connectionErrorMessage,
        insightsStatus: state.insights.isEmpty
            ? InsightsStatus.failed
            : InsightsStatus.error,
      ));
    }

    final apiInsights = await AppService().fetchInsights(
      [state.siteId],
      frequency: Frequency.hourly,
    );

    if (apiInsights.isEmpty) {
      return emit(state.copyWith(
        insightsStatus: state.insights.isEmpty
            ? InsightsStatus.failed
            : state.insightsStatus,
      ));
    }

    emit(state.copyWith(insightsStatus: InsightsStatus.refreshing));

    final charts = await _createInsightsCharts(apiInsights);
    var selectedInsight = charts[state.pollutant]?.first.first.data.first;
    var chartIndex = state.chartIndex;

    for (final chart in charts[state.pollutant]!) {
      for (final chart_2 in chart.toList()) {
        for (final chart_3 in chart_2.data) {
          if (chart_3.time.isToday()) {
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

    return emit(state.copyWith(
      insights: charts,
      selectedInsight: selectedInsight,
      chartIndex: chartIndex,
      insightsStatus: InsightsStatus.loaded,
    ));
  }

  Future<void> _onLoadHourlyInsights(
    LoadInsights event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    emit(const HourlyInsightsState.initial().copyWith(
      airQualityReading: event.airQualityReading ?? state.airQualityReading,
      siteId: event.siteId ?? state.siteId,
      insightsStatus: InsightsStatus.loading,
    ));

    final dbInsights =
        await DBHelper().getInsights(state.siteId, Frequency.hourly);

    if (dbInsights.isEmpty) {
      return _refreshCharts(emit);
    }

    final charts = await _createInsightsCharts(dbInsights);
    var selectedInsight = charts[Pollutant.pm2_5]?.first.first.data.first;
    var chartIndex = state.chartIndex;

    for (final chart in charts[Pollutant.pm2_5]!) {
      for (final chart_2 in chart.toList()) {
        for (final chart_3 in chart_2.data) {
          if (chart_3.time.isToday()) {
            chartIndex = charts[Pollutant.pm2_5]!.indexOf(chart);
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
      insights: charts,
      selectedInsight: selectedInsight,
      chartIndex: chartIndex,
      insightsStatus: InsightsStatus.loaded,
    ));

    return _refreshCharts(emit);
  }

  Future<void> _onClearInsights(
    ClearInsightsTab event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    return emit(const HourlyInsightsState.initial());
  }
}
