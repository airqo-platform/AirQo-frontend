import 'package:airqo/src/app/profile/models/profile_response_model.dart';
import 'package:airqo/src/app/profile/repository/user_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';

part 'user_event.dart';
part 'user_state.dart';

class UserBloc extends Bloc<UserEvent, UserState> with UiLoggy {
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
      // Specific error categorization for Slack alerts
      String errorType;
      String specificError = e.toString();
      
      if (specificError.contains('User ID not found')) {
        errorType = 'CRITICAL_AUTH_ERROR: UserId missing from local storage';
      } else if (specificError.contains('401') || specificError.contains('Unauthorized')) {
        errorType = 'CRITICAL_AUTH_ERROR: Token expired or invalid (HTTP 401/Unauthorized)';
      } else if (specificError.contains('403')) {
        errorType = 'CRITICAL_AUTH_ERROR: Token lacks user profile permissions (HTTP 403)';
      } else if (specificError.contains('404')) {
        errorType = 'DATA_ERROR: User profile not found in database (HTTP 404)';
      } else if (specificError.contains('500') || specificError.contains('502') || specificError.contains('503')) {
        errorType = 'SERVER_ERROR: Backend service unavailable';
      } else if (specificError.contains('FormatException') || specificError.contains('type \'Null\'')) {
        errorType = 'DATA_PARSING_ERROR: Invalid API response structure';
      } else if (specificError.contains('SocketException') || specificError.contains('TimeoutException')) {
        errorType = 'NETWORK_ERROR: Connection failed to profile service';
      } else {
        errorType = 'UNKNOWN_USER_LOAD_ERROR';
      }
      
      loggy.error('UserBloc LoadUser Failed: $errorType | Details: $specificError');
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
        profilePicture: event.profilePicture,
      );
      
      emit(UserUpdateSuccess(model));

      emit(UserLoaded(model));
    } catch (e) {
      print(e.toString());
      emit(UserUpdateError(e.toString()));
    }
  }
}