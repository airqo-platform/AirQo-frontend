import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/dashboard/repository/forecast_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'forecast_event.dart';
part 'forecast_state.dart';

class ForecastBloc extends Bloc<ForecastEvent, ForecastState> {
  final ForecastRepository forecastRepository;
  ForecastBloc(this.forecastRepository) : super(ForecastInitial()) {
    on<ForecastEvent>((event, emit) async {
      if (event is LoadForecast) {
        emit(ForecastLoading());
        try {
          ForecastResponse response =
              await forecastRepository.loadForecasts(event.siteId);

          emit(ForecastLoaded(response));
        } catch (e) {
          emit(
            ForecastLoadingError(
              e.toString(),
            ),
          );
        }
      }
    });
  }
}
