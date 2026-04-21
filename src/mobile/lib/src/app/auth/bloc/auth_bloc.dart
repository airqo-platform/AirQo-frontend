import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/shared/repository/global_auth_manager.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:airqo/src/app/shared/utils/device_id_manager.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/cupertino.dart';

import '../../shared/repository/secure_storage_repository.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc(this.authRepository) : super(AuthInitial()) {
    on<AppStarted>(_onAppStarted);

    on<LoginUser>(_onLoginUser);

    on<RegisterUser>(_onRegisterUser);

    on<LogoutUser>(_onLogoutUser);

    on<SessionExpired>(_onSessionExpired);

    on<UseAsGuest>((event, emit) async {
      GlobalAuthManager.instance.resetSessionExpiredGuard();
      await AnalyticsService().trackGuestModeAccessed();
      final deviceId = await DeviceIdManager.getDeviceId();
      await AnalyticsService().setUserIdentity(userId: deviceId);
      emit(GuestUser());
    });

    on<VerifyEmailCode>(_onVerifyEmailCode);
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final token = await SecureStorageRepository.instance.getSecureData(SecureStorageKeys.authToken);

      if (token != null && token.isNotEmpty) {
        final isExpired = await AuthHelper.isTokenExpired();
        if (isExpired) {
          await _clearAuthData();
          emit(SessionExpiredState());
        } else {
          final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
          if (userId != null) {
            await AnalyticsService().setUserIdentity(userId: userId);
          }
          emit(AuthLoaded(AuthPurpose.login));
        }
      } else {
        final deviceId = await DeviceIdManager.getDeviceId();
        await AnalyticsService().setUserIdentity(userId: deviceId);
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

    GlobalAuthManager.instance.resetSessionExpiredGuard();
    await AnalyticsService().trackUserLoggedIn();

    final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    if (userId != null) {
      await AnalyticsService().setUserIdentity(
        userId: userId,
        userProperties: {'email': event.username},
      );
    }

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
      GlobalAuthManager.instance.resetSessionExpiredGuard();
      await AnalyticsService().trackUserRegistered();

      final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
      if (userId != null) {
        await AnalyticsService().setUserIdentity(
          userId: userId,
          userProperties: {'email': event.model.email ?? ''},
        );
      }

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
      await AnalyticsService().trackEmailVerified();

      // Identify user in analytics after email verification
      final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
      if (userId != null) {
        await AnalyticsService().setUserIdentity(
          userId: userId,
          userProperties: {'email': event.email},
        );
      }

      emit(AuthVerified());
    } catch (e) {
      debugPrint("Email verification error: $e");
      emit(AuthLoadingError(_extractErrorMessage(e)));
    }
  }

  Future<void> _onLogoutUser(LogoutUser event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await AnalyticsService().trackUserLoggedOut();
      await AnalyticsService().resetUser();
      await _clearAuthData();
      final deviceId = await DeviceIdManager.getDeviceId();
      await AnalyticsService().setUserIdentity(userId: deviceId);
      emit(GuestUser());
    } catch (e) {
      debugPrint("Logout error: $e");
      emit(AuthLoadingError("Failed to log out. Please try again."));
    }
  }

  Future<void> _onSessionExpired(SessionExpired event, Emitter<AuthState> emit) async {
    try {
      await _clearAuthData();
      final deviceId = await DeviceIdManager.getDeviceId();
      await AnalyticsService().setUserIdentity(userId: deviceId);
      emit(SessionExpiredState());
    } catch (e) {
      debugPrint("Session expiry cleanup error: $e");
      emit(SessionExpiredState());
    }
  }

  Future<void> _clearAuthData() async {
    await SecureStorageRepository.instance.deleteSecureData(SecureStorageKeys.authToken);
    await SecureStorageRepository.instance.deleteSecureData(SecureStorageKeys.userId);
    await CacheManager().clearAll();
  }

  String _extractErrorMessage(dynamic e) {
    if (e is Exception) {
      return e.toString().replaceAll("Exception:", "").trim();
    }
    return "An unknown error occurred.";
  }
}
