import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/cupertino.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;
  AuthBloc(this.authRepository) : super(AuthInitial()) {
    on<AuthEvent>((event, emit) async {
      if (event is LoginUser) {
        try {
          emit(AuthLoading());
          await authRepository.loginWithEmailAndPassword(
              event.username, event.password);

          emit(AuthLoaded(AuthPurpose.LOGIN));
        } catch (e) {
          debugPrint(e.toString());
          emit(
            AuthLoadingError(
              e.toString(),
            ),
          );
        }
      } else if (event is RegisterUser) {
        try {
          emit(AuthLoading());

          await authRepository.registerWithEmailAndPassword(event.model);

          emit(AuthLoaded(AuthPurpose.REGISTER));
        } catch (e) {
          debugPrint(e.toString());
          emit(
            AuthLoadingError(
              e.toString(),
            ),
          );
        }
      }
    });
  }
}
