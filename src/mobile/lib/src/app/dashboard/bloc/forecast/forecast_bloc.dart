import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/dashboard/repository/forecast_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';

part 'forecast_event.dart';
part 'forecast_state.dart';

class ForecastBloc extends Bloc<ForecastEvent, ForecastState> with UiLoggy {
  final ForecastRepository forecastRepository;

  final Map<String, ForecastResponse> _cachedResponses = {};

  ForecastBloc(this.forecastRepository) : super(ForecastInitial()) {
    on<LoadForecast>(_onLoadForecast);
    on<RefreshForecast>(_onRefreshForecast);
    on<LoadHourlyForecast>(_onLoadHourlyForecast);
  }

  Future<void> _onLoadForecast(
      LoadForecast event, Emitter<ForecastState> emit) async {
    final siteId = event.siteId;

    if (state is ForecastLoaded &&
        (state as ForecastLoaded).siteId == siteId &&
        !event.forceRefresh) {
      return;
    }

    if (_cachedResponses.containsKey(siteId) && !event.forceRefresh) {
      emit(ForecastLoaded(_cachedResponses[siteId]!, siteId: siteId));
    } else {
      emit(ForecastLoading(siteId: siteId));
    }

    try {
      final response = await forecastRepository.loadForecasts(siteId);
      _cachedResponses[siteId] = response;
      emit(ForecastLoaded(response, siteId: siteId));
    } catch (e) {
      loggy.error('Error loading daily forecast for $siteId: $e');
      if (e is ForecastException && e.isNetworkError) {
        emit(ForecastNetworkError(message: e.message, siteId: siteId));
      } else if (e is ForecastException) {
        emit(ForecastLoadingError(message: e.message, siteId: siteId));
      } else {
        emit(ForecastLoadingError(message: e.toString(), siteId: siteId));
      }
    }
  }

  Future<void> _onRefreshForecast(
      RefreshForecast event, Emitter<ForecastState> emit) async {
    if (event.clearCache) {
      try {
        await forecastRepository.clearCache(event.siteId);
        _cachedResponses.remove(event.siteId);
      } catch (e) {
        loggy.warning('Failed to clear cache: $e');
      }
    }
    add(LoadForecast(event.siteId, forceRefresh: true));
  }

  Future<void> _onLoadHourlyForecast(
      LoadHourlyForecast event, Emitter<ForecastState> emit) async {
    final siteId = event.siteId;

    // Only load hourly when we already have daily data loaded
    final currentState = state;
    ForecastResponse? dailyResponse;
    if (currentState is ForecastLoaded && currentState.siteId == siteId) {
      dailyResponse = currentState.response;
      if (currentState.hourlyResponse != null && !event.forceRefresh) return;
    } else if (_cachedResponses.containsKey(siteId)) {
      dailyResponse = _cachedResponses[siteId];
    }

    if (dailyResponse != null) {
      emit(HourlyForecastLoading(dailyResponse: dailyResponse, siteId: siteId));
    }

    try {
      final hourly =
          await forecastRepository.loadHourlyForecasts(siteId);
      final daily = dailyResponse ?? _cachedResponses[siteId];
      if (daily != null) {
        emit(ForecastLoaded(daily, siteId: siteId, hourlyResponse: hourly));
      }
    } catch (e) {
      loggy.error('Error loading hourly forecast for $siteId: $e');
      if (dailyResponse != null) {
        emit(HourlyForecastError(
          message: e is ForecastException ? e.message : e.toString(),
          dailyResponse: dailyResponse,
          siteId: siteId,
        ));
      }
    }
  }
}
