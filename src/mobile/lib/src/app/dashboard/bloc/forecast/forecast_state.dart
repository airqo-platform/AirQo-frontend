part of 'forecast_bloc.dart';

sealed class ForecastState extends Equatable {
  final String? siteId;

  const ForecastState({this.siteId});

  @override
  List<Object?> get props => [siteId];
}

final class ForecastInitial extends ForecastState {}

class ForecastLoading extends ForecastState {
  const ForecastLoading({super.siteId});
}

class ForecastLoaded extends ForecastState {
  final ForecastResponse response;
  final DateTime loadTime;
  final HourlyForecastResponse? hourlyResponse;

  ForecastLoaded(this.response, {required String siteId, this.hourlyResponse})
      : loadTime = DateTime.now(),
        super(siteId: siteId);

  bool get isStale =>
      DateTime.now().difference(loadTime) > const Duration(hours: 2);

  ForecastLoaded copyWith({HourlyForecastResponse? hourlyResponse}) =>
      ForecastLoaded(
        response,
        siteId: siteId!,
        hourlyResponse: hourlyResponse ?? this.hourlyResponse,
      );

  @override
  List<Object?> get props => [response, siteId, hourlyResponse];
}

class ForecastLoadingError extends ForecastState {
  final String message;

  const ForecastLoadingError({required this.message, super.siteId});

  @override
  List<Object?> get props => [message, siteId];
}

class ForecastNetworkError extends ForecastState {
  final String message;

  const ForecastNetworkError({required this.message, super.siteId});

  @override
  List<Object?> get props => [message, siteId];
}

class HourlyForecastLoading extends ForecastState {
  final ForecastResponse dailyResponse;

  const HourlyForecastLoading(
      {required this.dailyResponse, super.siteId});

  @override
  List<Object?> get props => [dailyResponse, siteId];
}

class HourlyForecastError extends ForecastState {
  final String message;
  final ForecastResponse dailyResponse;

  const HourlyForecastError(
      {required this.message, required this.dailyResponse, super.siteId});

  @override
  List<Object?> get props => [message, dailyResponse, siteId];
}
