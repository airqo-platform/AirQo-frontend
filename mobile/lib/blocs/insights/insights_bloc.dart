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

  List<Insight> _onAddForecastData(
    List<Insight> insights,
    List<Forecast> forecast,
  ) {
    if (forecast.isEmpty) {
      return insights;
    }

    Insight todayInsight = insights.first;
    List<Insight> latestInsights = [];

    try {
      Forecast todayForecast = forecast.firstWhere(
        (element) => element.time.isSameDay(todayInsight.dateTime),
      );
      todayInsight = todayInsight.copyWithForecast(
        forecastAirQuality: todayForecast.airQuality,
        forecastPm2_5: todayForecast.pm2_5,
      );
    } catch (_) {}

    latestInsights.add(todayInsight);
    List<Forecast> forecastInsights = List.of(forecast);
    forecastInsights.sort((a, b) => a.time.compareTo(b.time));
    forecastInsights = forecast
        .where((element) => element.time.isAfter(todayInsight.dateTime))
        .take(6)
        .toList();

    latestInsights.addAll(
      forecastInsights.map((e) => Insight.fromForecast(e)).toList(),
    );

    while (latestInsights.length < 7) {
      latestInsights.add(
        Insight.initializeEmpty(
          latestInsights.last.dateTime.add(
            const Duration(days: 1),
          ),
        ),
      );
    }

    return latestInsights;
  }

  Future<void> _onInitializeInsightsPage(
    InitializeInsightsPage event,
    Emitter<InsightsState> emit,
  ) async {
    List<Insight> insights = [];

    Insight todayInsight = Insight.fromAirQualityReading(
      event.airQualityReading,
    );
    insights.add(todayInsight);
    insights.addAll(List<Insight>.generate(
      6,
      (int index) => Insight.initializeEmpty(
        todayInsight.dateTime.add(Duration(days: index + 1)),
      ),
    ).toList());

    emit(InsightsState(
      event.airQualityReading.name,
      selectedInsight: todayInsight,
      insights: insights.toList(),
    ));

    String siteId = event.airQualityReading.referenceSite;
    List<Forecast> forecast = await HiveService().getForecast(siteId);
    insights = _onAddForecastData(insights, forecast);
    emit(state.copyWith(
      selectedInsight: todayInsight,
      insights: insights.toList(),
    ));

    forecast = await AirqoApiClient().fetchForecast(siteId);
    insights = _onAddForecastData(insights, forecast);
    emit(state.copyWith(
      selectedInsight: todayInsight,
      insights: insights.toList(),
    ));

    HiveService().saveForecast(forecast, siteId);
  }
}
