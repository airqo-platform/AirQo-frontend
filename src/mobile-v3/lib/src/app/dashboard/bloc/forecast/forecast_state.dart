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

  ForecastLoaded(this.response, {required String siteId})
      : loadTime = DateTime.now(),
        super(siteId: siteId);
        
  @override
  List<Object?> get props => [response, siteId];
  
  // Check if data is stale (older than 2 hours)
  bool get isStale {
    final now = DateTime.now();
    return now.difference(loadTime) > const Duration(hours: 2);
  }
}

// General error state
class ForecastLoadingError extends ForecastState {
  final String message;

  const ForecastLoadingError({
    required this.message,
    super.siteId,
  });
  
  @override
  List<Object?> get props => [message, siteId];
}

// Specific network error state for better UX
class ForecastNetworkError extends ForecastState {
  final String message;

  const ForecastNetworkError({
    required this.message,
    super.siteId,
  });
  
  @override
  List<Object?> get props => [message, siteId];
}