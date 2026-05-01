import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:airqo/src/app/auth/repository/social_auth_repository.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/auth/services/oauth_service.dart';
import 'package:airqo/src/app/shared/repository/global_auth_manager.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
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
  final SocialAuthRepository socialAuthRepository;

  AuthBloc({
    required this.authRepository,
    required this.socialAuthRepository,
  }) : super(AuthInitial()) {
    on<AppStarted>(_onAppStarted);

    on<LoginUser>(_onLoginUser);

    on<RegisterUser>(_onRegisterUser);

    on<LogoutUser>(_onLogoutUser);

    on<DeleteUserAccount>(_onDeleteUserAccount);

    on<SessionExpired>(_onSessionExpired);

    on<UseAsGuest>((event, emit) async {
      GlobalAuthManager.instance.resetSessionExpiredGuard();
      await AnalyticsService().trackGuestModeAccessed();
      emit(GuestUser());
    });

    on<VerifyEmailCode>(_onVerifyEmailCode);

    on<LoginWithProvider>(_onLoginWithProvider);
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final token = await SecureStorageRepository.instance.getSecureData(SecureStorageKeys.authToken);

      if (token != null && token.isNotEmpty) {
        final isExpired = await AuthHelper.isTokenExpired();
        if (isExpired) {
          loggy.warning('Token found on app start but is expired — treating as session expiry');
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

    await AnalyticsService().trackUserLoggedIn();
    final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    if (userId != null) {
      await AnalyticsService().setUserIdentity(
        userId: userId,
        userProperties: {'email': event.username},
      );
    }
    GlobalAuthManager.instance.resetSessionExpiredGuard();
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
      await AnalyticsService().trackUserRegistered();
      final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
      if (userId != null) {
        await AnalyticsService().setUserIdentity(
          userId: userId,
          userProperties: {'email': event.model.email ?? ''},
        );
      }
      GlobalAuthManager.instance.resetSessionExpiredGuard();
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
      await _clearAuthData();
      await AnalyticsService().trackUserLoggedOut();
      await AnalyticsService().resetUser();
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
      await _clearAuthData();
      emit(SessionExpiredState());
    } catch (e) {
      debugPrint("Session expiry cleanup error: $e");
      loggy.error("Session expiry cleanup error: $e");
      emit(SessionExpiredState());
    }
  }

  Future<void> _onLoginWithProvider(LoginWithProvider event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await socialAuthRepository.loginWithProvider(event.provider);
      await AnalyticsService().trackUserLoggedIn(method: event.provider);
      final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
      if (userId != null) {
        await AnalyticsService().setUserIdentity(userId: userId);
      }
      GlobalAuthManager.instance.resetSessionExpiredGuard();
      loggy.info('OAuth login successful via ${event.provider}');
      emit(AuthLoaded(AuthPurpose.login));
    } on OAuthCancelledException {
      loggy.info('OAuth login cancelled by user');
      emit(OAuthCancelled());
    } catch (e) {
      loggy.error('OAuth login error: $e');
      emit(AuthLoadingError(_extractErrorMessage(e)));
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
