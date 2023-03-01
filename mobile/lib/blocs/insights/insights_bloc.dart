
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'insights_event.dart';
part 'insights_state.dart';

class InsightsBloc extends Bloc<InsightsEvent, InsightsState> {
  InsightsBloc() : super(const InsightsState()) {
    on<InitializeInsightsPage>(_onInitializeInsightsPage);
  }

  void _onInitializeInsightsPage(
    InitializeInsightsPage event,
    Emitter<InsightsState> emit,
  ) {
    List<HealthTip> healthTips = getHealthTips(
      event.airQualityReading.pm2_5,
      Pollutant.pm2_5,
    );
    List<AirQualityReading> forecast =
        List.generate(6, (index) => event.airQualityReading).toList();

    return emit(const InsightsState().copyWith(
      airQualityReading: event.airQualityReading,
      healthTips: healthTips,
      forecast: forecast,
    ));
  }
}
