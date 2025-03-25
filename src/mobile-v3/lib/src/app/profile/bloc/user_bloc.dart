import 'package:airqo/src/app/profile/models/profile_response_model.dart';
import 'package:airqo/src/app/profile/repository/user_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'user_event.dart';
part 'user_state.dart';

class UserBloc extends Bloc<UserEvent, UserState> {
  final UserRepository repository;
  
  UserBloc(this.repository) : super(UserInitial()) {
    on<LoadUser>(_onLoadUser);
    on<UpdateUser>(_onUpdateUser);
  }

  Future<void> _onLoadUser(LoadUser event, Emitter<UserState> emit) async {
    emit(UserLoading());

    try {
      ProfileResponseModel model = await repository.loadUserProfile();
      emit(UserLoaded(model));
    } catch (e) {
      print(e.toString());
      emit(UserLoadingError(e.toString()));
    }
  }

  Future<void> _onUpdateUser(UpdateUser event, Emitter<UserState> emit) async {
    emit(UserUpdating());

    try {
      ProfileResponseModel model = await repository.updateUserProfile(
        firstName: event.firstName,
        lastName: event.lastName,
        email: event.email,
      );
      
      emit(UserUpdateSuccess(model));
      // Also emit UserLoaded state to update the UI
      emit(UserLoaded(model));
    } catch (e) {
      print(e.toString());
      emit(UserUpdateError(e.toString()));
    }
  }
}