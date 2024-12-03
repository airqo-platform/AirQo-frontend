part of 'forecast_bloc.dart';

sealed class ForecastEvent extends Equatable {
  const ForecastEvent();

  @override
  List<Object> get props => [];
}

class LoadForecast extends ForecastEvent {
  final String siteId;

  const LoadForecast(this.siteId);
}