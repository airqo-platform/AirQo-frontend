import 'package:airqo/src/app/learn/models/learn_v2_catalog.dart';
import 'package:airqo/src/app/learn/repository/learn_repository.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';

part 'kya_event.dart';
part 'kya_state.dart';

class KyaBloc extends Bloc<KyaEvent, KyaState> with UiLoggy {
  final LearnRepository repository;
  final CacheManager _cacheManager = CacheManager();

  KyaBloc(this.repository) : super(KyaInitial()) {
    on<LoadLessons>(_onLoadLessons);
    on<RefreshLessons>(_onRefreshLessons);
  }

  Future<void> _onLoadLessons(
      LoadLessons event, Emitter<KyaState> emit) async {
    try {
      emit(LessonsLoading());

      final LearnV2CatalogResponse model =
          await repository.fetchCatalog(forceRefresh: event.forceRefresh);

      emit(LessonsLoaded(model));
    } catch (e) {
      loggy.error('Error loading Learn catalog: $e');

      try {
        final LearnV2CatalogResponse? cachedModel =
            await _getCachedCatalog();

        emit(LessonsLoadingError(
          message: e.toString(),
          cachedModel: cachedModel,
          isOffline: !_cacheManager.isConnected,
        ));
      } catch (cacheError) {
        loggy.error('Error fetching cached catalog: $cacheError');
        emit(LessonsLoadingError(
          message: e.toString(),
          isOffline: !_cacheManager.isConnected,
        ));
      }
    }
  }

  Future<void> _onRefreshLessons(
      RefreshLessons event, Emitter<KyaState> emit) async {
    emit(LessonsRefreshing(currentModel: event.currentModel));

    try {
      final LearnV2CatalogResponse model =
          await repository.fetchCatalog(forceRefresh: true);

      emit(LessonsLoaded(model));
    } catch (e) {
      loggy.error('Error refreshing Learn catalog: $e');

      if (event.currentModel != null) {
        emit(LessonsLoaded(event.currentModel!));
      } else {
        final LearnV2CatalogResponse? cachedModel =
            await _getCachedCatalog();

        emit(LessonsLoadingError(
          message: e.toString(),
          cachedModel: cachedModel,
          isOffline: !_cacheManager.isConnected,
        ));
      }
    }
  }

  Future<LearnV2CatalogResponse?> _getCachedCatalog() async {
    try {
      return await repository.getCachedCatalog();
    } catch (e) {
      loggy.error('Error getting cached Learn catalog: $e');
      return null;
    }
  }
}
