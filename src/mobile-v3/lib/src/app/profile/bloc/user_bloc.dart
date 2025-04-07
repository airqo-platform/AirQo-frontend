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
    print("UserBloc: Starting to load user profile...");
    emit(UserLoading());

    try {
      ProfileResponseModel model = await repository.loadUserProfile();
      print("UserBloc: Loaded profile - Users: ${model.users.length}, First User: ${model.users.isNotEmpty ? model.users[0].toString() : 'No users'}");
      emit(UserLoaded(model));
    } catch (e) {
      print("UserBloc: Error loading user profile: $e");
      emit(UserLoadingError(e.toString()));
    }
  }

  Future<void> _onUpdateUser(UpdateUser event, Emitter<UserState> emit) async {
    print("UserBloc: Starting to update user profile...");
    emit(UserUpdating());

    try {
      ProfileResponseModel model = await repository.updateUserProfile(
        firstName: event.firstName,
        lastName: event.lastName,
        email: event.email,
        profilePicture: event.profilePicture,
      );
      print("UserBloc: Updated profile - Users: ${model.users.length}, First User: ${model.users.isNotEmpty ? model.users[0].toString() : 'No users'}");
      emit(UserUpdateSuccess(model));
      emit(UserLoaded(model));
    } catch (e) {
      print("UserBloc: Error updating user profile: $e");
      emit(UserUpdateError(e.toString()));
    }
  }
}