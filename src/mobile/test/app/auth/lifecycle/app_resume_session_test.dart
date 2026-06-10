import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/lifecycle/app_resume_session_guard.dart';
import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:airqo/src/app/auth/repository/social_auth_repository.dart';
import 'package:airqo/src/app/shared/repository/global_auth_manager.dart';
import 'package:airqo/src/app/shared/repository/session_expiry_notifier.dart';
import 'package:airqo/src/app/shared/repository/token_refresher.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

class _NullTokenRefresher implements TokenRefresher {
  @override
  Future<String?> refreshTokenIfNeeded() async => null;
}

class _SuccessfulTokenRefresher implements TokenRefresher {
  @override
  Future<String?> refreshTokenIfNeeded() async => 'fresh-token';
}

class _RecordingSessionExpiryNotifier implements SessionExpiryNotifier {
  int notifications = 0;

  @override
  void notifySessionExpired() {
    notifications += 1;
  }
}

class _FakeAuthRepository extends AuthRepository {
  @override
  Future<void> deleteUserAccount() async {}

  @override
  Future<String> loginWithEmailAndPassword(
      String username, String password) async {
    throw UnimplementedError();
  }

  @override
  Future<void> registerWithEmailAndPassword(RegisterInputModel model) async {
    throw UnimplementedError();
  }

  @override
  Future<String> requestPasswordReset(String email) async {
    throw UnimplementedError();
  }

  @override
  Future<String> updatePassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    throw UnimplementedError();
  }

  @override
  Future<String> validateResetCodeFormat(String pin) async {
    throw UnimplementedError();
  }

  @override
  Future<void> verifyEmailCode(String token, String email) async {
    throw UnimplementedError();
  }
}

class _FakeSocialAuthRepository extends SocialAuthRepository {
  @override
  Future<void> loginWithProvider(String provider) async {
    throw UnimplementedError();
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
    GlobalAuthManager.instance.resetSessionExpiredGuard();
  });

  group('AppResumeSessionGuard.handleAuthState', () {
    // My current hypothesis is that the app-resume layer may be converting a
    // temporary refresh failure into the exact session-expired signal the user
    // sees after returning to the app. If an already authenticated user
    // resumes, the refresh path returns null, and lifecycle code immediately
    // notifies session expiry, that would match the screenshot closely.
    //
    // If this test passes, we have confirmed that the lifecycle layer really
    // does turn "authenticated + resume + null refresh result" into a session
    // expiry notification.
    test('notifies session expiry when an authenticated session resumes and refresh returns null',
        () async {
      final notifier = _RecordingSessionExpiryNotifier();
      final guard = AppResumeSessionGuard(
        tokenRefresher: _NullTokenRefresher(),
        sessionExpiryNotifier: notifier,
      );

      await guard.handleAuthState(
        AuthLoaded(AuthPurpose.login),
        isMounted: true,
      );

      expect(notifier.notifications, 1);
    });

    // We also need the healthy resume baseline. If an authenticated user
    // returns to the app and refresh succeeds, lifecycle should leave the
    // session alone rather than producing the expiry signal from the failing
    // case above. If this test passes, we know resume itself is not inherently
    // a logout path; it only becomes one when refresh collapses to null.
    test('does not notify session expiry when an authenticated session resumes and refresh succeeds',
        () async {
      final notifier = _RecordingSessionExpiryNotifier();
      final guard = AppResumeSessionGuard(
        tokenRefresher: _SuccessfulTokenRefresher(),
        sessionExpiryNotifier: notifier,
      );

      await guard.handleAuthState(
        AuthLoaded(AuthPurpose.login),
        isMounted: true,
      );

      expect(notifier.notifications, 0);
    });

    // We also need to prove that resume checks are limited to authenticated
    // sessions. A guest returning to the app should not trigger refresh logic
    // or produce a session-expired signal, because there is no session to
    // restore in the first place.
    test('does not notify session expiry when a guest user resumes the app',
        () async {
      final notifier = _RecordingSessionExpiryNotifier();
      final guard = AppResumeSessionGuard(
        tokenRefresher: _NullTokenRefresher(),
        sessionExpiryNotifier: notifier,
      );

      await guard.handleAuthState(
        GuestUser(),
        isMounted: true,
      );

      expect(notifier.notifications, 0);
    });

    // Resume can fire more than once in quick succession. If refresh keeps
    // collapsing to null during those repeated callbacks, the app should still
    // drive only one session-expiry flow rather than stacking duplicate events
    // on the auth bloc.
    test('notifies session expiry only once when resume happens repeatedly',
        () async {
      final guard = AppResumeSessionGuard(
        tokenRefresher: _NullTokenRefresher(),
      );
      final bloc = AuthBloc(
        authRepository: _FakeAuthRepository(),
        socialAuthRepository: _FakeSocialAuthRepository(),
      );
      addTearDown(bloc.close);
      GlobalAuthManager.instance.setAuthBloc(bloc);

      final emittedStates = <AuthState>[];
      final subscription = bloc.stream.listen(emittedStates.add);
      addTearDown(subscription.cancel);

      await guard.handleAuthState(
        AuthLoaded(AuthPurpose.login),
        isMounted: true,
      );
      await guard.handleAuthState(
        AuthLoaded(AuthPurpose.login),
        isMounted: true,
      );

      await Future<void>.delayed(const Duration(milliseconds: 10));

      expect(
        emittedStates.whereType<SessionExpiredState>().length,
        1,
      );
      expect(
        emittedStates.whereType<GuestUser>().length,
        1,
      );
    });
  });
}
