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

    on<VerifyEmailCode>(_onVerifyEmailCode);
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final token = await HiveRepository.getData('token', HiveBoxNames.authBox);

      if (token != null && token.isNotEmpty) {
        emit(AuthLoaded(AuthPurpose.LOGIN));
      } else {
        emit(GuestUser());
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

    emit(AuthLoaded(AuthPurpose.LOGIN));
  } catch (e) {
    debugPrint("Login error: $e");
    
    final String errorMsg = e.toString().toLowerCase();
    if (errorMsg.contains('not verified') || 
        errorMsg.contains('unverified') || 
        errorMsg.contains('verify your email') ||
        errorMsg.contains('verification required')) {
      emit(EmailUnverifiedError(_extractErrorMessage(e), event.username));
    } else {
      emit(AuthLoadingError(_extractErrorMessage(e)));
    }
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

  Future<void> _onVerifyEmailCode(VerifyEmailCode event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await authRepository.verifyEmailCode(
        event.token,
        event.email,
        );
      emit(AuthVerified());
    } catch (e) {
      debugPrint("Email verification error: $e");
      emit(AuthLoadingError(_extractErrorMessage(e)));
    }
  }

  Future<void> _onLogoutUser(LogoutUser event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await HiveRepository.deleteData(
          'token', HiveBoxNames.authBox);
      emit(GuestUser()); 
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
