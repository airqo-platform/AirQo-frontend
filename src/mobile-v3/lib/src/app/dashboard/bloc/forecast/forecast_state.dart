part of 'forecast_bloc.dart';

sealed class ForecastState extends Equatable {
  const ForecastState();

  @override
  List<Object> get props => [];
}

final class ForecastInitial extends ForecastState {}

class ForecastLoading extends ForecastState {}

class ForecastLoaded extends ForecastState {
  final ForecastResponse response;
  const ForecastLoaded(this.response);
}

class ForecastLoadingError extends ForecastState {
  final String message;

  const ForecastLoadingError(this.message);
}
