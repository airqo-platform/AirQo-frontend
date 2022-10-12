import 'dart:async';

import 'package:app/models/enum_constants.dart';
import 'package:app/utils/extensions.dart';
import 'package:bloc/bloc.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:equatable/equatable.dart';

import '../../models/air_quality_reading.dart';
import '../../models/insights.dart';
import '../../services/app_service.dart';
import '../../services/local_storage.dart';
import '../../utils/data_formatter.dart';

part 'insights_event.dart';
part 'insights_state.dart';

class InsightsBloc extends Bloc<InsightsEvent, InsightsState> {
  InsightsBloc()
      : super(const InsightsState(
          siteId: '',
          dailyInsights: {},
          hourlyInsights: {},
          frequency: Frequency.hourly,
          airQualityReading: null,
          activeChartIndex: 0,
          pollutant: Pollutant.pm2_5,
          selectedInsight: null,
        )) {
    on<LoadHourlyInsights>(_onLoadHourlyInsights);
    on<LoadDailyInsights>(_onLoadDailyInsights);
    on<ClearInsightsPage>(_onClearInsights);
    on<SwitchPollutant>(_onSwitchPollutant);
    on<SwitchTab>(_onSwitchTab);
    on<InitializeInsightsPage>(_onInitializeInsightsPage);
    on<UpdateActiveIndex>(_onUpdateActiveIndex);
    on<UpdateSelectedInsight>(_onUpdateSelectedInsight);
  }

  Future<void> _onUpdateSelectedInsight(
    UpdateSelectedInsight event,
    Emitter<InsightsState> emit,
  ) async {
    emit(InsightsLoading(
      siteId: state.siteId,
      dailyInsights: state.dailyInsights,
      hourlyInsights: state.hourlyInsights,
      frequency: Frequency.hourly,
      airQualityReading: state.airQualityReading,
      activeChartIndex: state.activeChartIndex,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));

    return emit(InsightsState(
      siteId: state.siteId,
      dailyInsights: state.dailyInsights,
      hourlyInsights: state.hourlyInsights,
      frequency: state.frequency,
      airQualityReading: state.airQualityReading,
      activeChartIndex: state.activeChartIndex,
      pollutant: state.pollutant,
      selectedInsight: event.insights,
    ));
  }

  Future<void> _onUpdateActiveIndex(
    UpdateActiveIndex event,
    Emitter<InsightsState> emit,
  ) async {
    emit(InsightsLoading(
      siteId: state.siteId,
      dailyInsights: state.dailyInsights,
      hourlyInsights: state.hourlyInsights,
      frequency: Frequency.hourly,
      airQualityReading: state.airQualityReading,
      activeChartIndex: state.activeChartIndex,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));

    return emit(InsightsState(
      siteId: state.siteId,
      dailyInsights: state.dailyInsights,
      hourlyInsights: state.hourlyInsights,
      frequency: state.frequency,
      airQualityReading: state.airQualityReading,
      activeChartIndex: event.index,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));
  }

  Future<void> _onInitializeInsightsPage(
    InitializeInsightsPage event,
    Emitter<InsightsState> emit,
  ) async {
    emit(InsightsLoading(
      siteId: state.siteId,
      dailyInsights: state.dailyInsights,
      hourlyInsights: state.hourlyInsights,
      frequency: Frequency.hourly,
      airQualityReading: state.airQualityReading,
      activeChartIndex: state.activeChartIndex,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));

    return emit(InsightsState(
      siteId: event.siteId,
      dailyInsights: const {},
      hourlyInsights: const {},
      frequency: Frequency.hourly,
      airQualityReading: event.airQualityReading,
      activeChartIndex: 0,
      pollutant: Pollutant.pm2_5,
      selectedInsight: null,
    ));
  }

  Future<void> _onSwitchTab(
    SwitchTab event,
    Emitter<InsightsState> emit,
  ) async {
    emit(InsightsLoading(
      siteId: state.siteId,
      dailyInsights: state.dailyInsights,
      hourlyInsights: state.hourlyInsights,
      frequency: Frequency.hourly,
      airQualityReading: state.airQualityReading,
      activeChartIndex: state.activeChartIndex,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));

    return emit(InsightsState(
      siteId: state.siteId,
      dailyInsights: state.dailyInsights,
      hourlyInsights: state.hourlyInsights,
      frequency: event.frequency,
      airQualityReading: state.airQualityReading,
      activeChartIndex: 0,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));
  }

  Future<void> _onSwitchPollutant(
    SwitchPollutant event,
    Emitter<InsightsState> emit,
  ) async {
    emit(InsightsLoading(
      siteId: state.siteId,
      dailyInsights: state.dailyInsights,
      hourlyInsights: state.hourlyInsights,
      frequency: Frequency.hourly,
      airQualityReading: state.airQualityReading,
      activeChartIndex: state.activeChartIndex,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));

    return emit(InsightsState(
      siteId: state.siteId,
      dailyInsights: state.dailyInsights,
      hourlyInsights: state.hourlyInsights,
      frequency: Frequency.hourly,
      airQualityReading: state.airQualityReading,
      activeChartIndex: state.activeChartIndex,
      pollutant: event.pollutant,
      selectedInsight: state.selectedInsight,
    ));
  }

  Future<Map<Pollutant, List<List<charts.Series<Insights, String>>>>>
      _createInsightsCharts(
    List<Insights> insightsData,
    Frequency frequency,
  ) async {
    var pm2_5ChartData = <List<charts.Series<Insights, String>>>[];
    var pm10ChartData = <List<charts.Series<Insights, String>>>[];

    if (frequency == Frequency.daily) {
      final firstDay = DateTime.now()
          .getFirstDateOfCalendarMonth()
          .getDateOfFirstHourOfDay();
      final lastDay =
          DateTime.now().getLastDateOfCalendarMonth().getDateOfLastHourOfDay();

      final dailyInsights = insightsData.where((element) {
        final date = element.time;
        if (date == firstDay ||
            date == lastDay ||
            (date.isAfter(firstDay) & date.isBefore(lastDay))) {
          return true;
        }

        return false;
      }).toList();

      pm2_5ChartData = insightsChartData(
        dailyInsights,
        Pollutant.pm2_5,
        Frequency.daily,
      );
      pm10ChartData =
          insightsChartData(dailyInsights, Pollutant.pm10, Frequency.daily);
    } else {
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
      pm2_5ChartData = insightsChartData(
        hourlyInsights,
        Pollutant.pm2_5,
        Frequency.hourly,
      );
      pm10ChartData =
          insightsChartData(hourlyInsights, Pollutant.pm10, Frequency.hourly);
    }

    return {Pollutant.pm2_5: pm2_5ChartData, Pollutant.pm10: pm10ChartData};
  }

  Future<void> _onLoadHourlyInsights(
    LoadHourlyInsights event,
    Emitter<InsightsState> emit,
  ) async {
    emit(InsightsLoading(
      hourlyInsights: state.hourlyInsights,
      siteId: state.siteId,
      dailyInsights: state.dailyInsights,
      frequency: state.frequency,
      airQualityReading: state.airQualityReading,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
      activeChartIndex: state.activeChartIndex,
    ));

    final dbInsights =
        await DBHelper().getInsights(state.siteId, Frequency.hourly);

    if (dbInsights.isNotEmpty) {
      emit(InsightsLoading(
        hourlyInsights: state.hourlyInsights,
        siteId: state.siteId,
        dailyInsights: state.dailyInsights,
        frequency: state.frequency,
        airQualityReading: state.airQualityReading,
        pollutant: state.pollutant,
        selectedInsight: state.selectedInsight,
        activeChartIndex: state.activeChartIndex,
      ));

      final hourlyCharts =
          await _createInsightsCharts(dbInsights, Frequency.hourly);
      var selectedInsight =
          hourlyCharts[Pollutant.pm2_5]?.first.first.data.first;
      var activeChartIndex = state.activeChartIndex;

      for (final chart in hourlyCharts[Pollutant.pm2_5]!) {
        for (final chart_2 in chart.toList()) {
          for (final chart_3 in chart_2.data) {
            if (chart_3.time.isToday()) {
              activeChartIndex = hourlyCharts[Pollutant.pm2_5]!.indexOf(chart);
              selectedInsight = chart_3;
              break;
            }
          }
          if (activeChartIndex != state.activeChartIndex) {
            break;
          }
        }
        if (activeChartIndex != state.activeChartIndex) {
          break;
        }
      }

      emit(InsightsState(
        hourlyInsights: hourlyCharts,
        siteId: state.siteId,
        dailyInsights: state.dailyInsights,
        frequency: state.frequency,
        airQualityReading: state.airQualityReading,
        pollutant: state.pollutant,
        selectedInsight: selectedInsight,
        activeChartIndex: activeChartIndex,
      ));
    }

    final apiInsights = await AppService().fetchInsights(
      [state.siteId],
      frequency: Frequency.hourly,
    );
    if (apiInsights.isNotEmpty) {
      emit(InsightsLoading(
        hourlyInsights: state.hourlyInsights,
        siteId: state.siteId,
        dailyInsights: state.dailyInsights,
        frequency: state.frequency,
        airQualityReading: state.airQualityReading,
        pollutant: state.pollutant,
        selectedInsight: state.selectedInsight,
        activeChartIndex: state.activeChartIndex,
      ));

      final hourlyCharts =
          await _createInsightsCharts(apiInsights, Frequency.hourly);
      var selectedInsight =
          hourlyCharts[Pollutant.pm2_5]?.first.first.data.first;
      var activeChartIndex = state.activeChartIndex;

      for (final chart in hourlyCharts[Pollutant.pm2_5]!) {
        for (final chart_2 in chart.toList()) {
          for (final chart_3 in chart_2.data) {
            if (chart_3.time.isToday()) {
              activeChartIndex = hourlyCharts[Pollutant.pm2_5]!.indexOf(chart);
              selectedInsight = chart_3;
              break;
            }
          }
          if (activeChartIndex != state.activeChartIndex) {
            break;
          }
        }
        if (activeChartIndex != state.activeChartIndex) {
          break;
        }
      }

      return emit(InsightsState(
        hourlyInsights: hourlyCharts,
        siteId: state.siteId,
        dailyInsights: state.dailyInsights,
        frequency: state.frequency,
        airQualityReading: state.airQualityReading,
        pollutant: state.pollutant,
        selectedInsight: selectedInsight,
        activeChartIndex: activeChartIndex,
      ));
    }
  }

  Future<void> _onLoadDailyInsights(
    LoadDailyInsights event,
    Emitter<InsightsState> emit,
  ) async {}

  Future<void> _onClearInsights(
    ClearInsightsPage event,
    Emitter<InsightsState> emit,
  ) async {
    return emit(const InsightsState(
      siteId: '',
      dailyInsights: {},
      hourlyInsights: {},
      frequency: Frequency.hourly,
      airQualityReading: null,
      activeChartIndex: 0,
      pollutant: Pollutant.pm2_5,
      selectedInsight: null,
    ));
  }
}
