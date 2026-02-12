part of 'forecast_bloc.dart';

sealed class ForecastEvent extends Equatable {
  const ForecastEvent();

  @override
  List<Object> get props => [];
}

class LoadForecast extends ForecastEvent {
  final String siteId;
  final bool forceRefresh;

  const LoadForecast(this.siteId, {this.forceRefresh = false});
  
  @override
  List<Object> get props => [siteId, forceRefresh];
}

class RefreshForecast extends ForecastEvent {
  final String siteId;
  final bool clearCache;

  const RefreshForecast(this.siteId, {this.clearCache = true});
  
  @override
  List<Object> get props => [siteId, clearCache];
}


