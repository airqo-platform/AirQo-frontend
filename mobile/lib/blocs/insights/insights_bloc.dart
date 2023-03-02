import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'insights_event.dart';
part 'insights_state.dart';

class InsightsBloc extends Bloc<InsightsEvent, InsightsState> {
  InsightsBloc() : super(const InsightsState()) {
    on<InitializeInsightsPage>(_onInitializeInsightsPage);
    on<SwitchInsight>(_onSwitchInsight);
    on<ClearInsight>(_onClearInsight);
  }

  void _onSwitchInsight(SwitchInsight event, Emitter<InsightsState> emit) {
    return emit(state.copyWith(
      selectedInsight: event.insight,
    ));
  }

  void _onClearInsight(ClearInsight event, Emitter<InsightsState> emit) {
    return emit(const InsightsState());
  }

  Future<void> _onInitializeInsightsPage(
    InitializeInsightsPage event,
    Emitter<InsightsState> emit,
  ) async {
    emit(const InsightsState());

    Set<Insight> insights = {};
    insights.add(Insight.fromAirQualityReading(event.airQualityReading));

    while (insights.length <= 6) {
      DateTime nextDay = insights.last.dateTime.add(const Duration(days: 1));
      insights.add(Insight.initializeEmpty(event.airQualityReading, nextDay));
    }

    emit(
      state.copyWith(
        selectedInsight: insights.firstWhere(
            (element) => element.dateTime == event.airQualityReading.dateTime),
        insights: insights.toList(),
      ),
    );
  }
}
