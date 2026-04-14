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
  }

  Future<void> _onLoadForecast(LoadForecast event, Emitter<ForecastState> emit) async {
    final String siteId = event.siteId;
    
    if (state is ForecastLoaded && 
        (state as ForecastLoaded).siteId == siteId &&
        !event.forceRefresh) {
      loggy.info('Using existing forecast state for site: $siteId');
      return;
    }

    if (_cachedResponses.containsKey(siteId) && !event.forceRefresh) {
      loggy.info('Using in-memory cached forecast for site: $siteId');
      emit(ForecastLoaded(_cachedResponses[siteId]!, siteId: siteId));
    } else {
      emit(ForecastLoading(siteId: siteId));
    }
    
    try {
      final ForecastResponse response = await forecastRepository.loadForecasts(siteId);
      
      // Save to in-memory cache
      _cachedResponses[siteId] = response;
      
      emit(ForecastLoaded(response, siteId: siteId));
    } catch (e) {
      loggy.error('Error loading forecast for site $siteId: $e');
      
      // Handle specific network errors from enhanced repository
      if (e is ForecastException) {
        if (e.isNetworkError) {
          emit(ForecastNetworkError(
            message: e.message,
            siteId: siteId,
          ));
        } else {
          emit(ForecastLoadingError(
            message: e.message,
            siteId: siteId,
          ));
        }
      } else {
        emit(ForecastLoadingError(
          message: e.toString(),
          siteId: siteId,
        ));
      }
    }
  }

  Future<void> _onRefreshForecast(RefreshForecast event, Emitter<ForecastState> emit) async {
    final String siteId = event.siteId;
    
    if (event.clearCache) {
      try {
        await forecastRepository.clearCache(siteId);
        _cachedResponses.remove(siteId);
      } catch (e) {
        loggy.warning('Failed to clear cache: $e');
      }
    }
    
    add(LoadForecast(siteId, forceRefresh: true));
  }
}

