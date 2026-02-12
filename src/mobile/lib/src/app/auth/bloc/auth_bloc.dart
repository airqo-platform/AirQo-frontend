import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/cupertino.dart';
import 'package:loggy/loggy.dart';

import '../../shared/repository/secure_storage_repository.dart';
import '../../shared/services/cache_manager.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> with UiLoggy {
  final AuthRepository authRepository;

  AuthBloc(this.authRepository) : super(AuthInitial()) {
    on<AppStarted>(_onAppStarted);

    on<LoginUser>(_onLoginUser);

    on<RegisterUser>(_onRegisterUser);

    on<LogoutUser>(_onLogoutUser);

    on<DeleteUserAccount>(_onDeleteUserAccount);

    on<SessionExpired>(_onSessionExpired);

    on<UseAsGuest>((event, emit) => emit(GuestUser()));

    on<VerifyEmailCode>(_onVerifyEmailCode);
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final token = await SecureStorageRepository.instance.getSecureData(SecureStorageKeys.authToken);

      if (token != null && token.isNotEmpty) {
        emit(AuthLoaded(AuthPurpose.login));
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
    await authRepository.loginWithEmailAndPassword(
        event.username, event.password);

    emit(AuthLoaded(AuthPurpose.login));
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
      emit(AuthLoaded(AuthPurpose.register));
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
      loggy.info('Starting logout process - clearing auth tokens');
      await SecureStorageRepository.instance.deleteSecureData(SecureStorageKeys.authToken);
      await SecureStorageRepository.instance.deleteSecureData(SecureStorageKeys.userId);

      loggy.info('Clearing all cached data on logout');
      await CacheManager().clearAll();

      emit(GuestUser());
    } catch (e) {
      debugPrint("Logout error: $e");
      loggy.error("Logout error: $e");
      emit(AuthLoadingError("Failed to log out. Please try again."));
    }
  }

  Future<void> _onDeleteUserAccount(DeleteUserAccount event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await authRepository.deleteUserAccount();
      emit(GuestUser()); 
    } catch (e) {
      debugPrint("Account deletion error: $e");
      emit(AuthLoadingError(_extractErrorMessage(e)));
    }
  }

  Future<void> _onSessionExpired(SessionExpired event, Emitter<AuthState> emit) async {
    try {
      loggy.info('Session expired - clearing auth tokens and cached data');
      await SecureStorageRepository.instance.deleteSecureData(SecureStorageKeys.authToken);
      await SecureStorageRepository.instance.deleteSecureData(SecureStorageKeys.userId);

      loggy.info('Clearing all cached data due to session expiration');
      await CacheManager().clearAll();

      emit(GuestUser());
    } catch (e) {
      debugPrint("Session expiry cleanup error: $e");
      loggy.error("Session expiry cleanup error: $e");
      emit(GuestUser());
    }
  }

  String _extractErrorMessage(dynamic e) {
    if (e is Exception) {
      return e.toString().replaceAll("Exception:", "").trim();
    }
    return "An unknown error occurred.";
  }
}
