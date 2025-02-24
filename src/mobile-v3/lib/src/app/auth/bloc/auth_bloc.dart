import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/cupertino.dart';

import '../../shared/repository/hive_repository.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc(this.authRepository) : super(AuthInitial()) {
    on<AppStarted>(_onAppStarted);

    on<LoginUser>(_onLoginUser);

    on<RegisterUser>(_onRegisterUser);

    on<LogoutUser>(_onLogoutUser);

    on<UseAsGuest>((event, emit) => emit(GuestUser()));
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      //await Future.delayed(const Duration(milliseconds: 500));
      final token = await HiveRepository.getData('token', HiveBoxNames.authBox);

      if (token != null && token.isNotEmpty) {
        emit(AuthLoaded(AuthPurpose.LOGIN)); // User is logged in
      } else {
        emit(GuestUser()); // No token found, proceed as guest
      }
    } catch (e) {
      debugPrint("Error checking auth state: $e");
      emit(AuthLoadingError("Failed to check authentication state."));
    }
  }

  Future<void> _onLoginUser(LoginUser event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final token = await authRepository.loginWithEmailAndPassword(
          event.username, event.password);
      await HiveRepository.saveData(HiveBoxNames.authBox, 'token', token);
      // Save token in Hive
      final savedToken =
          await HiveRepository.getData('token', HiveBoxNames.authBox);
      //debugPrint("Saved token: $savedToken");

      emit(AuthLoaded(AuthPurpose.LOGIN));
    } catch (e) {
      debugPrint("Login error: $e");
      emit(AuthLoadingError(_extractErrorMessage(e)));
    }
  }

  Future<void> _onRegisterUser(
      RegisterUser event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await authRepository.registerWithEmailAndPassword(event.model);
      emit(AuthLoaded(AuthPurpose.REGISTER));
    } catch (e) {
      debugPrint("Registration error: $e");
      emit(AuthLoadingError(_extractErrorMessage(e)));
    }
  }


  Future<void> _onLogoutUser(LogoutUser event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await HiveRepository.deleteData(
          'token', HiveBoxNames.authBox); // Remove token from Hive
      emit(GuestUser()); // Emit guest state after logout
    } catch (e) {
      debugPrint("Logout error: $e");
      emit(AuthLoadingError("Failed to log out. Please try again."));
    }
  }

  String _extractErrorMessage(dynamic e) {
    if (e is Exception) {
      return e.toString().replaceAll("Exception:", "").trim();
    }
    return "An unknown error occurred.";
  }
}
