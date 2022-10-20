import 'dart:async';

import 'package:app/utils/extensions.dart';
import 'package:bloc/bloc.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:equatable/equatable.dart';

import '../../models/air_quality_reading.dart';
import '../../models/enum_constants.dart';
import '../../models/insights.dart';
import '../../services/app_service.dart';
import '../../services/local_storage.dart';
import '../../utils/data_formatter.dart';

part 'hourly_insights_event.dart';
part 'hourly_insights_state.dart';

class HourlyInsightsBloc
    extends Bloc<HourlyInsightsEvent, HourlyInsightsState> {
  HourlyInsightsBloc()
      : super(const HourlyInsightsState(
          siteId: '',
          insights: {},
          airQualityReading: null,
          chartIndex: 0,
          pollutant: Pollutant.pm2_5,
          selectedInsight: null,
        )) {
    on<LoadHourlyInsights>(_onLoadHourlyInsights);
    on<ClearHourlyInsightsTab>(_onClearInsights);
    on<SwitchHourlyInsightsPollutant>(_onSwitchPollutant);
    on<UpdateHourlyInsightsActiveIndex>(_onUpdateActiveIndex);
    on<UpdateHourlyInsightsSelectedInsight>(_onUpdateSelectedInsight);
  }

  Future<void> _loadingInsights(
    Emitter<HourlyInsightsState> emit,
  ) async {
    emit(HourlyInsightsLoading(
      siteId: state.siteId,
      insights: state.insights,
      airQualityReading: state.airQualityReading,
      chartIndex: state.chartIndex,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));
  }

  Future<void> _onUpdateSelectedInsight(
    UpdateHourlyInsightsSelectedInsight event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    await _loadingInsights(emit);

    return emit(HourlyInsightsState(
      siteId: state.siteId,
      insights: state.insights,
      airQualityReading: state.airQualityReading,
      chartIndex: state.chartIndex,
      pollutant: state.pollutant,
      selectedInsight: event.selectedInsight,
    ));
  }

  Future<void> _onUpdateActiveIndex(
    UpdateHourlyInsightsActiveIndex event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    await _loadingInsights(emit);

    return emit(HourlyInsightsState(
      siteId: state.siteId,
      insights: state.insights,
      airQualityReading: state.airQualityReading,
      chartIndex: event.index,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));
  }

  Future<void> _onSwitchPollutant(
    SwitchHourlyInsightsPollutant event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    await _loadingInsights(emit);

    return emit(HourlyInsightsState(
      siteId: state.siteId,
      insights: state.insights,
      airQualityReading: state.airQualityReading,
      chartIndex: state.chartIndex,
      pollutant: event.pollutant,
      selectedInsight: state.selectedInsight,
    ));
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

  Future<void> _onLoadHourlyInsights(
    LoadHourlyInsights event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    await _loadingInsights(emit);

    emit(HourlyInsightsState(
      siteId: event.siteId ?? state.siteId,
      insights: state.insights,
      airQualityReading: event.airQualityReading ?? state.airQualityReading,
      chartIndex: 0,
      pollutant: Pollutant.pm2_5,
      selectedInsight: state.selectedInsight,
    ));

    final dbInsights =
        await DBHelper().getInsights(state.siteId, Frequency.hourly);

    if (dbInsights.isNotEmpty) {
      await _loadingInsights(emit);

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

      emit(HourlyInsightsState(
        insights: charts,
        siteId: state.siteId,
        airQualityReading: state.airQualityReading,
        pollutant: state.pollutant,
        selectedInsight: selectedInsight,
        chartIndex: chartIndex,
      ));
    }

    final apiInsights = await AppService().fetchInsights(
      [state.siteId],
      frequency: Frequency.hourly,
    );
    if (apiInsights.isNotEmpty) {
      await _loadingInsights(emit);

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

      emit(HourlyInsightsState(
        insights: charts,
        siteId: state.siteId,
        airQualityReading: state.airQualityReading,
        pollutant: state.pollutant,
        selectedInsight: selectedInsight,
        chartIndex: chartIndex,
      ));
    }
  }

  Future<void> _onClearInsights(
    ClearHourlyInsightsTab event,
    Emitter<HourlyInsightsState> emit,
  ) async {
    return emit(const HourlyInsightsState(
      siteId: '',
      insights: {},
      airQualityReading: null,
      chartIndex: 0,
      pollutant: Pollutant.pm2_5,
      selectedInsight: null,
    ));
  }
}
