import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'insights_event.dart';
part 'insights_state.dart';

class InsightsBloc extends Bloc<InsightsEvent, InsightsState> {
  InsightsBloc() : super(const InsightsState("")) {
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
    emit(InsightsState(event.airQualityReading.name));
    String siteId = event.airQualityReading.referenceSite;
    Set<Insight> insights = List<Insight>.generate(
      7,
      (int index) => Insight.initializeEmpty(
        event.airQualityReading.dateTime.add(Duration(days: index)),
      ),
    ).toSet();

    List<Forecast> forecast = await HiveService.getForecast(siteId);
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

    setInsights(
      emit,
      insights: insights,
      forecast: forecast,
      airQualityReading: event.airQualityReading,
    );

    HiveService.saveForecast(forecast, siteId);
  }

  void setInsights(
    Emitter<InsightsState> emit, {
    required Set<Insight> insights,
    required List<Forecast> forecast,
    required AirQualityReading airQualityReading,
  }) {
    List<Forecast> forecasts = forecast.sortByDateTime().take(6).toList();

    for (Forecast forecast in forecasts) {
      if (forecast.time.isSameDay(airQualityReading.dateTime)) continue;

      insights.addOrUpdate(Insight.fromForecast(forecast));
    }

    return emit(
      state.copyWith(
        selectedInsight: insights.firstWhere(
          (element) => element.dateTime.isSameDay(airQualityReading.dateTime),
        ),
        insights: insights.toList().sortByDateTime().take(7).toList(),
      ),
    );
  }
}
