import 'package:app/models/models.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'insights_event.dart';
part 'insights_state.dart';

class InsightsBloc extends Bloc<InsightsEvent, InsightsState> {
  InsightsBloc() : super(const InsightsState()) {
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
    emit(const InsightsState());

    Set<Insight> insights = List<Insight>.generate(
        7,
        (int index) => Insight.initializeEmpty(
              event.airQualityReading.name,
              event.airQualityReading.dateTime.add(Duration(days: index)),
            )).toSet();

    insights.addOrUpdate(
      Insight.fromAirQualityReading(event.airQualityReading),
    );

    List<Forecast> forecastData = await AirQoDatabase().getForecast(
      event.airQualityReading.referenceSite,
    );

    setInsights(
      emit,
      insights: insights,
      forecastData: forecastData,
      airQualityReading: event.airQualityReading,
    );

    forecastData = await AppService.fetchInsightsData(
      event.airQualityReading.referenceSite,
    );

    setInsights(
      emit,
      insights: insights,
      forecastData: forecastData,
      airQualityReading: event.airQualityReading,
    );
  }

  void setInsights(
    Emitter<InsightsState> emit, {
    required Set<Insight> insights,
    required List<Forecast> forecastData,
    required AirQualityReading airQualityReading,
  }) {
    List<Forecast> forecasts = forecastData.sortByDateTime().take(6).toList();

    for (Forecast forecast in forecasts) {
      if (forecast.time.isSameDay(airQualityReading.dateTime)) continue;

      insights.addOrUpdate(Insight.fromForecast(
        forecast,
        name: airQualityReading.name,
      ));
    }

    emit(
      state.copyWith(
        selectedInsight: insights.firstWhere(
          (element) => element.dateTime.isSameDay(airQualityReading.dateTime),
        ),
        insights: insights.toList().sortByDateTime().take(7).toList(),
      ),
    );
  }
}
