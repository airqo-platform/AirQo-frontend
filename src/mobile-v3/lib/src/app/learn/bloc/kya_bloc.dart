import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/repository/kya_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';

part 'kya_event.dart';
part 'kya_state.dart';

class KyaBloc extends Bloc<KyaEvent, KyaState> with UiLoggy {
  final KyaRepository repository;
  KyaBloc(this.repository) : super(KyaInitial()) {
    on<LoadLessons>(_onLoadLessons);
    on<RefreshLessons>(_onRefreshLessons);
  }

  Future<void> _onLoadLessons(LoadLessons event, Emitter<KyaState> emit) async {
    try {
      emit(LessonsLoading());

      final LessonResponseModel model =
          await repository.fetchLessons(forceRefresh: event.forceRefresh);

      emit(LessonsLoaded(model));
    } catch (e) {
      loggy.error('Error loading lessons: $e');

      // Try to get cached data directly from the repository
      try {
        final LessonResponseModel? cachedModel = await _getCachedLessonsData();

        emit(LessonsLoadingError(
          message: e.toString(),
          cachedModel: cachedModel,
        ));
      } catch (cacheError) {
        loggy.error('Error fetching cached lessons: $cacheError');
        emit(LessonsLoadingError(message: e.toString()));
      }
    }
  }

  Future<void> _onRefreshLessons(
      RefreshLessons event, Emitter<KyaState> emit) async {
    emit(LessonsRefreshing(currentModel: event.currentModel));

    try {
      final LessonResponseModel model =
          await repository.fetchLessons(forceRefresh: true);

      emit(LessonsLoaded(model));
    } catch (e) {
      loggy.error('Error refreshing lessons: $e');

      if (event.currentModel != null) {
        // Return to loaded state with existing data
        emit(LessonsLoaded(event.currentModel!));
      } else {
        // Try to get cached data
        final LessonResponseModel? cachedModel = await _getCachedLessonsData();

        emit(LessonsLoadingError(
          message: e.toString(),
          cachedModel: cachedModel,
        ));
      }
    }
  }

  Future<LessonResponseModel?> _getCachedLessonsData() async {
    try {
      return await (repository as KyaImpl).getCachedLessonsData();
    } catch (e) {
      loggy.error('Error getting cached lessons data: $e');
      return null;
    }
  }
}
