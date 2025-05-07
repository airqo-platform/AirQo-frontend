import 'package:airqo/src/app/dashboard/models/health_tips_model.dart';
import 'package:airqo/src/app/dashboard/repository/health_tips_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';

part 'health_tips_event.dart';
part 'health_tips_state.dart';

class HealthTipsBloc extends Bloc<HealthTipsEvent, HealthTipsState> with UiLoggy {
  final HealthTipsRepository repository;
  
  HealthTipsBloc(this.repository) : super(HealthTipsInitial()) {
    on<LoadHealthTips>(_onLoadHealthTips);
    on<GetHealthTipForAqi>(_onGetHealthTipForAqi);
    on<RefreshHealthTips>(_onRefreshHealthTips);
  }

  Future<void> _onLoadHealthTips(LoadHealthTips event, Emitter<HealthTipsState> emit) async {
    emit(HealthTipsLoading());
    
    try {
      final response = await repository.fetchHealthTips();
      
      if (response.success && response.data.healthTips.isNotEmpty) {
        emit(HealthTipsLoaded(response.data.healthTips));
      } else {
        emit(HealthTipsError('Failed to load health tips: ${response.message}'));
      }
    } catch (e) {
      loggy.error('Error loading health tips: $e');
      emit(HealthTipsError('Failed to load health tips: $e'));
    }
  }

  Future<void> _onGetHealthTipForAqi(GetHealthTipForAqi event, Emitter<HealthTipsState> emit) async {
    final currentState = state;
    if (currentState is! HealthTipsLoaded) {
      emit(HealthTipsLoading());
    }
    
    try {
      final tip = await repository.getHealthTipForAqi(event.aqiValue);
      
      if (tip != null) {
        emit(HealthTipForAqiLoaded(tip));
      } else {
        // If we couldn't find a specific tip, just load all tips as fallback
        final response = await repository.fetchHealthTips();
        
        if (response.success && response.data.healthTips.isNotEmpty) {
          emit(HealthTipsLoaded(response.data.healthTips));
        } else {
          emit(HealthTipsError('No health tip found for AQI value: ${event.aqiValue}'));
        }
      }
    } catch (e) {
      loggy.error('Error getting health tip for AQI ${event.aqiValue}: $e');
      emit(HealthTipsError('Failed to get health tip: $e'));
    }
  }

  Future<void> _onRefreshHealthTips(RefreshHealthTips event, Emitter<HealthTipsState> emit) async {
    emit(HealthTipsLoading());
    
    try {
      
      final response = await repository.fetchHealthTips();
      
      if (response.success && response.data.healthTips.isNotEmpty) {
        emit(HealthTipsLoaded(response.data.healthTips));
      } else {
        emit(HealthTipsError('Failed to refresh health tips: ${response.message}'));
      }
    } catch (e) {
      loggy.error('Error refreshing health tips: $e');
      emit(HealthTipsError('Failed to refresh health tips: $e'));
    }
  }
}