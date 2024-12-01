import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/repository/kya_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'kya_event.dart';
part 'kya_state.dart';

class KyaBloc extends Bloc<KyaEvent, KyaState> {
  final KyaRepository repository;
  KyaBloc(this.repository) : super(KyaInitial()) {
    on<KyaEvent>((event, emit) async {
      if (event is LoadLessons) {
        try {
          emit(LessonsLoading());
          LessonResponseModel model = await repository.fetchLessons();
          emit(LessonsLoaded(model));
        } catch (e) {
          emit(LessonsLoadingError(e.toString()));
        }
      }
    });
  }
}
