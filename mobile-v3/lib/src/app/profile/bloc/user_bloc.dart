import 'package:airqo/src/app/profile/models/profile_response_model.dart';
import 'package:airqo/src/app/profile/repository/user_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'user_event.dart';
part 'user_state.dart';

class UserBloc extends Bloc<UserEvent, UserState> {
  final UserRepository repository;
  UserBloc(this.repository) : super(UserInitial()) {
    on<UserEvent>((event, emit) async {
      if (event is LoadUser) {
        emit(UserLoading());

        try {
          ProfileResponseModel model = await this.repository.loadUserProfile();

          emit(UserLoaded(model));
        } catch (e) {
          print(e.toString());
          emit(UserLoadingError(e.toString()));
        }
      }
    });
  }
}
