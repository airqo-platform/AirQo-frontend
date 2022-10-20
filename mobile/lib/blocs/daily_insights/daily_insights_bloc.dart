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

part 'daily_insights_event.dart';
part 'daily_insights_state.dart';

class DailyInsightsBloc extends Bloc<DailyInsightsEvent, DailyInsightsState> {
  DailyInsightsBloc()
      : super(const DailyInsightsState(
          siteId: '',
          insights: {},
          miniInsights: {},
          airQualityReading: null,
          chartIndex: 0,
          pollutant: Pollutant.pm2_5,
          selectedInsight: null,
        )) {
    on<LoadDailyInsights>(_onLoadDailyInsights);
    on<ClearDailyInsightsTab>(_onClearInsights);
    on<SwitchDailyInsightsPollutant>(_onSwitchPollutant);
    on<UpdateDailyInsightsActiveIndex>(_onUpdateActiveIndex);
    on<UpdateDailyInsightsSelectedInsight>(_onUpdateSelectedInsight);
  }

  Future<void> _onUpdateSelectedInsight(
    UpdateDailyInsightsSelectedInsight event,
    Emitter<DailyInsightsState> emit,
  ) async {
    await _onLoadingInsights(emit);

    emit(DailyInsightsState(
      siteId: state.siteId,
      insights: state.insights,
      miniInsights: state.miniInsights,
      airQualityReading: state.airQualityReading,
      chartIndex: state.chartIndex,
      pollutant: state.pollutant,
      selectedInsight: event.selectedInsight,
    ));
    return _updateMiniInsightsCharts(emit);
  }

  Future<void> _onUpdateActiveIndex(
    UpdateDailyInsightsActiveIndex event,
    Emitter<DailyInsightsState> emit,
  ) async {
    await _onLoadingInsights(emit);
    return emit(DailyInsightsState(
      siteId: state.siteId,
      insights: state.insights,
      miniInsights: state.miniInsights,
      airQualityReading: state.airQualityReading,
      chartIndex: event.index,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));
  }

  Future<void> _onSwitchPollutant(
    SwitchDailyInsightsPollutant event,
    Emitter<DailyInsightsState> emit,
  ) async {
    await _onLoadingInsights(emit);

    return emit(DailyInsightsState(
      siteId: state.siteId,
      insights: state.insights,
      miniInsights: state.miniInsights,
      airQualityReading: state.airQualityReading,
      chartIndex: state.chartIndex,
      pollutant: event.pollutant,
      selectedInsight: state.selectedInsight,
    ));
  }

  Future<void> _updateMiniInsightsCharts(
    Emitter<DailyInsightsState> emit,
  ) async {
    final insightsData =
        await DBHelper().getInsights(state.siteId, Frequency.hourly);

    if (insightsData.isEmpty) {
      return;
    }

    final hourlyInsights = insightsData.where(
      (element) {
        return element.time.day == state.selectedInsight?.time.day;
      },
    ).toList();
    if (hourlyInsights.isEmpty) {
      return;
    }

    final pm2_5ChartData = insightsChartData(
      hourlyInsights,
      Pollutant.pm2_5,
      Frequency.hourly,
    );
    final pm10ChartData = insightsChartData(
      hourlyInsights,
      Pollutant.pm10,
      Frequency.hourly,
    );

    if (pm2_5ChartData.isEmpty || pm10ChartData.isEmpty) {
      return;
    }

    await _onLoadingInsights(emit);
    return emit(DailyInsightsState(
      siteId: state.siteId,
      insights: state.insights,
      miniInsights: {
        Pollutant.pm2_5: pm2_5ChartData.first,
        Pollutant.pm10: pm10ChartData.first
      },
      airQualityReading: state.airQualityReading,
      chartIndex: state.chartIndex,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));
  }

  Future<Map<Pollutant, List<List<charts.Series<Insights, String>>>>>
      _createInsightsCharts(
    List<Insights> insightsData,
  ) async {
    final firstDay =
        DateTime.now().getFirstDateOfCalendarMonth().getDateOfFirstHourOfDay();
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

    final pm2_5ChartData = insightsChartData(
      dailyInsights,
      Pollutant.pm2_5,
      Frequency.daily,
    );
    final pm10ChartData =
        insightsChartData(dailyInsights, Pollutant.pm10, Frequency.daily);

    return {Pollutant.pm2_5: pm2_5ChartData, Pollutant.pm10: pm10ChartData};
  }

  Future<void> _onLoadingInsights(
    Emitter<DailyInsightsState> emit,
  ) async {
    emit(DailyInsightsLoading(
      siteId: state.siteId,
      miniInsights: state.miniInsights,
      insights: state.insights,
      airQualityReading: state.airQualityReading,
      chartIndex: state.chartIndex,
      pollutant: state.pollutant,
      selectedInsight: state.selectedInsight,
    ));
  }

  Future<void> _onLoadDailyInsights(
    LoadDailyInsights event,
    Emitter<DailyInsightsState> emit,
  ) async {
    await _onLoadingInsights(emit);
    emit(DailyInsightsState(
      siteId: event.siteId ?? state.siteId,
      insights: state.insights,
      miniInsights: state.miniInsights,
      airQualityReading: event.airQualityReading ?? state.airQualityReading,
      chartIndex: 0,
      pollutant: Pollutant.pm2_5,
      selectedInsight: state.selectedInsight,
    ));

    final dbInsights =
        await DBHelper().getInsights(state.siteId, Frequency.daily);

    if (dbInsights.isNotEmpty) {
      await _onLoadingInsights(emit);

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

      emit(DailyInsightsState(
        insights: charts,
        siteId: state.siteId,
        miniInsights: state.miniInsights,
        airQualityReading: state.airQualityReading,
        pollutant: state.pollutant,
        selectedInsight: selectedInsight,
        chartIndex: chartIndex,
      ));
    }

    final apiInsights = await AppService().fetchInsights(
      [state.siteId],
      frequency: Frequency.daily,
    );
    if (apiInsights.isNotEmpty) {
      await _onLoadingInsights(emit);

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

      emit(DailyInsightsState(
        insights: charts,
        siteId: state.siteId,
        miniInsights: state.miniInsights,
        airQualityReading: state.airQualityReading,
        pollutant: state.pollutant,
        selectedInsight: selectedInsight,
        chartIndex: chartIndex,
      ));
    }
  }

  Future<void> _onClearInsights(
    ClearDailyInsightsTab event,
    Emitter<DailyInsightsState> emit,
  ) async {
    return emit(const DailyInsightsState(
      siteId: '',
      insights: {},
      miniInsights: {},
      airQualityReading: null,
      chartIndex: 0,
      pollutant: Pollutant.pm2_5,
      selectedInsight: null,
    ));
  }
}
