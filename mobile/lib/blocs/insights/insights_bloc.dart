import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'insights_event.dart';
part 'insights_state.dart';

class InsightsBloc extends Bloc<InsightsEvent, InsightsState> {
  InsightsBloc()
      : super(InsightsState("",
            selectedInsight: Insight.initializeEmpty(DateTime.now()))) {
    on<InitializeInsightsPage>(_onInitializeInsightsPage);
    on<SwitchInsight>(_onSwitchInsight);
  }

  void _onSwitchInsight(SwitchInsight event, Emitter<InsightsState> emit) {
    return emit(state.copyWith(
      selectedInsight: event.insight,
    ));
  }

  Future<void> _onInitializeInsightsPage(
    InitializeInsightsPage event,
    Emitter<InsightsState> emit,
  ) async {
    emit(InsightsState(
      event.airQualityReading.name,
      selectedInsight: state.selectedInsight,
    ));
    String siteId = event.airQualityReading.referenceSite;
    Set<Insight> insights = List<Insight>.generate(
      7,
      (int index) => Insight.initializeEmpty(
        event.airQualityReading.dateTime.add(Duration(days: index)),
      ),
    ).toSet();

    List<Forecast> forecast = await HiveService().getForecast(siteId);
    Forecast? todayForecast;

    if (DateTime.now().hour < 12) {
      List<Forecast> todayForecasts = forecast
          .where(
            (element) => element.time.day == DateTime.now().day,
          )
          .toList();
      if (todayForecasts.isNotEmpty) {
        todayForecast = todayForecasts.first;
      }
    }

    insights.addOrUpdate(
      Insight.fromAirQualityReading(
        event.airQualityReading,
        forecast: todayForecast,
      ),
    );

    setInsights(
      emit,
      insights: insights,
      forecast: forecast,
      airQualityReading: event.airQualityReading,
    );

    forecast = await AirqoApiClient().fetchForecast(siteId);
    if (forecast.isEmpty) return;

    forecast = forecast.removeInvalidData();
    setInsights(
      emit,
      insights: insights,
      forecast: forecast,
      airQualityReading: event.airQualityReading,
    );

    HiveService().saveForecast(forecast, siteId);
  }

  void setInsights(
    Emitter<InsightsState> emit, {
    required Set<Insight> insights,
    required List<Forecast> forecast,
    required AirQualityReading airQualityReading,
  }) {
    Set<Insight> data = List.of(insights.toList()).toSet();
    Insight todayInsight = insights.firstWhere(
      (element) => element.dateTime.isSameDay(airQualityReading.dateTime),
    );

    if (forecast.isNotEmpty) {
      data.removeWhere((element) => element != todayInsight);

      List<Forecast> forecasts = List.of(forecast);
      forecasts.removeWhere((element) =>
          element.time.isSameDay(todayInsight.dateTime) ||
          element.time.isBefore(todayInsight.dateTime));

      forecasts.sortByDateTime();
      forecasts = forecasts.take(6).toList();

      for (Forecast forecast in forecasts) {
        data.addOrUpdate(Insight.fromForecast(forecast));
      }
    }

    List<Insight> insightsData = data.toList();
    insightsData.sortByDateTime();
    insightsData = insightsData.take(7).toList();

    return emit(
      state.copyWith(
        selectedInsight: todayInsight,
        insights: insightsData,
      ),
    );
  }
}
